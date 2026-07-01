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
  // 1️⃣ التحقق من الهوية والأمان (Authentication Check)
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const { user, supabase } = auth.ctx;

  try {
    // 2️⃣ قراءة وتحليل بيانات الفورم (Multipart Form Data)
    const formData = await request.formData();
    const file = formData.get('file');
    const clientId = formData.get('client_id'); // استقبال معرف العميل المستهدف من الواجهة
    const customName = formData.get('name');

    if (!file || !(file instanceof File)) {
      return badRequest('لم يتم توفير ملف CSV صالح. يرجى إرفاق ملفك.');
    }

    // 3️⃣ تهيئة أو جلب المنظمة والعميل لضمان عدم تعطل الرفع (Auto-Onboarding Architecture)
    // جلب أو إنشاء المنظمة تلقائياً للمستخدم الحالي
    const organization = await ClientService.getOrCreateOrganization(supabase, user.id, user.email || '');
    
    let finalClientId = clientId as string;
    
    // إذا لم ترسل الواجهة عميلاً محدداً، نقوم بإنشاء عميل افتراضي فوري للحساب لحفظ البيانات بأمان
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

    // 4️⃣ التحقق من قيود الباقة الحالية للمستخدم (Plan & Rate Limits Check)
    const { data: countResult } = await supabase.rpc('count_user_datasets', { p_user_id: user.id });
    const currentCount = (countResult as number) ?? 0;
    const datasetLimitCheck = checkDatasetLimit(user.plan, currentCount);
    if (!datasetLimitCheck.allowed) {
      return forbidden(datasetLimitCheck.reason ?? 'لقد وصلت للحد الأقصى المسموح به لرفع الملفات في باقتك الحالية.');
    }

    // 5️⃣ فحص حجم وحجم امتداد الملف (Validation Check)
    const maxBytes = (user.plan === 'free' ? 5 : 25) * 1024 * 1024; // 5MB للمجاني، 25MB للمدفوع
    const fileSizeCheck = checkFileSizeLimit(user.plan, file.size);
    if (!fileSizeCheck.allowed) {
      return unprocessable(fileSizeCheck.reason ?? 'حجم الملف يتجاوز الحد المسموح به لباقة حسابك.');
    }

    const validation = validateFileMetadata(file.name, file.size, maxBytes);
    if (!validation.valid || !validation.extension) {
      return unprocessable(validation.error ?? 'صيغة الملف غير مدعومة، يرجى رفع ملف بصيغة CSV فقط.');
    }

    // 6️⃣ تفكيك وقراءة محتويات ملف الـ CSV (Parsing Engine)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const parseResult = await parseUploadedFile(buffer, file.name, validation.extension);
    
    try {
      validateParsedRows(parseResult.data);
    } catch (err: any) {
      return unprocessable(err.message ?? 'الملف لا يحتوي على أرقام أو أعمدة حملات تسويقية صالحة.');
    }

    // 7️⃣ فحص حدود الأسطر المسموحة (Row Count Check)
    const rowLimitCheck = checkRowLimit(user.plan, parseResult.rowCount);
    if (!rowLimitCheck.allowed) {
      return unprocessable(rowLimitCheck.reason ?? 'عدد الأسطر داخل الملف يتجاوز الحد الأقصى المتاح لباقة حسابك.');
    }

    // 8️⃣ حجز معرف فرعي ورفع الملف الأصلي سحابياً إلى حاوية التخزين (Supabase Storage)
    const datasetId = randomUUID();
    const datasetName = typeof customName === 'string' && customName.trim()
      ? customName.trim()
      : file.name.replace(/\.[^/.]+$/, ''); // حذف الامتداد من الاسم

    const storagePath = buildStoragePath(user.id, datasetId, file.name);
    const mimeType = getMimeType(validation.extension);

    const { error: storageError } = await uploadFileToStorage(user.id, datasetId, file.name, buffer, mimeType);
    if (storageError) {
      return serverError('فشلت عملية رفع وتخزين الملف الأصلي سحابياً، يرجى المحاولة مرة أخرى.');
    }

    // 9️⃣ إدراج سجل البيانات الأساسي برابط العميل الجديد (Database Injection)
    const { error: insertError } = await supabase
      .from('datasets')
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

    // 🔟 تشغيل محرك الحسابات الإحصائية الشامل (KPIs Calculations Engine)
    const kpis = calcKPIs(parseResult.data);

    // 🧠 11: تشغيل محرك القرارات المطور وأرشفتها تاريخياً للعميل الحالي
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

    // استدعاء خدمة الأرشفة لحفظ القرارات فوراً في جداول التاريخ
    await ClientService.archiveDecisions(supabase, finalClientId, datasetId, batchDecisions);

    // 12: تحديث حالة السجل إلى "جاهز" وكاش الأسطر (Cache Rows Update)
    const firstRow = parseResult.data[0] ?? {};
    const columnMap = {
      campaign: 'campaign' in firstRow ? 'campaign' : null,
      impressions: 'impressions' in firstRow ? 'impressions' : null,
      clicks: 'clicks' in firstRow ? 'clicks' : null,
      spend: 'spend' in firstRow ? 'spend' : null,
      revenue: 'revenue' in firstRow ? 'revenue' : null,
      conversions: 'conversions' in firstRow ? 'conversions' : null,
    };

    const { error: updateError } = await supabase
      .from('datasets')
      .update({
        status: 'ready',
        column_map: columnMap,
        cached_rows: parseResult.data.slice(0, 1000), // كاش لأول 1000 سطر لتسريع العرض مستقبلاً
        row_count: parseResult.rowCount
      })
      .eq('id', datasetId);

    if (updateError) {
      return serverError('فشلت عملية معالجة وحفظ كاش البيانات النهائية.');
    }

    // 13: تسجيل النشاط في سجل الأنشطة الإدارية (Log Activity)
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

    // 14: إرجاع المخرجات النهائية بنجاح كامل (201 Created)
    return ok({
      dataset_id: datasetId,
      client_id: finalClientId,
      kpis,
      decisionsCount: batchDecisions.length,
      rows: parseResult.data
    }, 201);

  } catch (globalError: any) {
    console.error('❌ عطل حرج غير متوقع في سيرفر الرفع:', globalError);
    return serverError('حدث خطأ داخلي حرج في السيرفر أثناء معالجة ملفك.');
  }
}
