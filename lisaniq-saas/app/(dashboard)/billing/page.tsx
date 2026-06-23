import { redirect }     from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDate }   from '@/lib/format'
import { PageHeader, SectionLabel, Card } from '@/components/dashboard/PagePrimitives'
import { StripeButton } from '@/components/dashboard/StripeButton'

export const metadata: Metadata = { title: 'Billing' }

const PLAN_FEATURES: Record<string, string[]> = {
  free: [
    '3 datasets',
    '5 saved reports',
    'Up to 5 MB per file',
    'Up to 5,000 rows per dataset',
    'Core KPI dashboard',
  ],
  pro: [
    'Unlimited datasets',
    'Unlimited saved reports',
    'Up to 25 MB per file',
    'Up to 500,000 rows per dataset',
    'PDF export',
    'API access',
    'Priority support',
  ],
  enterprise: [
    'Everything in Pro',
    'Unlimited file size',
    'Unlimited rows',
    'Custom integrations',
    'Dedicated support',
    'SLA guarantee',
  ],
}

type SubRow = {
  plan: string
  status: string
  current_period_end: string | null
  cancel_at_period_end: boolean
  trial_end: string | null
}

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const [profileRes, subRes, usageRes] = await Promise.all([
    supabase
      .from('users')
      .select('plan, stripe_customer_id')
      .eq('id', authUser.id)
      .single(),
    supabase
      .from('subscriptions')
      .select('plan, status, current_period_end, cancel_at_period_end, trial_end')
      .eq('user_id', authUser.id)
      .maybeSingle(),
    Promise.all([
      supabase.rpc('count_user_datasets', { p_user_id: authUser.id }),
      supabase.rpc('count_user_reports',  { p_user_id: authUser.id }),
    ]),
  ])

  const currentPlan     = (profileRes.data?.plan ?? 'free') as 'free' | 'pro' | 'enterprise'
  const hasStripeCustomer = !!profileRes.data?.stripe_customer_id
  const sub             = subRes.data as SubRow | null
  const datasetCount    = (usageRes[0].data as number) ?? 0
  const reportCount     = (usageRes[1].data as number) ?? 0

  const isTrialing = sub?.status === 'trialing'
  const isPastDue  = sub?.status === 'past_due' || sub?.status === 'unpaid'
  const isCanceled = sub?.status === 'canceled' || sub?.status === 'incomplete_expired'

  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ?? ''

  return (
    <div className="p-6 lg:p-10 max-w-[900px]">
      <PageHeader
        title="Billing"
        subtitle="Manage your plan and subscription."
      />

      {/* ── Payment warning banners ── */}
      {isPastDue && (
        <div className="rounded-lg p-4 mb-6 flex items-start gap-3"
          style={{ background: 'rgba(220,75,75,.08)', border: '1px solid rgba(220,75,75,.25)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f4a9a9" strokeWidth="2" strokeLinecap="round" className="mt-0.5 shrink-0" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <p className="text-[13px] font-semibold mb-0.5" style={{ color: '#f4a9a9' }}>Payment overdue</p>
            <p className="text-[12px]" style={{ color: '#f4a9a9' }}>
              Your last payment failed. Update your payment method to keep Pro access.
            </p>
          </div>
        </div>
      )}

      {isCanceled && currentPlan !== 'free' && (
        <div className="rounded-lg p-4 mb-6" style={{ background: 'rgba(212,146,42,.08)', border: '1px solid rgba(212,146,42,.25)' }}>
          <p className="text-[13px]" style={{ color: '#e8c27a' }}>
            Your subscription has been canceled and will revert to Free at the end of the billing period.
          </p>
        </div>
      )}

      {/* ── Current plan card ── */}
      <SectionLabel num="01" label="Current Plan" />
      <Card className="mb-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-display text-[22px]" style={{ color: 'var(--platinum)' }}>
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </span>
              {isTrialing && (
                <span className="font-data text-[10px] uppercase tracking-[1.5px] px-2 py-0.5 rounded"
                  style={{ background: 'rgba(201,168,76,.12)', border: '1px solid rgba(201,168,76,.3)', color: 'var(--gold)' }}>
                  Trial
                </span>
              )}
            </div>

            {/* Billing period */}
            {sub?.current_period_end && (
              <p className="text-[12px] mb-4" style={{ color: 'var(--slate)' }}>
                {sub.cancel_at_period_end
                  ? `Cancels on ${formatDate(sub.current_period_end)}`
                  : isTrialing && sub.trial_end
                    ? `Trial ends ${formatDate(sub.trial_end)}`
                    : `Renews ${formatDate(sub.current_period_end)}`
                }
              </p>
            )}

            {/* Usage */}
            <div className="flex gap-6">
              <div>
                <div className="font-data text-[18px] font-bold" style={{ color: 'var(--platinum)' }}>{datasetCount}</div>
                <div className="font-data text-[10px] uppercase tracking-[1px]" style={{ color: 'var(--slate)' }}>
                  {currentPlan === 'free' ? `/ 3 Datasets` : 'Datasets'}
                </div>
              </div>
              <div>
                <div className="font-data text-[18px] font-bold" style={{ color: 'var(--platinum)' }}>{reportCount}</div>
                <div className="font-data text-[10px] uppercase tracking-[1px]" style={{ color: 'var(--slate)' }}>
                  {currentPlan === 'free' ? `/ 5 Reports` : 'Reports'}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {currentPlan === 'free' ? (
              <StripeButton
                label="Upgrade to Pro"
                endpoint="/api/stripe/checkout"
                body={{ price_id: priceId }}
                variant="primary"
              />
            ) : hasStripeCustomer ? (
              <StripeButton
                label="Manage subscription"
                endpoint="/api/stripe/portal"
                variant="outline"
              />
            ) : null}
          </div>
        </div>

        {/* Feature list */}
        <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--line-1)' }}>
          <p className="font-data text-[10px] uppercase tracking-[1.5px] mb-3" style={{ color: 'var(--slate)' }}>
            Included in {currentPlan}
          </p>
          <ul className="grid sm:grid-cols-2 gap-2">
            {(PLAN_FEATURES[currentPlan] ?? []).map(f => (
              <li key={f} className="flex items-center gap-2 text-[12.5px]" style={{ color: 'var(--silver)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--positive)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* ── Upgrade card (free plan only) ── */}
      {currentPlan === 'free' && (
        <>
          <SectionLabel num="02" label="Upgrade to Pro" />
          <div className="rounded-xl p-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0d1628 0%, #0e1830 100%)', border: '1px solid rgba(61,111,232,.3)' }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-30"
              style={{ background: 'radial-gradient(circle at top right, rgba(61,111,232,.25), transparent 60%)' }} />
            <div className="relative">
              <p className="font-display text-[18px] mb-1" style={{ color: 'var(--platinum)' }}>LisanIQ Pro</p>
              <p className="text-[13px] mb-5" style={{ color: 'var(--silver)' }}>
                Unlimited uploads, unlimited reports, PDF export, and API access.
              </p>
              <ul className="grid sm:grid-cols-2 gap-2 mb-6">
                {PLAN_FEATURES.pro.map(f => (
                  <li key={f} className="flex items-center gap-2 text-[12.5px]" style={{ color: 'var(--silver)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--sapphire)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <StripeButton
                label="Start 14-day free trial"
                endpoint="/api/stripe/checkout"
                body={{ price_id: priceId }}
                variant="primary"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
