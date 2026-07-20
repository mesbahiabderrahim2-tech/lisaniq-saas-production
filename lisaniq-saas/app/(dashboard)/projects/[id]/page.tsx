import Link             from 'next/link'
import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatBytes } from '@/lib/format'
import { healthColor } from '@/lib/kpi-engine'
import {
  SectionLabel, StatusBadge, DatasetStatusBadge, EmptyState, Card,
} from '@/components/dashboard/PagePrimitives'

import GenerateReportButton from '@/components/dashboard/GenerateReportButton'

export const metadata: Metadata = { title: 'Project' }

interface Props { params: Promise<{ id: string }> }

type ProjectDetail = {
  id: string; name: string; description: string | null; color: string
  created_at: string; updated_at: string
  datasets: {
    id: string; name: string; file_name: string; file_type: string
    row_count: number; file_size: number; status: string; created_at: string
  }[]
  reports: {
    id: string; name: string; health_score: number
    business_status: string; is_starred: boolean; created_at: string
  }[]
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data, error } = await supabase
    .from('projects')
    .select(`
      id, name, description, color, created_at, updated_at,
      datasets(id, name, file_name, file_type, row_count, file_size, status, created_at),
      reports(id, name, health_score, business_status, is_starred, created_at)
    `)
    .eq('id', id)
    .eq('owner_id', authUser.id)
    .single()
  
console.log('PROJECT PAGE DATA:', data)
console.log('PROJECT PAGE ERROR:', error)

if (error || !data) notFound()

const project  = data as ProjectDetail
const datasets = project.datasets ?? []
const reports  = project.reports  ?? []

return (
  <div style={{ color: 'white', padding: '40px' }}>
    <h1>{project.name}</h1>
    <p>PROJECT PAGE WORKS</p>
  </div>
)
}

      {/* Project header */}
      <div className="flex items-start gap-4 mb-8 flex-wrap">
        <div className="w-3.5 h-3.5 rounded-full mt-2 shrink-0" style={{ background: project.color }} />
        <div className="flex-1">
          <h1 className="font-display text-2xl lg:text-[28px] leading-tight mb-1" style={{ color: 'var(--platinum)' }}>
            {project.name}
          </h1>
          {project.description && (
            <p className="text-[13px]" style={{ color: 'var(--silver)' }}>{project.description}</p>
          )}
          <p className="text-[11px] font-data mt-2" style={{ color: 'var(--slate)' }}>
            Created {formatDate(project.created_at)}
          </p>
        </div>
      </div>
      
      {/* ── Upload Dataset ── */}
<SectionLabel num="01" label="Upload Dataset" />

<Card className="mb-8">
  <div className="flex items-center justify-between gap-4 flex-wrap">
    <div>
      <h3
        className="text-[15px] font-semibold mb-1"
        style={{ color: 'var(--platinum)' }}
      >
        Upload Marketing Dataset
      </h3>

      <p
        className="text-[12px]"
        style={{ color: 'var(--silver)' }}
      >
        Import CSV or Excel campaign data to start analysis.
      </p>
    </div>

    <button
      className="px-4 py-2 rounded-lg font-medium text-[13px]"
      style={{
        background: 'var(--sapphire)',
        color: '#fff',
      }}
    >
      Upload Dataset
    </button>
  </div>
</Card>
      
      {/* ── Datasets ── */}
      <SectionLabel num="02" label={`Datasets (${datasets.length})`} />
      {datasets.length === 0 ? (
        <EmptyState
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--slate)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>}
          title="No datasets yet"
          body="Upload a CSV or Excel file to start generating intelligence reports."
        />
      ) : (
        <Card padding="p-0" className="mb-8 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--surface-3)', borderBottom: '1px solid var(--line-1)' }}>
                {['Name','Type','Rows','Size','Status','Uploaded'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-data text-[9.5px] uppercase tracking-[1.6px]" style={{ color: 'var(--slate)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datasets.map((d, i) => (
                <tr key={d.id} style={{ borderTop: i > 0 ? '1px solid var(--line-1)' : undefined }}>
                  <td className="px-4 py-3">
                    <div className="text-[13px] font-medium" style={{ color: 'var(--platinum)' }}>{d.name}</div>
                    <div className="text-[11px] font-data" style={{ color: 'var(--slate)' }}>{d.file_name}</div>
                  </td>
                  <td className="px-4 py-3 font-data text-[11px] uppercase" style={{ color: 'var(--silver)' }}>{d.file_type}</td>
                  <td className="px-4 py-3 font-data text-[12px]" style={{ color: 'var(--silver)' }}>{d.row_count.toLocaleString()}</td>
                  <td className="px-4 py-3 font-data text-[12px]" style={{ color: 'var(--silver)' }}>{formatBytes(d.file_size)}</td>
                  <td className="px-4 py-3"><DatasetStatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 font-data text-[11px]" style={{ color: 'var(--slate)' }}>{formatDate(d.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      
{/* ── Generate Analysis ── */}
<SectionLabel num="03" label="Generate Analysis" />

<Card className="mb-8">
  <div className="flex items-center justify-between gap-6 flex-wrap">

    <div className="flex-1 min-w-[280px]">
      <h3
        className="text-[15px] font-semibold mb-1"
        style={{ color: 'var(--platinum)' }}
      >
        Generate Strategic Intelligence Report
      </h3>

      <p
        className="text-[12px] leading-relaxed"
        style={{ color: 'var(--silver)' }}
      >
        Analyze uploaded datasets and generate executive-level
        marketing insights, KPI diagnostics, risk detection,
        and strategic recommendations.
      </p>
      {datasets.length > 0 && (
  <div
    className="mt-4 rounded-lg p-4"
    style={{
      background: 'var(--surface-3)',
      border: '1px solid var(--line-1)',
    }}
  >
    <div
      className="font-data text-[10px] uppercase tracking-[1.2px] mb-3"
      style={{ color: 'var(--slate)' }}
    >
      Datasets Selected For Analysis
    </div>

    <div className="flex flex-col gap-2">
      {datasets.map((dataset) => (
        <div
          key={dataset.id}
          className="flex items-center justify-between gap-3"
        >
          <div>
            <div
              className="text-[13px] font-medium"
              style={{ color: 'var(--platinum)' }}
            >
              {dataset.name}
            </div>

            <div
              className="text-[11px]"
              style={{ color: 'var(--slate)' }}
            >
              {dataset.file_name}
            </div>
          </div>

          <DatasetStatusBadge status={dataset.status} />
        </div>
      ))}
    </div>
  </div>
)}
    </div>

    <div
      className="flex items-center gap-4 px-4 py-3 rounded-lg"
      style={{
        background: 'var(--surface-3)',
        border: '1px solid var(--line-1)',
      }}
    >
      <div>
        <div
          className="font-data text-[10px] uppercase tracking-[1.2px]"
          style={{ color: 'var(--slate)' }}
        >
          Available Datasets
        </div>

        <div
          className="text-[18px] font-bold"
          style={{ color: 'var(--platinum)' }}
        >
          {datasets.length}
        </div>
      </div>
{datasets.length === 0 ? (
  <button
    disabled
    className="px-5 py-2 rounded-lg font-medium text-[13px]"
    style={{
      background: 'var(--surface-2)',
      color: 'var(--slate)',
      cursor: 'not-allowed',
    }}
  >
    Generate Analysis
  </button>
) : (
  <GenerateReportButton
    projectId={project.id}
    datasetId={datasets[0].id}
    datasetName={datasets[0].name}
  />
)}
    </div>

  </div>
</Card>
      
      {/* ── Reports ── */}
      <SectionLabel num="04" label={`Reports History (${reports.length})`} />
      {reports.length === 0 ? (
        <EmptyState
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--slate)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
          title="No reports saved"
          body="Upload a dataset then generate and save an intelligence report."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {reports.map(r => (
            <Link key={r.id} href={`/reports/${r.id}`}
              className="flex items-center gap-4 p-4 rounded-xl transition-colors group"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--line-1)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-data text-[11px] font-bold"
                style={{ background: `${healthColor(r.health_score)}18`, border: `1.5px solid ${healthColor(r.health_score)}55`, color: healthColor(r.health_score) }}>
                {r.health_score}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium truncate" style={{ color: 'var(--platinum)' }}>{r.name}</span>
                  {r.is_starred && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--gold)" stroke="var(--gold)" strokeWidth="1.5" aria-label="Starred">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  )}
                </div>
                <div className="text-[11px] font-data mt-0.5" style={{ color: 'var(--slate)' }}>{formatDate(r.created_at)}</div>
              </div>
              <StatusBadge status={r.business_status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
