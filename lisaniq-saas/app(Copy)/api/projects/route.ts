// ══════════════════════════════════════════════════════════════
// LisanIQ — /api/projects
// GET  — list all projects for the authenticated user
// POST — create a new project
// ══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server'
import { requireAuth, ok, created, badRequest, serverError, parsePagination } from '@/lib/api-utils'
import { validateInput, CreateProjectSchema, type CreateProjectInput } from '@/lib/validators/schemas'
import { logActivity } from '@/services/activity'

export const runtime = 'nodejs'

// GET /api/projects
export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  const { supabase, user } = auth.ctx
  const { page, pageSize, offset } = parsePagination(request.nextUrl.searchParams)

  const { data, error: dbError, count } = await supabase
    .from('projects')
    .select(`
      *,
      datasets(count),
      reports(count)
    `, { count: 'exact' })
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (dbError) {
    console.error('[GET /api/projects]', dbError)
    return serverError()
  }

  return ok({
    projects:    data,
    total:       count ?? 0,
    page,
    page_size:   pageSize,
    total_pages: Math.ceil((count ?? 0) / pageSize),
  })
}

// POST /api/projects
export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  const { supabase, user } = auth.ctx

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Request body must be valid JSON.')
  }

  const { data: input, error: validationError } = validateInput(CreateProjectSchema, body)
  if (validationError) return badRequest(validationError)

  const typedInput = input as CreateProjectInput

  const { data: project, error: dbError } = await supabase
    .from('projects')
    .insert({ ...typedInput, owner_id: user.id })
    .select()
    .single()

  if (dbError) {
    console.error('[POST /api/projects]', dbError)
    return serverError('Failed to create project.')
  }

  await logActivity({
    userId:       user.id,
    action:       'project.created',
    resourceType: 'project',
    resourceId:   project.id,
    metadata:     { name: project.name },
  })

  return created(project)
}
