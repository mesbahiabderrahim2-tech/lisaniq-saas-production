// ══════════════════════════════════════════════════════════════
// LisanIQ — /api/reports/[id]
// GET    — fetch a full report with all computed arrays
// PATCH  — update name, notes, or starred status
// DELETE — delete report record
// ══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server'
import {
  requireAuth, ok, noContent, badRequest, notFound, serverError,
} from '@/lib/api-utils'
import { validateInput, UpdateReportSchema, type UpdateReportInput } from '@/lib/validators/schemas'
import { logActivity } from '@/services/activity'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/reports/[id]
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  const { supabase, user } = auth.ctx

  const { data, error: dbError } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (dbError || !data) return notFound('Report')

  return ok(data)
}

// PATCH /api/reports/[id]
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  const { supabase, user } = auth.ctx

  let body: unknown
  try { body = await request.json() } catch { return badRequest('Invalid JSON.') }

  const { data: input, error: validationError } = validateInput(UpdateReportSchema, body)
  if (validationError || !input) return badRequest(validationError ?? 'Invalid input.')

  const typedInput: UpdateReportInput = input

  const { data: report, error: dbError } = await supabase
    .from('reports')
    .update(typedInput)
    .eq('id', id)
    .eq('owner_id', user.id)
    .select()
    .single()

  if (dbError || !report) return notFound('Report')

  // Log star/unstar actions specifically
  if (typedInput.is_starred !== undefined) {
    await logActivity({
      userId:       user.id,
      action:       'report.starred',
      resourceType: 'report',
      resourceId:   id,
      metadata:     { starred: typedInput.is_starred },
    })
  }

  return ok(report)
}

// DELETE /api/reports/[id]
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  const { supabase, user } = auth.ctx

  const { data: report } = await supabase
    .from('reports')
    .select('name')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!report) return notFound('Report')

  const { error: dbError } = await supabase
    .from('reports')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (dbError) {
    console.error('[DELETE /api/reports/[id]]', dbError)
    return serverError()
  }

  await logActivity({
    userId:       user.id,
    action:       'report.deleted',
    resourceType: 'report',
    resourceId:   id,
    metadata:     { name: report.name },
  })

  return noContent()
}
