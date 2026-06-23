// ══════════════════════════════════════════════════════════════
// LisanIQ — /api/datasets/[id]
// GET    — fetch dataset metadata + cached campaign rows
// PATCH  — rename dataset
// DELETE — delete record + remove file from Storage
// ══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server'
import {
  requireAuth, ok, noContent, badRequest, notFound, serverError,
} from '@/lib/api-utils'
import { validateInput, UpdateDatasetSchema, type UpdateDatasetInput } from '@/lib/validators/schemas'
import { deleteFileFromStorage } from '@/services/storage'
import { logActivity } from '@/services/activity'

export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET /api/datasets/[id]
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  const { supabase, user } = auth.ctx

  const { data, error: dbError } = await supabase
    .from('datasets')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (dbError || !data) return notFound('Dataset')

  return ok(data)
}

// PATCH /api/datasets/[id]
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  const { supabase, user } = auth.ctx

  let body: unknown
  try { body = await request.json() } catch { return badRequest('Invalid JSON.') }

  const { data: input, error: validationError } = validateInput(UpdateDatasetSchema, body)
  if (validationError || !input) return badRequest(validationError ?? 'Invalid input.')
  const typedInput: UpdateDatasetInput = input

  const { data: dataset, error: dbError } = await supabase
    .from('datasets')
    .update({ name: typedInput.name })
    .eq('id', id)
    .eq('owner_id', user.id)
    .select()
    .single()

  if (dbError || !dataset) return notFound('Dataset')

  return ok(dataset)
}

// DELETE /api/datasets/[id]
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  const { supabase, user } = auth.ctx

  // Fetch the file path before deleting
  const { data: dataset } = await supabase
    .from('datasets')
    .select('file_path, name')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!dataset) return notFound('Dataset')

  // Delete the database record (cascades to reports)
  const { error: dbError } = await supabase
    .from('datasets')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (dbError) {
    console.error('[DELETE /api/datasets/[id]]', dbError)
    return serverError('Failed to delete dataset.')
  }

  // Remove file from Storage
  await deleteFileFromStorage(dataset.file_path)

  await logActivity({
    userId:       user.id,
    action:       'dataset.deleted',
    resourceType: 'dataset',
    resourceId:   id,
    metadata:     { name: dataset.name },
  })

  return noContent()
}
