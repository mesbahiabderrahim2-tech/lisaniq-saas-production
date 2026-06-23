// ══════════════════════════════════════════════════════════════
// LisanIQ — /api/upload
// POST — receives multipart/form-data with a campaign file,
//         validates, parses, stores in Supabase Storage, and
//         persists metadata + cached rows to the DB.
//
// Flow:
//   1. Auth check
//   2. Plan limit check (dataset count + file size)
//   3. File validation (extension, size)
//   4. Parse file → CampaignRow[]
//   5. Validate parsed rows (required columns present)
//   6. Row count limit check
//   7. Insert dataset record (status: processing)
//   8. Upload file to Supabase Storage
//   9. Compute KPIs and computed arrays
//  10. Update dataset record (status: ready + cached data)
//  11. Log activity
// ══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server'
import { randomUUID }  from 'crypto'
import {
  requireAuth, ok, badRequest, forbidden, serverError, unprocessable,
} from '@/lib/api-utils'
import { validateFileMetadata, parseUploadedFile, validateParsedRows } from '@/services/file-parser'
import { uploadFileToStorage, getMimeType, buildStoragePath } from '@/services/storage'
import { logActivity } from '@/services/activity'
import { checkDatasetLimit, checkFileSizeLimit, checkRowLimit } from '@/services/plan-limits'
import {
  calcKPIs, calcHealth, calcBusinessStatus,
  calcStrategicInsights, calcRisks, calcRecommendations, calcOpportunities,
} from '@/lib/kpi-engine'

export const runtime = 'nodejs'

// Max body: 26MB to accommodate the 25MB file + form overhead
export const maxDuration = 60

export async function POST(request: NextRequest) {
  // ── 1. Auth ───────────────────────────────────────────────
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  const { user, supabase } = auth.ctx

  // ── 2. Parse multipart form ───────────────────────────────
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return badRequest('Request must be multipart/form-data.')
  }

  const file       = formData.get('file')
  const projectId  = formData.get('project_id')
  const customName = formData.get('name')

  if (!(file instanceof File)) {
    return badRequest('No file provided. Include a "file" field in your form.')
  }
  if (typeof projectId !== 'string' || !projectId) {
    return badRequest('project_id is required.')
  }

  // ── 3. Verify project ownership ───────────────────────────
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('owner_id', user.id)
    .single()

  if (projectError || !project) {
    return forbidden('Project not found or you do not have access.')
  }

  // ── 4. Plan limit: dataset count ──────────────────────────
  const { data: countResult } = await supabase
    .rpc('count_user_datasets', { p_user_id: user.id })

  const currentCount    = (countResult as number) ?? 0
  const datasetLimitCheck = checkDatasetLimit(user.plan, currentCount)

  if (!datasetLimitCheck.allowed) {
    return forbidden(datasetLimitCheck.reason ?? 'Dataset limit reached.')
  }

  // ── 5. Validate file metadata ─────────────────────────────
  const maxBytes          = (user.plan === 'free' ? 5 : 25) * 1024 * 1024
  const fileSizeCheck     = checkFileSizeLimit(user.plan, file.size)

  if (!fileSizeCheck.allowed) {
    return unprocessable(fileSizeCheck.reason ?? 'File too large.')
  }

  const validation = validateFileMetadata(file.name, file.size, maxBytes)

  if (!validation.valid || !validation.extension) {
    return unprocessable(validation.error ?? 'Invalid file.')
  }

  // ── 6. Parse file ─────────────────────────────────────────
  const arrayBuffer = await file.arrayBuffer()
  const buffer      = Buffer.from(arrayBuffer)

  let parseResult: Awaited<ReturnType<typeof parseUploadedFile>>
  try {
    parseResult = await parseUploadedFile(buffer, file.name, validation.extension)
  } catch (err) {
    return unprocessable(err instanceof Error ? err.message : 'Failed to parse file.')
  }

  try {
    validateParsedRows(parseResult.data)
  } catch (err) {
    return unprocessable(err instanceof Error ? err.message : 'File does not contain valid campaign data.')
  }

  // ── 7. Row limit check ────────────────────────────────────
  const rowLimitCheck = checkRowLimit(user.plan, parseResult.rowCount)
  if (!rowLimitCheck.allowed) {
    return unprocessable(rowLimitCheck.reason ?? 'Too many rows.')
  }

  // ── 8. Insert dataset record (processing) ─────────────────
  const datasetId = randomUUID()
  const datasetName = typeof customName === 'string' && customName.trim()
    ? customName.trim()
    : file.name.replace(/\.[^.]+$/, '')   // strip extension

  const storagePath = buildStoragePath(user.id, datasetId, file.name)

  const { error: insertError } = await supabase
    .from('datasets')
    .insert({
      id:         datasetId,
      owner_id:   user.id,
      project_id: projectId,
      name:       datasetName,
      file_name:  file.name,
      file_path:  storagePath,
      file_size:  file.size,
      file_type:  validation.extension,
      row_count:  parseResult.rowCount,
      column_map: {},
      status:     'processing',
    })

  if (insertError) {
    console.error('[POST /api/upload] DB insert failed:', insertError)
    return serverError('Failed to initialise dataset record.')
  }

  // ── 9. Upload file to Storage ─────────────────────────────
  const mimeType = getMimeType(validation.extension)
  const { error: storageError } = await uploadFileToStorage(
    user.id, datasetId, file.name, buffer, mimeType
  )

  if (storageError) {
    // Mark dataset as errored and surface the error
    await supabase
      .from('datasets')
      .update({ status: 'error', error_message: `Storage upload failed: ${storageError}` })
      .eq('id', datasetId)

    return serverError('File upload to cloud storage failed. Please try again.')
  }

  // ── 10. Compute all derived data ──────────────────────────
  const kpis             = calcKPIs(parseResult.data)
  const health           = calcHealth(kpis)
  const businessStatus   = calcBusinessStatus(kpis)
  const insights         = calcStrategicInsights(kpis)
  const risks            = calcRisks(kpis)
  const recommendations  = calcRecommendations(kpis)
  const opportunities    = calcOpportunities(parseResult.data)

  // Build column map snapshot
  const firstRow  = parseResult.data[0] ?? {}
  const columnMap = {
    campaign:    'campaign'    in firstRow ? 'campaign'    : null,
    impressions: 'impressions' in firstRow ? 'impressions' : null,
    clicks:      'clicks'      in firstRow ? 'clicks'      : null,
    spend:       'spend'       in firstRow ? 'spend'       : null,
    revenue:     'revenue'     in firstRow ? 'revenue'     : null,
    conversions: 'conversions' in firstRow ? 'conversions' : null,
  }

  // ── 11. Update dataset record (ready) ─────────────────────
  const { data: updatedDataset, error: updateError } = await supabase
    .from('datasets')
    .update({
      status:      'ready',
      column_map:  columnMap,
      // Cache rows for fast retrieval (cap at 1000 rows in cache)
      cached_rows: parseResult.data.slice(0, 1000),
      row_count:   parseResult.rowCount,
    })
    .eq('id', datasetId)
    .select()
    .single()

  if (updateError) {
    console.error('[POST /api/upload] status update failed:', updateError)
    return serverError('Dataset processing failed.')
  }

  // ── 12. Log activity ──────────────────────────────────────
  await logActivity({
    userId:       user.id,
    action:       'dataset.uploaded',
    resourceType: 'dataset',
    resourceId:   datasetId,
    metadata:     {
      file_name: file.name,
      file_size: file.size,
      row_count: parseResult.rowCount,
      roas:      Math.round(kpis.roas * 100) / 100,
      roi:       Math.round(kpis.roi  * 100) / 100,
    },
  })

  return ok({
    dataset:        updatedDataset,
    kpis,
    health,
    business_status: businessStatus,
    insights,
    risks,
    recommendations,
    opportunities,
    rows:           parseResult.data,
  }, 201)
}
