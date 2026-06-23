// ══════════════════════════════════════════════════════════════
// LisanIQ — /api/projects/[id]
// GET    — fetch a single project with its datasets and reports
// PATCH  — update project name/description/color
// DELETE — delete project and cascade to datasets + reports
// ══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server'
import { requireAuth, ok, noContent, badRequest, notFound, serverError } from '@/lib/api-utils'
import { validateInput, UpdateProjectSchema, type UpdateProjectInput } from '@/lib/validators/schemas'
import { logActivity } from '@/services/activity'
import { deleteFileFromStorage } from '@/services/storage'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/projects/[id]
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  const { supabase, user } = auth.ctx

  const { data, error: dbError } = await supabase
    .from('projects')
    .select(`
      *,
      datasets(id, name, file_name, file_type, row_count, status, created_at),
      reports(id, name, health_score, business_status, is_starred, created_at)
    `)
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (dbError || !data) return notFound('Project')

  return ok(data)
}

// PATCH /api/projects/[id]
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  const { supabase, user } = auth.ctx

  let body: unknown
  try { body = await request.json() } catch { return badRequest('Invalid JSON.') }

  const { data: input, error: validationError } = validateInput(UpdateProjectSchema, body)
  if (validationError) return badRequest(validationError)

  const typedInput = input as UpdateProjectInput

  const { data: project, error: dbError } = await supabase
    .from('projects')
    .update(typedInput)
    .eq('id', id)
    .eq('owner_id', user.id)
    .select()
    .single()

  if (dbError || !project) return notFound('Project')

  await logActivity({
    userId:       user.id,
    action:       'project.updated',
    resourceType: 'project',
    resourceId:   id,
    metadata:     { updated_fields: Object.keys(typedInput) },
  })

  return ok(project)
}

// DELETE /api/projects/[id]
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  const { supabase, user } = auth.ctx

  // Fetch all dataset file paths before cascade delete
  const { data: datasets } = await supabase
    .from('datasets')
    .select('file_path')
    .eq('project_id', id)
    .eq('owner_id', user.id)

  // Delete project (cascades to datasets + reports by FK)
  const { error: dbError } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (dbError) {
    console.error('[DELETE /api/projects/[id]]', dbError)
    return serverError('Failed to delete project.')
  }

  // Clean up Storage files after successful DB delete
  if (datasets?.length) {
    await Promise.allSettled(
      datasets.map((d: { file_path: string }) => deleteFileFromStorage(d.file_path))
    )
  }

  await logActivity({
    userId:       user.id,
    action:       'project.deleted',
    resourceType: 'project',
    resourceId:   id,
    metadata:     { datasets_deleted: datasets?.length ?? 0 },
  })

  return noContent()
}
