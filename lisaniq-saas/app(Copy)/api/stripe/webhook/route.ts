// ══════════════════════════════════════════════════════════════
// LisanIQ — /api/stripe/webhook
// POST — receives and processes Stripe webhook events.
//
// Handled events:
//   • checkout.session.completed      → subscription created
//   • customer.subscription.updated   → plan change / renewal
//   • customer.subscription.deleted   → cancellation → downgrade to free
//   • invoice.payment_succeeded       → extend period
//   • invoice.payment_failed          → mark past_due
//
// Security: every request is verified with the Stripe signature.
// Uses the admin client to bypass RLS for cross-user updates.
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { constructWebhookEvent, mapStripePlanName, mapStripeStatus } from '@/services/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// Disable body parsing — Stripe signature requires the raw body
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 })
  }

  const rawBody = await request.arrayBuffer()
  const payload = Buffer.from(rawBody)

  let event: Stripe.Event
  try {
    event = constructWebhookEvent(payload, signature)
  } catch (err) {
    console.error('[webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  const admin = createAdminClient()

  try {
    switch (event.type) {

      // ── New subscription via checkout ─────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode !== 'subscription' || !session.subscription) break

        const userId     = session.metadata?.supabase_user_id
        if (!userId) {
          console.error('[webhook] checkout.session.completed missing user_id metadata')
          break
        }

        const stripe     = (await import('@/services/stripe')).getStripeClient()
        const sub        = await stripe.subscriptions.retrieve(session.subscription as string)
        const priceId    = sub.items.data[0]?.price.id ?? ''
        const plan       = mapStripePlanName(priceId)
        const status     = mapStripeStatus(sub.status)

        // Upsert subscription record
        await admin.from('subscriptions').upsert({
          user_id:               userId,
          stripe_subscription_id: sub.id,
          stripe_customer_id:    sub.customer as string,
          stripe_price_id:       priceId,
          plan,
          status,
          current_period_start:  new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end:    new Date(sub.current_period_end   * 1000).toISOString(),
          cancel_at_period_end:  sub.cancel_at_period_end,
          trial_end:             sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        }, { onConflict: 'user_id' })

        // Persist stripe IDs on the user record
        await admin.from('users').update({
          stripe_customer_id:    sub.customer as string,
          stripe_subscription_id: sub.id,
        }).eq('id', userId)

        break
      }

      // ── Subscription updated (upgrade, downgrade, renewal) ─
      case 'customer.subscription.updated': {
        const sub     = event.data.object as Stripe.Subscription
        const userId  = sub.metadata?.supabase_user_id
        if (!userId) break

        const priceId = sub.items.data[0]?.price.id ?? ''
        const plan    = mapStripePlanName(priceId)
        const status  = mapStripeStatus(sub.status)

        await admin.from('subscriptions').upsert({
          user_id:               userId,
          stripe_subscription_id: sub.id,
          stripe_customer_id:    sub.customer as string,
          stripe_price_id:       priceId,
          plan,
          status,
          current_period_start:  new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end:    new Date(sub.current_period_end   * 1000).toISOString(),
          cancel_at_period_end:  sub.cancel_at_period_end,
          canceled_at:           sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
          trial_end:             sub.trial_end   ? new Date(sub.trial_end   * 1000).toISOString() : null,
        }, { onConflict: 'user_id' })

        break
      }

      // ── Subscription cancelled ────────────────────────────
      case 'customer.subscription.deleted': {
        const sub    = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id
        if (!userId) break

        await admin.from('subscriptions').update({
          plan:       'free',
          status:     'canceled',
          canceled_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id)

        // Downgrade user plan — trigger in DB will also do this
        await admin.from('users').update({ plan: 'free' }).eq('id', userId)

        break
      }

      // ── Payment succeeded → confirm period ────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.subscription) break

        await admin.from('subscriptions').update({
          status: 'active',
          current_period_end: invoice.period_end
            ? new Date(invoice.period_end * 1000).toISOString()
            : undefined,
        }).eq('stripe_subscription_id', invoice.subscription as string)

        break
      }

      // ── Payment failed → mark past_due ────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.subscription) break

        await admin.from('subscriptions').update({
          status: 'past_due',
        }).eq('stripe_subscription_id', invoice.subscription as string)

        break
      }

      default:
        // Unhandled event — not an error, just ignore
        break
    }
  } catch (err) {
    console.error(`[webhook] error processing event ${event.type}:`, err)
    // Return 200 to prevent Stripe from retrying — log for manual investigation
  }

  return NextResponse.json({ received: true })
}
