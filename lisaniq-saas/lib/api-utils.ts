// ══════════════════════════════════════════════════════════════
// LisanIQ — API Utilities
// Shared helpers for all Route Handlers.
// ══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@/types'

// ── Response factories ──────────────────────────────────────

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data, error: null }, { status })
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json({ data, error: null }, { status: 201 })
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ data: null, error: message }, { status: 400 })
}

export function unauthorized(message = 'Authentication required.'): NextResponse {
  return NextResponse.json({ data: null, error: message }, { status: 401 })
}

export function forbidden(message = 'You do not have permission to perform this action.'): NextResponse {
  return NextResponse.json({ data: null, error: message }, { status: 403 })
}

export function notFound(resource = 'Resource'): NextResponse {
  return NextResponse.json({ data: null, error: `${resource} not found.` }, { status: 404 })
}

export function conflict(message: string): NextResponse {
  return NextResponse.json({ data: null, error: message }, { status: 409 })
}

export function unprocessable(message: string): NextResponse {
  return NextResponse.json({ data: null, error: message }, { status: 422 })
}

export function tooManyRequests(message: string): NextResponse {
  return NextResponse.json({ data: null, error: message }, { status: 429 })
}

export function serverError(message = 'An unexpected error occurred.'): NextResponse {
  return NextResponse.json({ data: null, error: message }, { status: 500 })
}

// ── Auth guard ──────────────────────────────────────────────

export interface AuthContext {
  user:     User
  supabase: Awaited<ReturnType<typeof createClient>>
}

type AuthSuccess = { success: true;  ctx: AuthContext }
type AuthFailure = { success: false; response: NextResponse }
type AuthResult  = AuthSuccess | AuthFailure

/**
 * Verifies the request session and returns a typed discriminated union.
 *
 * Callers narrow with:
 *   const auth = await requireAuth()
 *   if (!auth.success) return auth.response
 *   // auth.ctx is fully typed here
 *
 * Responsibilities (authentication only — no business logic):
 *   1. Validate the session via supabase.auth.getUser().
 *   2. Load the user profile from public.users.
 *   3. If the profile is unexpectedly missing, delegate recovery to
 *      ensureUserProfile() — a dedicated service with UPSERT semantics.
 *
 * The trigger (handle_new_user) is the primary profile-creation path.
 * ensureUserProfile() is the defensive fallback, called only when
 * maybeSingle() returns null (i.e. the trigger did not fire).
 *
 * Design:
 *   • maybeSingle() → null means 0 rows (profile missing).
 *   • maybeSingle() → error means a real database problem.
 *   These two cases are now distinct and handled separately.
 */
export async function requireAuth(): Promise<AuthResult> {
  // ── Step 1: validate session ───────────────────────────────
  const supabase = await createClient()
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

  if (authError || !authUser) {
    return { success: false, response: unauthorized() }
  }

  // ── Step 2: load the profile ───────────────────────────────
  // maybeSingle() returns null (no error) when 0 rows match,
  // and an error object only for real database failures.
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle()

  if (profileError) {
    console.error(
      '[requireAuth] profile query error:',
      profileError.code, profileError.message,
      'User:', authUser.id,
    )
    return { success: false, response: serverError('Could not load user profile.') }
  }

  if (profile) {
    // Happy path — trigger fired correctly on registration.
    return { success: true, ctx: { user: profile as User, supabase } }
  }

  // ── Step 3: defensive recovery ─────────────────────────────
  // Profile is missing. The trigger (handle_new_user) should have
  // created it, but did not. Delegate to the dedicated service.
  // This is logged as a WARNING inside ensureUserProfile() itself.
  const { ensureUserProfile } = await import('@/services/user-profile')
  const result = await ensureUserProfile(authUser)

  if (!result.ok) {
    return { success: false, response: serverError('Could not initialise user profile.') }
  }

  return { success: true, ctx: { user: result.profile, supabase } }
}

// ── Pagination helpers ──────────────────────────────────────

export interface PaginationParams {
  page:     number
  pageSize: number
  offset:   number
}

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const page     = Math.max(1, parseInt(searchParams.get('page')      ?? '1',  10))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const offset   = (page - 1) * pageSize
  return { page, pageSize, offset }
}
