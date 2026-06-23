// ══════════════════════════════════════════════════════════════
// LisanIQ — /auth/callback
// Handles the OAuth and email magic-link redirect from Supabase.
// Exchanges the code for a session and redirects the user.
//
// NOTE: This file must live at app/auth/callback/route.ts
// (a real path segment, not a route group) because Supabase's
// emailRedirectTo / resetPasswordForEmail redirectTo URLs point
// to the literal path /auth/callback. A (auth) route group does
// NOT contribute a path segment in Next.js, so the previous
// location at app/(auth)/callback/route.ts resolved to /callback
// and produced 404s on every confirmation and reset link.
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] exchange failed:', error.message)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    )
  }

  // Ensure the redirect target is on our own origin (open redirect protection)
  const safeNext = next.startsWith('/') ? next : '/dashboard'
  return NextResponse.redirect(`${origin}${safeNext}`)
}
