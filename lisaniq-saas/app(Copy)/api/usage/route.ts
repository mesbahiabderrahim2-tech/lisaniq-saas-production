// ══════════════════════════════════════════════════════════════
// LisanIQ — /api/usage
// GET — returns the authenticated user's current usage vs limits.
// Used by the billing UI and upload flow to show progress bars.
// ══════════════════════════════════════════════════════════════

import { requireAuth, ok, serverError } from '@/lib/api-utils'
import { getPlanLimits } from '@/services/plan-limits'

export const runtime = 'nodejs'

export async function GET() {
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  const { supabase, user } = auth.ctx
  const limits = getPlanLimits(user.plan)

  // Parallel count queries
  const [datasetsResult, reportsResult, subResult] = await Promise.all([
    supabase.rpc('count_user_datasets', { p_user_id: user.id }),
    supabase.rpc('count_user_reports',  { p_user_id: user.id }),
    supabase
      .from('subscriptions')
      .select('plan,status,current_period_end,cancel_at_period_end,trial_end')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (datasetsResult.error || reportsResult.error) {
    console.error('[GET /api/usage]', datasetsResult.error, reportsResult.error)
    return serverError()
  }

  const datasetCount = (datasetsResult.data as number) ?? 0
  const reportCount  = (reportsResult.data  as number) ?? 0

  return ok({
    plan:  user.plan,
    limits: {
      datasets:       limits.maxDatasets,
      reports:        limits.maxReports,
      file_size_mb:   limits.maxFileSizeMB,
      rows_per_file:  limits.maxRowsPerDataset,
      can_export_pdf: limits.canExportPDF,
      can_access_api: limits.canAccessAPI,
    },
    usage: {
      datasets: datasetCount,
      reports:  reportCount,
    },
    subscription: subResult.data ?? null,
  })
}
