import Link             from 'next/link'
import { redirect }     from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { fv, formatRelative } from '@/lib/format'
import { healthColor, healthLabel } from '@/lib/kpi-engine'
import {
  PageHeader, SectionLabel, StatCard,
  StatusBadge, DatasetStatusBadge, EmptyState,
} from '@/components/dashboard/PagePrimitives'
import type { KPISnapshot, Report, Dataset } from '@/types'

export const metadata: Metadata = { title: 'Dashboard' }

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function HealthRing({ score }: { score: number }) {
  const R = 26
  const C = 2 * Math.PI * R
  const filled = (score / 100) * C
  const color  = healthColor(score)
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-label={`Health score ${score} out of 100`}>
      <circle cx="32" cy="32" r={R} fill="none" stroke="var(--line-1)" strokeWidth="5" />
      <circle cx="32" cy="32" r={R} fill="none"
        stroke={color} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={`${filled.toFixed(2)} ${(C - filled).toFixed(2)}`}
        transform="rotate(-90 32 32)"
      />
      <text x="32" y="34" textAnchor="middle" dominantBaseline="middle"
        fill={color} fontFamily="IBM Plex Mono,monospace" fontSize="13" fontWeight="800">
        {score}
      </text>
    </svg>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const [profileRes, reportsRes, datasetsRes] = await Promise.all([
    supabase
      .from('users')
      .select('full_name, plan')
      .eq('id', authUser.id)
      .single(),
    supabase
      .from('reports')
      .select('id, name, health_score, business_status, kpis, created_at')
      .eq('owner_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('datasets')
      .select('id, name, file_type, row_count, status, created_at')
      .eq('owner_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const profile  = profileRes.data
  const reports  = (reportsRes.data  ?? []) as Pick<Report, 'id' | 'name' | 'health_score' | 'business_status' | 'kpis' | 'created_at'>[]
  const datasets = (datasetsRes.data ?? []) as Pick<Dataset, 'id' | 'name' | 'file_type' | 'row_count' | 'status' | 'created_at'>[]

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  // Aggregate KPIs across loaded reports for summary strip
  const hasReports  = reports.length > 0
  const totalRevenue = reports.reduce((s, r) => s + ((r.kpis as KPISnapshot)?.revenue ?? 0), 0)
  const totalSpend   = reports.reduce((s, r) => s + ((r.kpis as KPISnapshot)?.spend   ?? 0), 0)
  const totalProfit  = totalRevenue - totalSpend
  const avgHealth    = hasReports
    ? Math.round(reports.reduce((s, r) => s + r.health_score, 0) / reports.length)
    : null

  return (
    <div className="p-6 lg:p-10 max-w-[1200px]">
      <PageHeader
        title={`Good ${greeting()}, ${firstName}`}
        subtitle="Your executive marketing overview."
        action={
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all"
            style={{ background: 'var(--sapphire)', color: '#fff', boxShadow: '0 2px 12px rgba(61,111,232,.3)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Project
          </Link>
        }
      />

      {/* ── Summary strip ── */}
      {hasReports ? (
        <>
          <SectionLabel num="01" label="Portfolio Summary" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            <StatCard label="Total Revenue" value={fv(totalRevenue, '$k')} color="var(--positive)"
              accent="linear-gradient(90deg,#1fbb8a,#80cbc4)" />
            <StatCard label="Total Spend"   value={fv(totalSpend,   '$k')} color="var(--caution)"
              accent="linear-gradient(90deg,#d4922a,#e8a44c)" />
            <StatCard label="Net Profit"
              value={fv(totalProfit, '$k')}
              color={totalProfit >= 0 ? 'var(--positive)' : 'var(--critical)'}
              accent={totalProfit >= 0 ? 'linear-gradient(90deg,#1fbb8a,#3d6fe8)' : 'linear-gradient(90deg,#dc4b4b,#e57373)'}
            />
            {avgHealth !== null && (
              <div className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--line-1)' }}>
                <HealthRing score={avgHealth} />
                <div>
                  <div className="font-data text-[9px] uppercase tracking-[2px] mb-0.5" style={{ color: 'var(--slate)' }}>Avg Health</div>
                  <div className="text-[11px] font-medium" style={{ color: healthColor(avgHealth) }}>
                    {healthLabel(avgHealth)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="mb-10">
          <div className="rounded-xl p-10 text-center"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--line-2)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(61,111,232,.1)', border: '1px solid rgba(61,111,232,.2)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--sapphire)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <p className="text-[16px] font-semibold mb-2" style={{ color: 'var(--platinum)' }}>
              No intelligence reports yet
            </p>
            <p className="text-[13px] mb-6" style={{ color: 'var(--silver)' }}>
              Create a project, upload campaign data, and save your first report.
            </p>
            <Link href="/projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold"
              style={{ background: 'var(--sapphire)', color: '#fff' }}>
              Get started
            </Link>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* ── Recent Reports ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <SectionLabel num="02" label="Recent Reports" />
            {reports.length > 0 && (
              <Link href="/reports" className="text-[12px] font-medium" style={{ color: 'var(--sapphire)' }}>
                View all
              </Link>
            )}
          </div>
          {reports.length === 0 ? (
            <EmptyState
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--slate)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
              title="No reports yet"
              body="Upload a dataset to a project and save a report."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {reports.map(r => (
                <Link key={r.id} href={`/reports/${r.id}`}
                  className="flex items-center gap-3 p-4 rounded-xl transition-colors group"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--line-1)' }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-data text-[11px] font-bold"
                    style={{ background: `${healthColor(r.health_score)}18`, border: `1.5px solid ${healthColor(r.health_score)}55`, color: healthColor(r.health_score) }}>
                    {r.health_score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate" style={{ color: 'var(--platinum)' }}>{r.name}</div>
                    <div className="text-[11px] mt-0.5 font-data" style={{ color: 'var(--slate)' }}>{formatRelative(r.created_at)}</div>
                  </div>
                  <StatusBadge status={r.business_status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Recent Datasets ── */}
        <div>
          <SectionLabel num="03" label="Recent Datasets" />
          {datasets.length === 0 ? (
            <EmptyState
              icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--slate)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>}
              title="No datasets uploaded"
              body="Go to a project and upload a CSV or Excel file."
              action={{ label: 'Go to Projects', href: '/projects' }}
            />
          ) : (
            <div className="flex flex-col gap-2">
              {datasets.map(d => (
                <div key={d.id} className="flex items-center gap-3 p-4 rounded-xl"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--line-1)' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-data text-[9px] font-bold uppercase"
                    style={{ background: 'rgba(61,111,232,.1)', border: '1px solid rgba(61,111,232,.2)', color: 'var(--sapphire)' }}>
                    {d.file_type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate" style={{ color: 'var(--platinum)' }}>{d.name}</div>
                    <div className="text-[11px] mt-0.5 font-data" style={{ color: 'var(--slate)' }}>
                      {d.row_count.toLocaleString()} rows · {formatRelative(d.created_at)}
                    </div>
                  </div>
                  <DatasetStatusBadge status={d.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
