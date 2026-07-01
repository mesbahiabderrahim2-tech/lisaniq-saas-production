// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { requireAuth, ok, badRequest, forbidden, serverError, unprocessable } from '@/lib/api-utils';
import { validateFileMetadata, parseUploadedFile, validateParsedRows } from '@/services/file-parser';
import { uploadFileToStorage, getMimeType, buildStoragePath } from '@/services/storage';
import { logActivity } from '@/services/activity';
import { checkDatasetLimit, checkFileSizeLimit, checkRowLimit } from '@/services/plan-limits';
import { 
  calcKPIs, calcHealth, calcBusinessStatus, 
  calcStrategicInsights, calcRisks, calcRecommendations, calcOpportunities 
} from '@/lib/kpi-engine';
import { MetricsEngine } from '@/lib/metrics-engine'; // استدعاء المحرك الذي أنشأناه في الخطوة 2

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // 1. Auth Check
  const auth = await requireAuth();
  if (!auth.success) return auth.response;

  const { user, supabase } = auth.ctx;

  // 2. Parse multipart form
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (e) {
    return badRequest('Request must be multipart/form-data.');
  }

  const file = formData.get('file');
  const projectId = formData.get('project_id');
  const customName = formData.get('name');

  if (!(file instanceof File)) {
    return badRequest('No file provided. Include a "file" field in your form.');
  }
  if (typeof projectId !== 'string' || !projectId) {
    return badRequest('project_id is required.');
  }

  // 3. Verify project ownership
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('owner_id', user.id)
    .single();

  if (projectError || !project) {
    return forbidden('Project not found or you do not have access.');
  }

  // 4. Plan limit: dataset count
  const { data: countResult } = await supabase
    .rpc('count_user_datasets', { p_user_id: user.id });

  const currentCount = (countResult as number) ?? 0;
  const datasetLimitCheck = checkDatasetLimit(user.plan, currentCount);

  if (!datasetLimitCheck.allowed) {
    return forbidden(datasetLimitCheck.reason ?? 'Dataset limit reached.');
  }

  // 5. Validate file metadata
  const maxBytes = (user.plan === 'free' ? 5 : 25) * 1024 * 1024;
  const fileSizeCheck = checkFileSizeLimit(user.plan, file.size);

  if (!fileSizeCheck.allowed) {
    return unprocessable(fileSizeCheck.reason ?? 'File too large.');
  }

  const validation = validateFileMetadata(file.name, file.size, maxBytes);
  if (!validation.valid || !validation.extension) {
    return unprocessable(validation.error ?? 'Invalid file.');
  }

  // 6. Parse file
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let parseResult;
  try {
    parseResult = await parseUploadedFile(buffer, file.name, validation.extension);
  } catch (err: any) {
    return unprocessable(err.message ?? 'Failed to parse file.');
  }

  try {
    validateParsedRows(parseResult.data);
  } catch (err: any) {
    return unprocessable(err.message ?? 'File does not contain valid campaign data.');
  }

  // 7. Row limit check
  const rowLimitCheck = checkRowLimit(user.plan, parseResult.rowCount);
  if (!rowLimitCheck.allowed) {
    return unprocessable(rowLimitCheck.reason ?? 'Too many rows.');
  }

  // 8. Insert dataset record (processing)
  const datasetId = randomUUID();
  const datasetName = typeof customName === 'string' && customName.trim()
    ? customName.trim()
    : file.name.replace(/\.[^/.]+$/, ""); // strip extension

  const storagePath = buildStoragePath(user.id, datasetId, file.name);

  const { error: insertError } = await supabase
    .from('datasets')
    .insert({
      id: datasetId,
      owner_id: user.id,
      project_id: projectId,
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
    console.error('[POST /api/upload] DB insert failed:', insertError);
    return serverError('Failed to initialize dataset record.');
  }

  // 9. Upload file to Storage
  const mimeType = getMimeType(validation.extension);
  const { error: storageError } = await uploadFileToStorage(
    user.id, datasetId, file.name, buffer, mimeType
  );

  if (storageError) {
    await supabase
      .from('datasets')
      .update({ status: 'error', error_message: `Storage upload failed: ${storageError}` })
      .eq('id', datasetId);

    return serverError('File upload to cloud storage failed. Please try again.');
  }

  // 10. Compute all derived data (نظام محرك المقاييس القديم لديك)
  const kpis = calcKPIs(parseResult.data);
  const health = calcHealth(kpis);
  const businessStatus = calcBusinessStatus(kpis);
  const insights = calcStrategicInsights(kpis);
  const risks = calcRisks(kpis);
  const recommendations = calcRecommendations(kpis);
  const opportunities = calcOpportunities(parseResult.data);

  // 🔥 🚀 الميزة الجديدة المضافة: معالجة وحفظ تفاصيل الحملات الحقيقية في الجداول التي أنشأناها في الخطوة 1
  try {
    for (const row of parseResult.data) {
      // تمرير السطر لمحرك المقاييس لحساب قيم السطر بدقة
      const processed = MetricsEngine.calculateCampaignMetrics({
        campaign_id: row.campaign_id || row.id || `c-${randomUUID().substring(0,6)}`,
        campaign_name: row.campaign_name || row.campaign || 'حملة غير مسمى',
        platform: row.platform || 'generic',
        spend: parseFloat(row.spend || row.cost || 0),
        clicks: parseInt(row.clicks || 0),
        impressions: parseInt(row.impressions || 0),
        conversions: prejudicesConversions(row),
        target_cpa: parseFloat(row.target_cpa || 20),
        target_roas: parseFloat(row.target_roas || 3)
      });

      // إدخال الحملة أو تحديثها ببيانات العميل الحالية
      const { data: campaignData } = await supabase
        .from('campaigns')
        .upsert(
          { 
            user_id: user.id, 
            campaign_external_id: row.campaign_id || row.id || processed.spend.toString(), 
            campaign_name: row.campaign_name || row.campaign || 'حملة تسويقية', 
            platform: row.platform || 'generic' 
          },
          { onConflict: 'user_id,campaign_external_id' }
        )
        .select()
        .single();

      if (campaignData) {
        // حقن المقاييس الفعلية بداخل جدول الـ Metrics المستقر
        await supabase
          .from('campaign_metrics')
          .insert({
            campaign_id: campaignData.id,
            spend: processed.spend,
            clicks: processed.clicks,
            impressions: processed.impressions,
            ctr: processed.ctr,
            cpc: processed.cpc,
            cpa: processed.cpa,
            roas: processed.roas,
            conversions: processed.conversions,
            target_cpa: processed.target_cpa,
            target_roas: processed.target_roas
          });
      }
    }
  } catch (metricsMappingError) {
    console.error('تحذير غير حرج أثناء حقن مقاييس الحملات:', metricsMappingError);
    // نترك المعالجة تستمر حتى لا يتعطل العميل إذا كانت بنية أسطر الـ CSV غريبة
  }

  // Build column map snapshot
  const firstRow = parseResult.data[0] ?? {};
  const columnMap = {
    campaign: 'campaign' in firstRow ? 'campaign' : null,
    impressions: 'impressions' in firstRow ? 'impressions' : null,
    clicks: 'clicks' in firstRow ? 'clicks' : null,
    spend: 'spend' in firstRow ? 'spend' : null,
    revenue: 'revenue' in firstRow ? 'revenue' : null,
    conversions: 'conversions' in firstRow ? 'conversions' : null,
  };

  // 11. Update dataset record (ready)
  const { data: updatedDataset, error: updateError } = await supabase
    .from('datasets')
    .update({
      status: 'ready',
      column_map: columnMap,
      cached_rows: parseResult.data.slice(0, 1000),
      row_count: parseResult.rowCount,
    })
    .eq('id', datasetId)
    .select()
    .single();

  if (updateError) {
    console.error('[POST /api/upload] status update failed:', updateError);
    return serverError('Dataset processing failed.');
  }

  // 12. Log activity
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
      roi: Math.round(kpis.roi * 100) / 100,
    },
  });

  return ok({
    dataset: updatedDataset,
    kpis,
    health,
    business_status: businessStatus,
    insights,
    risks,
    recommendations,
    opportunities,
    rows: parseResult.data,
  }, 201);
}

// دالة مساعدة لتأمين قراءة عمود التحويلات والمبيعات من المنصات المختلفة
function prejudicesConversions(row: any): number {
  return parseInt(row.conversions || row.purchases || row.leads || row.purchases_count || 0);
}
