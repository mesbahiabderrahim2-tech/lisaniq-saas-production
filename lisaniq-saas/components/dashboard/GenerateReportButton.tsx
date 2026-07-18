'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  projectId: string
  datasetId: string
  datasetName: string
}

export default function GenerateReportButton({
  projectId,
  datasetId,
  datasetName,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function generateReport() {
    try {
      setLoading(true)

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          dataset_id: datasetId,
          name: `${datasetName} Analysis`,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate report')
      }

      const reportId = result.data.id

      router.push(`/reports/${reportId}`)
      router.refresh()
    } catch (error) {
      console.error(error)

      alert(
        error instanceof Error
          ? error.message
          : 'Failed to generate report'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={generateReport}
      disabled={loading}
      className="px-5 py-2 rounded-lg font-medium text-[13px]"
      style={{
        background: 'var(--positive)',
        color: '#ffffff',
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? 'Generating...' : 'Generate Analysis'}
    </button>
  )
}
