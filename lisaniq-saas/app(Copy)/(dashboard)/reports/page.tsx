import Link             from 'next/link'
import { redirect }     from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDate }   from '@/lib/format'
import { healthColor }  from '@/lib/kpi-engine'
import { fv }           from '@/lib/format'
import { PageHeader, SectionLabel, StatusBadge, EmptyState, Card } from '@/components/dashboard/PagePrimitives'
import type { KPISnapshot } from '@/types'

export const metadata: Metadata = { title: 'Reports' }

type ReportRow = {
  id: string; name: string; health_score: number; business_status: string
  is_starred: boolean; kpis: KPISnapshot; created_at: string; project_id: string
  notes: string | null
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data, error } = await supabase
    .from('reports')
    .select('id, name, health_score, business_status, is_starred, kpis, created_at, project_id, notes')
    .eq('owner_id', authUser.id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="p-6 lg:p-10">
        <div className="rounded-xl p-8 text-center" style={{ background: 'rgba(220,75,75,.06)', border: '1px solid rgba(220,75,75,.2)' }}>
          <p className="text-[13px]" style={{ color: '#f4a9a9' }}>Failed to load reports. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  const reports = (data ?? []) as ReportRow[]
  const starred = reports.filter(r => r.is_starred)

  return (
    <div className="p-6 lg:p-10 max-w-[1100px]">
      <PageHeader
        title="Reports"
        subtitle="Saved executive intelligence reports."
      />

      {reports.length === 0 ? (
        <EmptyState
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--slate)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          }
          title="No reports saved"
          body="Upload a dataset to a project and generate your first intelligence report."
          action={{ label: 'Go to Projects', href: '/projects' }}
        />
      ) : (
        <>
          {/* Starred */}
          {starred.length > 0 && (
            <>
              <SectionLabel num="01" label="Starred" />
              <ReportTable reports={starred} className="mb-8" />
            </>
          )}

          {/* All reports */}
          <SectionLabel num={starred.length > 0 ? '02' : '01'} label={`All Reports (${reports.length})`} />
          <ReportTable reports={reports} />
        </>
      )}
    </div>
  )
}

function ReportTable({ reports, className = '' }: { reports: ReportRow[]; className?: string }) {
  return (
    <Card padding="p-0" className={`overflow-hidden ${className}`}>
      <table className="w-full">
        <thead>
          <tr style={{ background: 'var(--surface-3)', borderBottom: '1px solid var(--line-1)' }}>
            {['Report','ROAS','ROI','Revenue','Health','Status','Date'].map(h => (
              <th key={h} className="text-left px-4 py-3 font-data text-[9.5px] uppercase tracking-[1.6px] whitespace-nowrap" style={{ color: 'var(--slate)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reports.map((r, i) => {
            const k = r.kpis as KPISnapshot
            return (
              <tr key={r.id} style={{ borderTop: i > 0 ? '1px solid var(--line-1)' : undefined }}>
                <td className="px-4 py-3">
                  <Link href={`/reports/${r.id}`} className="flex items-center gap-2 group">
                    {r.is_starred && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--gold)" stroke="none" aria-label="Starred">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    )}
                    <span className="text-[13px] font-medium group-hover:underline" style={{ color: 'var(--platinum)' }}>
                      {r.name}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 font-data text-[12px]" style={{ color: k.roas >= 4 ? 'var(--positive)' : k.roas >= 2 ? 'var(--caution)' : 'var(--critical)' }}>
                  {fv(k.roas, 'x')}
                </td>
                <td className="px-4 py-3 font-data text-[12px]" style={{ color: k.roi >= 0 ? 'var(--positive)' : 'var(--critical)' }}>
                  {fv(k.roi, '%')}
                </td>
                <td className="px-4 py-3 font-data text-[12px]" style={{ color: 'var(--positive)' }}>
                  {fv(k.revenue, '$k')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center font-data text-[10px] font-bold shrink-0"
                      style={{ background: `${healthColor(r.health_score)}18`, color: healthColor(r.health_score) }}>
                      {r.health_score}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={r.business_status} /></td>
                <td className="px-4 py-3 font-data text-[11px] whitespace-nowrap" style={{ color: 'var(--slate)' }}>
                  {formatDate(r.created_at)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}
