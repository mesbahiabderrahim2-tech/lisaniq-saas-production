import Link             from 'next/link'
import { redirect }     from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatRelative } from '@/lib/format'
import { PageHeader, SectionLabel, EmptyState } from '@/components/dashboard/PagePrimitives'

export const metadata: Metadata = { title: 'Projects' }

// Supabase returns count as array with {count:n} when using aggregate
type ProjectRow = {
  id: string
  name: string
  description: string | null
  color: string
  created_at: string
  datasets: { count: number }[]
  reports:  { count: number }[]
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data, error } = await supabase
    .from('projects')
    .select('id, name, description, color, created_at, datasets(count), reports(count)')
    .eq('owner_id', authUser.id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="p-6 lg:p-10">
        <div className="rounded-xl p-8 text-center" style={{ background: 'rgba(220,75,75,.06)', border: '1px solid rgba(220,75,75,.2)' }}>
          <p className="text-[13px]" style={{ color: '#f4a9a9' }}>Failed to load projects. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  const projects = (data ?? []) as ProjectRow[]

  return (
    <div className="p-6 lg:p-10 max-w-[1100px]">
      <PageHeader
        title="Projects"
        subtitle="Organise your campaign datasets into projects."
        action={
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold"
            style={{ background: 'var(--sapphire)', color: '#fff', boxShadow: '0 2px 12px rgba(61,111,232,.3)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Project
          </Link>
        }
      />

      <SectionLabel num="01" label={`${projects.length} project${projects.length !== 1 ? 's' : ''}`} />

      {projects.length === 0 ? (
        <EmptyState
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--slate)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          }
          title="No projects yet"
          body="Create your first project to start uploading campaign data."
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(p => {
            const dsCount  = p.datasets?.[0]?.count ?? 0
            const repCount = p.reports?.[0]?.count  ?? 0
            return (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="group rounded-xl p-5 flex flex-col gap-4 transition-all"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--line-1)' }}
              >
                {/* Color dot + name */}
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ background: p.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold truncate group-hover:text-sapphire transition-colors"
                      style={{ color: 'var(--platinum)' }}>
                      {p.name}
                    </div>
                    {p.description && (
                      <div className="text-[12px] mt-0.5 line-clamp-2" style={{ color: 'var(--silver)' }}>
                        {p.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 pt-2" style={{ borderTop: '1px solid var(--line-1)' }}>
                  <div className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--slate)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                    </svg>
                    <span className="font-data text-[11px]" style={{ color: 'var(--slate)' }}>{dsCount} dataset{dsCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--slate)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="font-data text-[11px]" style={{ color: 'var(--slate)' }}>{repCount} report{repCount !== 1 ? 's' : ''}</span>
                  </div>
                  <span className="ml-auto font-data text-[11px]" style={{ color: 'var(--slate)' }}>
                    {formatRelative(p.created_at)}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
