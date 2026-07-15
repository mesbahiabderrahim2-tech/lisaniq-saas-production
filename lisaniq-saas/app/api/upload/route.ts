// app/api/upload/route.ts
import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { requireAuth, ok, badRequest, forbidden, serverError, unprocessable } from '@/lib/api-utils';
import { validateFileMetadata, parseUploadedFile, validateParsedRows } from '@/services/file-parser';
import { uploadFileToStorage, buildStoragePath, getMimeType } from '@/services/storage';
import { logActivity } from '@/services/activity';
import { checkDatasetLimit, checkFileSizeLimit, checkRowLimit } from '@/services/plan-limits';
import { calcKPIs } from '@/lib/kpi-engine';
import { DecisionEngine } from '@/lib/decision-engine';
import { ClientService } from '@/services/client';

export const runtime = 'nodejs';
export const maxDuration = 60; // أقصى مدة لتنفيذ السيرفر لمنع انقطاع الاتصال في الملفات الكبيرة

export async function POST(request: NextRequest) {
  // 1️⃣ التحقق من الهوية والأمان
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const { user, supabase } = auth.ctx;

  try {
    // 2️⃣ قراءة وتحليل بيانات الفورم (Multipart Form Data)
const formData = await request.formData();

const file = formData.get('file');
const clientId = formData.get('client_id') as string;
const projectId = formData.get('project_id') as string;
const customName = formData.get('name') as string;

if (!projectId) {
  return badRequest('Project ID is required.');
}

if (!file || !(file instanceof File)) {
  return badRequest('صيغة غير صالحة. يرجى إرفاق ملف CSV لم يتم توفير ملف.');
}

    // 3️⃣ (Auto-Onboarding Architecture) تهيئة أو جلب المنظمة والعميل لضمان عدم تعطل الرفع
    const organization = await ClientService.getOrCreateOrganization(supabase, user.id, user.email || '');
    
    let finalClientId = clientId as string;

    if (!finalClientId || typeof finalClientId !== 'string') {
      const { data: defaultClient } = await supabase
        .from('clients')
        .select('id')
        .eq('organization_id', organization.id)
        .limit(1)
        .maybeSingle();

      if (defaultClient) {
        finalClientId = defaultClient.id;
      } else {
        const newDefaultClient = await ClientService.createClient(supabase, {
          organization_id: organization.id,
          name: 'العميل الافتراضي (حساب عام)',
          industry: 'General'
        });
        finalClientId = newDefaultClient.id;
      }
    }

    // ========================================================
    // 🛡️ 4️⃣ نظام الحصص الفعلي والقيود لـ SaaS (Plan & Rate Limits Check)
    // ========================================================
    // سحب عدد الملفات التي رفعها المستخدم فعلياً من قاعدة البيانات
    const { count: currentCount, error: countError } = await supabase
      .from('datasets')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id);

    if (countError) throw countError;

    // فحص قيد الخطة الأساسي (الحد الأقصى الافتراضي للباقة المجانية هو 5 ملفات)
    const FREE_PLAN_LIMIT = 5;
    if (currentCount !== null && currentCount >= FREE_PLAN_LIMIT) {
      return forbidden(`لقد وصلت للحد الأقصى المسموح به لرفع الملفات في باقتك الحالية (${FREE_PLAN_LIMIT} ملفات). يرجى الترقية للحساب المتقدم.`);
    }

    // 5️⃣ فحص حجم وحجم امتداد الملف
    const maxBytes = (user.plan === 'pro' ? 25 : 5) * 1024 * 1024; // 5MB للمجاني، 25MB للمحترفين
    if (file.size > maxBytes) {
      return unprocessable('حجم الملف يتجاوز الحد المسموح به لباقة حسابك.');
    }

    const validation = validateFileMetadata(file.name, file.size, maxBytes);
    if (!validation.valid || !validation.extension) {
      return unprocessable('فقط ملفات CSV مدعومة. يرجى رفع ملف بصيغة سليمة.');
    }

    // 6️⃣ تفكيك وقراءة محتويات ملف الـ CSV
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parseResult = await parseUploadedFile(buffer, file.name, validation.extension);

    // 7️⃣ فحص حدود الأسطر البرمجية المسموحة داخل الملف
    const maxRows = user.plan === 'pro' ? 50000 : 1000;
    if (parseResult.rowCount > maxRows) {
      return unprocessable('عدد الأسطر داخل الملف يتجاوز الحد الأقصى المسموح به لباقة حسابك الحالي.');
    }

    // 8️⃣ حجز معرف سحابي ورفع الملف الأصلي إلى حاوية التخزين (Supabase Storage)
    const datasetId = randomUUID();
    const datasetName = typeof customName === 'string' && customName.trim()
      ? customName.trim()
      : file.name.replace(/\.[^/.]+$/, '');

    const storagePath = buildStoragePath(user.id, datasetId, file.name);
    const mimeType = getMimeType(validation.extension);

    const { error: storageError } = await uploadFileToStorage(user.id, datasetId, file.name, buffer, mimeType);
    if (storageError) {
      return serverError('فشلت عملية رفع وتخزين الملف الأصلي سحابياً، يرجى المحاولة مرة أخرى.');
    }

    // 9️⃣ إدراج سجل البيانات الأساسي برابط التخزين في جدول قاعدة البيانات
    const { error: insertError } = await supabase
      .from('datasets')
      .select('*')
      .insert({
        id: datasetId,
        owner_id: user.id,
        name: datasetName,
        file_name: file.name,
        file_path: storagePath,
        file_size: file.size,
        file_type: validation.extension,
        row_count: parseResult.rowCount,
        column_map: {},
        status: 'processing'
      });

    if (insertError) {
      return serverError('فشل تهيئة وحفظ سجل البيانات في قاعدة البيانات.');
    }

    // 🔟 تشغيل محرك الحسابات الإحصائية الإجمالية الـ KPIs
    const kpis = calcKPIs(parseResult.data);

    // 1️⃣1️⃣ تشغيل محرك القرارات الذكي وأرشفتها في جداول الأرشيف التاريخي للعميل
    const batchDecisions: any[] = [];
    parseResult.data.forEach((row: any) => {
      const singleCampaignDecisions = DecisionEngine.evaluateCampaign({
        campaign_name: row.campaign_name || row.campaign || 'حملة تسويقية',
        platform: row.platform || 'generic',
        spend: parseFloat(row.spend || 0),
        clicks: parseInt(row.clicks || 0),
        impressions: parseInt(row.impressions || 0),
        ctr: parseFloat(row.click_through_rate || row.ctr || 0),
        cpc: parseFloat(row.cpc || 0),
        cpa: parseFloat(row.cost_per_purchase || row.cpa || 0),
        roas: parseFloat(row.purchase_roas || row.roas || 0),
        conversions: parseInt(row.conversions || 0),
        target_cpa: parseFloat(row.target_cpa || 20),
        target_roas: parseFloat(row.target_roas || 3)
      });
      batchDecisions.push(...singleCampaignDecisions);
    });

    // استدعاء خدمة الأرشفة لحفظ كافة التوصيات فوراً في جداول الأرشيف تاريخياً
    await ClientService.archiveDecisions(supabase, finalClientId, datasetId, batchDecisions);

    // 1️⃣2️⃣ تحديث حالة السجل إلى "جاهز" وحفظ كاش البيانات النهائي
    const { error: updateError } = await supabase
      .from('datasets')
      .update({
        status: 'ready',
        column_map: {
          campaign: 'campaign' in parseResult.data[0] ? 'campaign' : null,
          impressions: 'impressions' in parseResult.data[0] ? 'impressions' : null,
          clicks: 'clicks' in parseResult.data[0] ? 'clicks' : null,
          spend: 'spend' in parseResult.data[0] ? 'spend' : null,
          revenue: 'revenue' in parseResult.data[0] ? 'revenue' : null,
          conversions: 'conversions' in parseResult.data[0] ? 'conversions' : null,
        },
        cached_rows: parseResult.data.slice(0, 1000), // كاش لأول 1000 سطر لتسريع العرض مستقبلاً
        row_count: parseResult.rowCount
      })
      .eq('id', datasetId);

    if (updateError) {
      return serverError('فشلت عملية معالجة وحفظ كاش البيانات النهائية.');
    }

    // 1️⃣3️⃣ تسجيل النشاط في سجل الأنشطة الإدارية (Log Activity)
    await logActivity({
      userId: user.id,
      action: 'dataset.uploaded',
      resourceType: 'dataset',
      resourceId: datasetId,
      metadata: {
        file_name: file.name,
        file_size: file.size,
        row_count: parseResult.rowCount,
        roas: Math.round(kpis.roas * 100) / 100,
        roi: Math.round(kpis.roi * 100) / 100
      }
    });

    // 1️⃣4️⃣ إرجاع المخرجات والنتائج كاملة للواجهة الأمامية بنجاح
    return ok({
      dataset_id: datasetId,
      client_id: finalClientId,
      kpis,
      decisionsCount: batchDecisions.length,
      rows: parseResult.data
    });

  } catch (globalError: any) {
    console.error('❌ عطل حرج غير متوقع في سيرفر الرفع:', globalError);
    return serverError('حدث خطأ داخلي حرج في السيرفر أثناء معالجة ملفك.');
  }
}
