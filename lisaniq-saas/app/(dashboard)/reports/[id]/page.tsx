import Link                      from 'next/link'
import { redirect, notFound }    from 'next/navigation'
import type { Metadata }          from 'next'
import { createClient }           from '@/lib/supabase/server'
import { fv, formatDate }         from '@/lib/format'
import { healthColor, healthLabel, calcHealth } from '@/lib/kpi-engine'
import {
  SectionLabel, StatusBadge, RiskBadge, InsightIcon, Card, StatCard,
} from '@/components/dashboard/PagePrimitives'
import type { Report, KPISnapshot, StrategicInsight, RiskItem, Recommendation } from '@/types'

export const metadata: Metadata = { title: 'Report' }

interface Props { params: Promise<{ id: string }> }

function HealthGauge({ score }: { score: number }) {
  const R = 52
  const C = 2 * Math.PI * R
  const filled = (score / 100) * C
  const color  = healthColor(score)
  return (
    <svg width="130" height="130" viewBox="0 0 130 130" aria-label={`Health ${score}/100`}>
      <circle cx="65" cy="65" r={R} fill="none" stroke="var(--line-1)" strokeWidth="9" />
      <circle cx="65" cy="65" r={R} fill="none"
        stroke={color} strokeWidth="9" strokeLinecap="round"
        strokeDasharray={`${filled.toFixed(2)} ${(C - filled).toFixed(2)}`}
        transform="rotate(-90 65 65)"
      />
      <text x="65" y="63" textAnchor="middle" dominantBaseline="central"
        fill={color} fontFamily="IBM Plex Mono,monospace" fontSize="24" fontWeight="800">
        {score}
      </text>
      <text x="65" y="83" textAnchor="middle"
        fill="var(--silver)" fontFamily="Inter,sans-serif" fontSize="10">
        {healthLabel(score)}
      </text>
    </svg>
  )
}

export default async function ReportDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .eq('owner_id', authUser.id)
    .single()

  if (error || !data) notFound()

  const report       = data as Report
  const k            = report.kpis as KPISnapshot
  const health       = calcHealth(k)
  const insights     = (report.insights     ?? []) as StrategicInsight[]
  const risks        = (report.risks        ?? []) as RiskItem[]
  const recs         = (report.recommendations ?? []) as Recommendation[]

  const priorityColors = ['var(--critical)', 'var(--caution)', 'var(--sapphire)', 'var(--positive)', 'var(--slate)']

  return (
    <div className="p-6 lg:p-10 max-w-[1100px]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-[12px]" style={{ color: 'var(--slate)' }}>
        <Link href="/reports" style={{ color: 'var(--sapphire)' }}>Reports</Link>
        <span>/</span>
        <span style={{ color: 'var(--silver)' }}>{report.name}</span>
      </div>

      {/* Report header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-display text-2xl lg:text-[28px] leading-tight mb-2" style={{ color: 'var(--platinum)' }}>
            {report.name}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={report.business_status} />
            <span className="font-data text-[11px]" style={{ color: 'var(--slate)' }}>
              Generated {formatDate(report.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* ── §1 KPI Summary ── */}
      <SectionLabel num="01" label="KPI Summary" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <StatCard label="Revenue"     value={fv(k.revenue, '$k')} color="var(--positive)" accent="linear-gradient(90deg,#1fbb8a,#80cbc4)" />
        <StatCard label="Ad Spend"    value={fv(k.spend,   '$k')} color="var(--caution)"  accent="linear-gradient(90deg,#d4922a,#e8a44c)" />
        <StatCard label="Net Profit"  value={fv(k.profit,  '$k')}
          color={k.profit >= 0 ? 'var(--positive)' : 'var(--critical)'}
          accent={k.profit >= 0 ? 'linear-gradient(90deg,#1fbb8a,#3d6fe8)' : 'linear-gradient(90deg,#dc4b4b,#e57373)'} />
        <StatCard label="ROAS"        value={fv(k.roas, 'x')}
          color={k.roas >= 4 ? 'var(--positive)' : k.roas >= 2 ? 'var(--caution)' : 'var(--critical)'}
          accent="linear-gradient(90deg,#7c4dff,#3d6fe8)" />
        <StatCard label="ROI"         value={fv(k.roi,  '%')}
          color={k.roi >= 0 ? 'var(--positive)' : 'var(--critical)'}
          accent="linear-gradient(90deg,#1fbb8a,#3d6fe8)" />
        <StatCard label="CTR"         value={fv(k.ctr,  '%')} color="var(--info)"     accent="linear-gradient(90deg,#4d8ef0,#64b5f6)" />
        <StatCard label="CPA"         value={fv(k.cpa,  '$')}
          color={k.cpa <= 15 ? 'var(--positive)' : k.cpa <= 35 ? 'var(--caution)' : 'var(--critical)'}
          accent="linear-gradient(90deg,#dc4b4b,#e57373)" />
        <StatCard label="Conv. Rate"  value={fv(k.cvr,  '%')} color="var(--positive)" accent="linear-gradient(90deg,#7c4dff,#1fbb8a)" />
      </div>

      {/* ── §2 Health Score ── */}
      <SectionLabel num="02" label="Marketing Health Score" />
      <Card className="mb-10">
        <div className="flex items-center gap-8 flex-wrap">
          <HealthGauge score={report.health_score} />
          <div className="flex-1 min-w-[220px]">
            <p className="text-[13px] mb-5" style={{ color: 'var(--silver)' }}>
              Composite score across four performance dimensions, scored 0–100 against industry benchmarks.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(health.factors).map(([key, fac]) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-data text-[9.5px] uppercase tracking-[1.2px]" style={{ color: 'var(--slate)' }}>
                      {fac.label} ({key})
                    </span>
                    <span className="font-data text-[11px] font-bold" style={{ color: fac.color }}>
                      {fac.score}<span style={{ color: 'var(--slate)', fontWeight: 400 }}>/{fac.max}</span>
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--line-1)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.round((fac.score / fac.max) * 100)}%`, background: fac.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ── §3 Strategic Insights ── */}
      {insights.length > 0 && (
        <>
          <SectionLabel num="03" label="Strategic Insights" />
          <div className="grid sm:grid-cols-2 gap-3 mb-10">
            {insights.map((ins, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--line-1)' }}>
                <InsightIcon icon={ins.icon} color={ins.color} bg={ins.bg} />
                <div className="flex-1 min-w-0">
                  <div className="font-data text-[9.5px] uppercase tracking-[1.8px] mb-1" style={{ color: ins.color }}>
                    {ins.tag}
                  </div>
                  <div className="text-[13px] leading-relaxed mb-1.5" style={{ color: 'var(--platinum)' }}>{ins.text}</div>
                  <div className="font-data text-[11px]" style={{ color: 'var(--silver)' }}>{ins.metric}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── §4 Risk Detection ── */}
      {risks.length > 0 && (
        <>
          <SectionLabel num="04" label="Risk Detection" />
          <div className="flex flex-col gap-3 mb-10">
            {risks.map((r, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--line-1)' }}>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      border: `1.5px solid ${r.severity === 'Critical' ? 'rgba(220,75,75,.4)' : r.severity === 'Caution' ? 'rgba(212,146,42,.4)' : 'rgba(31,187,138,.4)'}`,
                      color:  r.severity === 'Critical' ? 'var(--critical)' : r.severity === 'Caution' ? 'var(--caution)' : 'var(--positive)',
                    }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                      {r.severity === 'Critical'
                        ? <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>
                        : r.severity === 'Caution'
                          ? <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
                          : <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>
                      }
                    </svg>
                  </div>
                  <RiskBadge severity={r.severity} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold mb-1.5"
                    style={{ color: r.severity === 'Critical' ? '#f4a9a9' : r.severity === 'Caution' ? '#e8c27a' : '#7be8c7' }}>
                    {r.title}
                  </div>
                  <div className="text-[12.5px] leading-relaxed mb-2" style={{ color: 'var(--silver)' }}>{r.impact}</div>
                  <div className="inline-flex items-center gap-1.5 font-data text-[11px] px-2 py-1 rounded"
                    style={{ background: 'rgba(74,88,120,.15)', color: 'var(--silver)', border: '1px solid var(--line-2)' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    {r.action}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-data text-[16px] font-bold"
                    style={{ color: r.severity === 'Critical' ? 'var(--critical)' : r.severity === 'Caution' ? 'var(--caution)' : 'var(--positive)' }}>
                    {r.value}
                  </div>
                  <div className="font-data text-[9px] uppercase tracking-[1px]" style={{ color: 'var(--slate)' }}>{r.kpi}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── §5 Recommendations ── */}
      {recs.length > 0 && (
        <>
          <SectionLabel num="05" label="Executive Recommendations" />
          <div className="flex flex-col gap-3">
            {recs.map((rec, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--line-1)' }}>
                <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-[12px] font-bold font-data"
                  style={{ background: priorityColors[i] ?? 'var(--slate)', color: i < 2 ? '#fff' : i === 2 ? '#fff' : '#0a1020' }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-data text-[9.5px] uppercase tracking-[1.8px] mb-1" style={{ color: 'var(--slate)' }}>{rec.area}</div>
                  <div className="text-[14px] font-semibold mb-1" style={{ color: 'var(--platinum)' }}>{rec.action}</div>
                  <div className="text-[12.5px] leading-relaxed mb-2" style={{ color: 'var(--silver)' }}>{rec.rationale}</div>
                  <span className="inline-block font-data text-[10px] uppercase tracking-[1px] px-2 py-0.5 rounded"
                    style={{ background: 'rgba(61,111,232,.1)', color: 'var(--sapphire)', border: '1px solid rgba(61,111,232,.2)' }}>
                    {rec.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
