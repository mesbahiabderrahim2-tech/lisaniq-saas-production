// app/(dashboard)/billing/page.tsx
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { format } from 'date-fns';
import { PageContainer, PageHeader } from '@/components/dashboard/PagePrimitives';
import { StripeButton } from '@/components/dashboard/StripeButton';

export const metadata = {
  title: 'الفواتير - LisanIQ',
  description: 'إدارة خطتك واشتراكك في LisanIQ',
};

export default async function BillingPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // تجاهل أخطاء التحديث داخل مكونات السيرفر
          }
        },
      },
    }
  );

  // الحصول على المستخدم الحالي وقاعدة البيانات
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // جلب بيانات العميل والاشتراك
  const { data: profileRes } = await supabase
    .from('users')
    .select('plan, stripe_customer_id')
    .eq('id', user.id)
    .single();

  const { data: subRes } = await supabase
    .from('subscriptions')
    .select('status, current_period_start, current_period_end, cancel_at_period_end')
    .eq('user_id', user.id)
    .maybeSingle();

  // حساب معدلات الاستخدام الحالية للمستخدم
  const { count: userDatasets } = await supabase
    .from('datasets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: userReports } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const currentPlan = profileRes?.plan || 'free';
  const hasActiveSub = !!profileRes?.stripe_customer_id;
  const subStatus = subRes?.status;
  const datasetsCount = userDatasets || 0;
  const reportsCount = userReports || 0;

  const isPro =
    currentPlan === 'pro' &&
    (subStatus === 'active' ||
      subStatus === 'trialing' ||
      subStatus === 'past_due' ||
      subStatus === 'incomplete' ||
      subStatus === 'incomplete_expired');

  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || '';

  return (
    <PageContainer>
      <div className="p-6 lg:p-10 max-w-[900px]">
        <PageHeader
          title="الفواتير"
          subtitle="إدارة خطتك واشتراكك، وتتبع استخدامك الحالي."
        />

        {/* لافتات تحذير الدفع */}
        {subStatus === 'past_due' && (
          <div className="rounded-lg p-4 mb-6 flex items-start gap-3 bg-[rgba(220,75,75,0.08)] border border-[px solid rgba(220,75,75,0.25)]">
            <svg className="w-5 h-5 text-[#f44a4a] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-[13px] font-medium text-[#f44a4a] mb-0.5">الدفع متأخر!</p>
              <p className="text-[12px] text-[#f44a4a] opacity-90">
                فشلت عملية الدفع الأخيرة. يرجى تحديث طريقة الدفع الخاصة بك للاحتفاظ بوصولك إلى النسخة الاحترافية.
              </p>
            </div>
          </div>
        )}

        {subRes?.cancel_at_period_end && (
          <div className="rounded-lg p-4 mb-6 flex items-start gap-3 bg-[rgba(212,146,42,0.08)] border border-[1px solid rgba(212,146,42,0.25)]">
            <svg className="w-5 h-5 text-[#e89c27] flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-[13px] font-medium text-[#e89c27] mb-0.5">تم إلغاء الخطة الحالية</p>
              <p className="text-[12px] text-[#e89c27] opacity-90">
                تم إلغاء اشتراكك وسيعود إلى الوضع المجاني في نهاية فترة الفاتورة.
              </p>
            </div>
          </div>
        )}

        {/* بطاقة الخطة الحالية */}
        <div className="rounded-lg p-6 mb-6 bg-[rgba(252,252,252,0.03)] border border-[1px solid var(--line-1)]">
          <p className="text-[11px] uppercase tracking-[1.5px] mb-3 text-[var(--slate)]">الخطة الحالية</p>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-[22px] font-bold text-[var(--platinum)]">
                  {isPro ? 'LisanIQ Pro' : 'الحساب مجاني (مجاني)'}
                </h3>
                {subStatus === 'trialing' && (
                  <span className="text-[10px] uppercase tracking-[1.5px] px-2 py-0.5 rounded bg-[rgba(201,168,76,0.12)] border border-[1px solid rgba(201,168,76,0.3)] text-[var(--gold)]">
                    محاكمة
                  </span>
                )}
              </div>

              {/* فترة الفاتورة */}
              {isPro && subRes?.current_period_end && (
                <p className="text-[12px] text-[var(--slate)]">
                  {subRes.cancel_at_period_end ? 'ينتهي في تاريخ ' : 'يتجدد تلقائياً في تاريخ '}
                  {format(new Date(subRes.current_period_end), 'dd/MM/yyyy')}
                </p>
              )}
            </div>

            {/* الإجراءات الحركية للأزرار */}
            <div className="flex flex-col gap-3">
              {isPro ? (
                <StripeButton
                  text="إدارة الاشتراك"
                  endpoint="/api/portal"
                  priceId=""
                  variant="muted"
                />
              ) : (
                <StripeButton
                  text="الترقية إلى النسخة الاحترافية"
                  endpoint="/api/checkout"
                  priceId={priceId}
                  variant="primary"
                />
              )}
            </div>
          </div>
        </div>

        {/* طريقة الاستخدام ومعدلات الاستهلاك */}
        <div className="rounded-lg p-6 mb-6 bg-[rgba(252,252,252,0.03)] border border-[1px solid var(--line-1)]">
          <p className="text-[11px] uppercase tracking-[1.5px] mb-3 text-[var(--slate)]">طريقة الاستخدام</p>
          <div className="grid sm:grid-cols-2 gap-2">
            <div>
              <div className="text-[18px] font-bold text-[var(--platinum)]">{datasetsCount}</div>
              <div className="text-[12px] text-[var(--slate)]">مجموعات البيانات / {isPro ? '3 مجموعات بيانات' : 'لا محدود'}</div>
            </div>
            <div>
              <div className="text-[18px] font-bold text-[var(--platinum)]">{reportsCount}</div>
              <div className="text-[12px] text-[var(--slate)]">التقارير / {isPro ? '5 تقارير' : 'لا محدود'}</div>
            </div>
          </div>
        </div>

        {/* قائمة الميزات وعرض الخطط المتوفرة */}
        {!isPro && (
          <div className="rounded-xl p-6 relative overflow-hidden bg-[linear-gradient(135deg,#0d1628_0%,#0e1830_100%)] border border-[1px solid rgba(61,111,232,0.3)]">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-30 bg-[radial-gradient(circle_at_top_right,rgba(61,111,232,0.25),transparent_60%)]" />
            <h3 className="text-[18px] font-bold text-[var(--platinum)] mb-1">LisanIQ Pro</h3>
            <p className="text-[13px] text-[var(--silver)] mb-5">تحليلات غير محدودة، تقارير غير محدودة، تصدير ملفات PDF والوصول إلى واجهة برمجة التطبيقات (API).</p>
            
            <ul className="grid sm:grid-cols-2 gap-2 mb-6">
              <li className="flex items-center gap-2 text-[12.5px] text-[var(--silver)]">
                <svg className="w-3.5 h-3.5 text-[#3d77e8]" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                تحليلات غير محدودة وميزات الذكاء الاصطناعي
              </li>
              <li className="flex items-center gap-2 text-[12.5px] text-[var(--silver)]">
                <svg className="w-3.5 h-3.5 text-[#3d77e8]" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                تصدير غير محدود وتقارير مخصصة
              </li>
            </ul>

            <StripeButton
              text="ابدأ تجربتك المجانية لمدة 14 يوماً"
              endpoint="/api/checkout"
              priceId={priceId}
              variant="primary"
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
