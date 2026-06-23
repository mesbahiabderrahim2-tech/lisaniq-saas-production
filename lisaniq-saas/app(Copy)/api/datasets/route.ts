// ══════════════════════════════════════════════════════════════
// LisanIQ — /api/datasets
// GET — list datasets for the authenticated user
// ══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server'
import { requireAuth, ok, serverError, parsePagination } from '@/lib/api-utils'

export const runtime = 'nodejs'

// GET /api/datasets
export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  const { supabase, user } = auth.ctx
  const { page, pageSize, offset } = parsePagination(request.nextUrl.searchParams)
  const projectId = request.nextUrl.searchParams.get('project_id')

  let query = supabase
    .from('datasets')
    .select('id,name,file_name,file_type,file_size,row_count,status,created_at,project_id', { count: 'exact' })
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data, error: dbError, count } = await query

  if (dbError) {
    console.error('[GET /api/datasets]', dbError)
    return serverError()
  }

  return ok({
    datasets:    data,
    total:       count ?? 0,
    page,
    page_size:   pageSize,
    total_pages: Math.ceil((count ?? 0) / pageSize),
  })
}
