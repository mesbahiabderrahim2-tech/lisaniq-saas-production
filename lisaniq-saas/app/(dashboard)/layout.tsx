import { redirect }       from 'next/navigation'
import { createClient }   from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import type { Metadata }  from 'next'
import type { User }      from '@/types'

export const metadata: Metadata = {
  title: { default: 'Dashboard', template: '%s — LisanIQ' },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ── Auth check ────────────────────────────────────────────────────────────
  // Middleware already redirects unauthenticated requests, but we verify here
  // as a defence-in-depth measure and to load the full user profile.
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  // Load the public user profile (plan, full_name, etc.)
  const { data: profile } = await supabase
    .from('users')
    .select('id, email, full_name, plan')
    .eq('id', authUser.id)
    .single()

  // If the profile row doesn't exist yet (race condition on first sign-up),
  // fall back to the auth email so the UI never shows an empty header.
  const user: Pick<User, 'email' | 'full_name' | 'plan'> = {
    email:     profile?.email     ?? authUser.email ?? '',
    full_name: profile?.full_name ?? null,
    plan:      (profile?.plan as User['plan']) ?? 'free',
  }

  return (
    // Skip-to-content link for keyboard / screen-reader users
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium"
        style={{ background: 'var(--sapphire)', color: '#fff' }}
      >
        Skip to content
      </a>

      <DashboardShell
        email={user.email}
        fullName={user.full_name}
        plan={user.plan}
      >
        {children}
      </DashboardShell>
    </>
  )
}
