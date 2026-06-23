// ══════════════════════════════════════════════════════════════
// LisanIQ — /api/reports
// GET  — list saved reports for the authenticated user
// POST — save a generated report to the database
// ══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server'
import {
  requireAuth, ok, created, badRequest, forbidden, serverError, parsePagination,
} from '@/lib/api-utils'
import { validateInput, CreateReportSchema, type CreateReportInput } from '@/lib/validators/schemas'
import { checkReportLimit } from '@/services/plan-limits'
import { logActivity } from '@/services/activity'
import {
  calcKPIs, calcHealth, calcBusinessStatus,
  calcStrategicInsights, calcRisks, calcRecommendations, calcOpportunities,
} from '@/lib/kpi-engine'
import type { CampaignRow } from '@/types'

export const runtime = 'nodejs'

// GET /api/reports
export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  const { supabase, user } = auth.ctx
  const { page, pageSize, offset } = parsePagination(request.nextUrl.searchParams)
  const projectId  = request.nextUrl.searchParams.get('project_id')
  const datasetId  = request.nextUrl.searchParams.get('dataset_id')
  const starredOnly = request.nextUrl.searchParams.get('starred') === 'true'

  let query = supabase
    .from('reports')
    .select(`
      id, name, health_score, business_status, is_starred,
      notes, created_at, updated_at,
      dataset_id, project_id,
      kpis
    `, { count: 'exact' })
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (projectId)   query = query.eq('project_id', projectId)
  if (datasetId)   query = query.eq('dataset_id', datasetId)
  if (starredOnly) query = query.eq('is_starred', true)

  const { data, error: dbError, count } = await query

  if (dbError) {
    console.error('[GET /api/reports]', dbError)
    return serverError()
  }

  return ok({
    reports:     data,
    total:       count ?? 0,
    page,
    page_size:   pageSize,
    total_pages: Math.ceil((count ?? 0) / pageSize),
  })
}

// POST /api/reports
// Body: { dataset_id, project_id, name, notes? }
// The server re-computes all KPIs from cached rows to ensure integrity.
export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  const { supabase, user } = auth.ctx

  // ── Plan limit check ──────────────────────────────────────
  const { data: countResult } = await supabase
    .rpc('count_user_reports', { p_user_id: user.id })

  const currentCount   = (countResult as number) ?? 0
  const reportLimitCheck = checkReportLimit(user.plan, currentCount)

  if (!reportLimitCheck.allowed) {
    return forbidden(reportLimitCheck.reason ?? 'Report limit reached.')
  }

  // ── Validate input ────────────────────────────────────────
  let body: unknown
  try { body = await request.json() } catch { return badRequest('Invalid JSON.') }

  const { data: input, error: validationError } = validateInput(CreateReportSchema, body)
  if (validationError || !input) return badRequest(validationError ?? 'Invalid input.')

  const typedInput: CreateReportInput = input

  // ── Load dataset ──────────────────────────────────────────
  const { data: dataset, error: dsError } = await supabase
    .from('datasets')
    .select('id, owner_id, project_id, cached_rows, status')
    .eq('id', typedInput.dataset_id)
    .eq('owner_id', user.id)
    .single()

  if (dsError || !dataset) {
    return badRequest('Dataset not found or you do not have access.')
  }

  if (dataset.project_id !== typedInput.project_id) {
    return badRequest('Dataset does not belong to the specified project.')
  }

  if (dataset.status !== 'ready') {
    return badRequest('Dataset is not ready. Wait for processing to complete.')
  }

  if (!dataset.cached_rows || !(dataset.cached_rows as CampaignRow[]).length) {
    return badRequest('Dataset has no campaign data. Re-upload the file.')
  }

  // ── Compute all KPIs server-side ──────────────────────────
  const rows             = dataset.cached_rows as CampaignRow[]
  const kpis             = calcKPIs(rows)
  const health           = calcHealth(kpis)
  const businessStatus   = calcBusinessStatus(kpis)
  const insights         = calcStrategicInsights(kpis)
  const risks            = calcRisks(kpis)
  const recommendations  = calcRecommendations(kpis)
  const opportunities    = calcOpportunities(rows)

  // ── Persist report ────────────────────────────────────────
  const { data: report, error: dbError } = await supabase
    .from('reports')
    .insert({
      owner_id:        user.id,
      project_id:      typedInput.project_id,
      dataset_id:      typedInput.dataset_id,
      name:            typedInput.name,
      notes:           typedInput.notes ?? null,
      kpis,
      health_score:    health.total,
      business_status: businessStatus.label,
      insights,
      risks,
      recommendations,
      opportunities,
      is_starred:      false,
    })
    .select()
    .single()

  if (dbError) {
    console.error('[POST /api/reports]', dbError)
    return serverError('Failed to save report.')
  }

  await logActivity({
    userId:       user.id,
    action:       'report.generated',
    resourceType: 'report',
    resourceId:   report.id,
    metadata:     {
      name:           report.name,
      health_score:   health.total,
      business_status: businessStatus.label,
      roas:           Math.round(kpis.roas * 100) / 100,
    },
  })

  return created(report)
}
