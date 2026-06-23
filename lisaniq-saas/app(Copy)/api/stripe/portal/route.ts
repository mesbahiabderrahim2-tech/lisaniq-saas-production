// ══════════════════════════════════════════════════════════════
// LisanIQ — /api/stripe/portal
// POST — creates a Stripe Billing Portal session URL.
// Users are redirected here to manage their subscription,
// cancel, or update payment methods.
// ══════════════════════════════════════════════════════════════

import { requireAuth, ok, badRequest, serverError } from '@/lib/api-utils'
import { createPortalSession } from '@/services/stripe'

export const runtime = 'nodejs'

export async function POST() {
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  const { user } = auth.ctx

  if (!user.stripe_customer_id) {
    return badRequest('No active subscription found. Subscribe to a plan first.')
  }

  try {
    const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const returnUrl = `${appUrl}/billing`

    const session = await createPortalSession(user.stripe_customer_id, returnUrl)

    return ok({ url: session.url })
  } catch (err) {
    console.error('[POST /api/stripe/portal]', err)
    return serverError('Failed to open billing portal. Please try again.')
  }
}
