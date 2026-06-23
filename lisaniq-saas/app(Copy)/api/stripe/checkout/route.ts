// ══════════════════════════════════════════════════════════════
// LisanIQ — /api/stripe/checkout
// POST — creates a Stripe Checkout Session and returns the URL.
// The client redirects to this URL to complete payment.
// ══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server'
import { requireAuth, ok, badRequest, serverError } from '@/lib/api-utils'
import { validateInput, CreateCheckoutSchema, type CreateCheckoutInput } from '@/lib/validators/schemas'
import {
  getOrCreateStripeCustomer,
  createCheckoutSession,
  STRIPE_PRICES,
} from '@/services/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth.success) return auth.response

  const { user } = auth.ctx

  // Already on pro or enterprise — no need to go through checkout
  if (user.plan !== 'free') {
    return badRequest(`You are already on the ${user.plan} plan.`)
  }

  let body: unknown
  try { body = await request.json() } catch { return badRequest('Invalid JSON.') }

  const { data: input, error: validationError } = validateInput(CreateCheckoutSchema, body)
  if (validationError || !input) return badRequest(validationError ?? 'Invalid input.')

  const typedInput: CreateCheckoutInput = input

  // Validate price_id is one we recognise
  const validPriceIds = Object.values(STRIPE_PRICES).filter(Boolean)
  if (!validPriceIds.includes(typedInput.price_id)) {
    return badRequest('Invalid price ID.')
  }

  try {
    // ── Ensure Stripe customer exists ─────────────────────────
    const customerId = await getOrCreateStripeCustomer(
      user.email,
      user.full_name,
      user.id,
      user.stripe_customer_id ?? null
    )

    // If we just created a new customer, persist the ID
    if (customerId !== user.stripe_customer_id) {
      const admin = createAdminClient()
      await admin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // ── Create checkout session ───────────────────────────────
    const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const successUrl = `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl  = `${appUrl}/billing`

    const session = await createCheckoutSession({
      customerId,
      priceId:    typedInput.price_id,
      userId:     user.id,
      email:      user.email,
      successUrl,
      cancelUrl,
    })

    return ok({ url: session.url })
  } catch (err) {
    console.error('[POST /api/stripe/checkout]', err)
    return serverError('Failed to create checkout session. Please try again.')
  }
}
