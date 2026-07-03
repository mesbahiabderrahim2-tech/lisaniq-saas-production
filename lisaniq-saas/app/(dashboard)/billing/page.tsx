// app/(dashboard)/billing/page.tsx
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { format } from 'date-fns';
import { PageContainer, PageHeader } from '@/components/dashboard/PagePrimitives';
import { StripeButton } from '@/components/dashboard/StripeButton';
import PricingPlans from '@/components/PricingPlans';

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

  // الحصول على المستخدم الحالي والتحقق من الجلسة
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
      <div className="p-6 lg:p-10 max-w-[900px] text-right" dir="rtl">
        <PageHeader
          title="الفواتير والاشتراكات"
          subtitle="إدارة خطتك واشتراكك الحالي، وتتبع معدلات استهلاك الحساب."
        />

        {/* لافتات تحذير الدفع أو الإلغاء */}
        {subStatus === 'past_due' && (
          <div className="rounded-lg p-4 mb-6 flex items-start gap-3 bg-[rgba(220,75,75,0.08)] border border-[1px solid rgba(220,75,75,0.25)]">
            <div className="text-[13px] font-medium text-[#f44a4a]">
              <p className="font-bold mb-0.5">🚨 الدفع متأخر!</p>
              <p className="text-[12px] opacity-90">فشلت عملية الدفع الأخيرة. يرجى تحديث طريقة الدفع الخاصة بك للاحتفاظ بوصولك إلى النسخة الاحترافية.</p>
            </div>
          </div>
        )}

        {subRes?.cancel_at_period_end && (
          <div className="rounded-lg p-4 mb-6 flex items-start gap-3 bg-[rgba(212,146,42,0.08)] border border-[1px solid rgba(212,146,42,0.25)]">
            <div className="text-[13px] font-medium text-[#e89c27]">
              <p className="font-bold mb-0.5">⚠️ تم إلغاء الخطة الحالية</p>
              <p className="text-[12px] opacity-90">تم إلغاء اشتراكك وسيعود حسابك تلقائياً إلى الوضع المجاني في نهاية فترة الفاتورة الحالية.</p>
            </div>
          </div>
        )}

        {/* بطاقة ملخص الخطة الحالية للمستخدم */}
        <div className="rounded-lg p-6 mb-6 bg-white border border-slate-100 shadow-sm">
          <p className="text-[11px] uppercase tracking-[1.5px] mb-2 text-slate-400 font-bold">حالة الحساب الحالي</p>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-[20px] font-black text-slate-900">
                  {isPro ? '🚀 LisanIQ Pro' : 'الحساب الحالي: الخطة المجانية'}
                </h3>
                {subStatus === 'trialing' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700">
                    فترة تجريبية
                  </span>
                )}
              </div>

              {isPro && subRes?.current_period_end && (
                <p className="text-[12px] text-slate-500">
                  {subRes.cancel_at_period_end ? 'ينتهي الوصول التجاري في تاريخ: ' : 'موعد التجديد التلقائي القادم: '}
                  <span className="font-bold text-slate-700">{format(new Date(subRes.current_period_end), 'dd/MM/yyyy')}</span>
                </p>
              )}
            </div>

            {/* أزرار التحكم الديناميكية المرتبطة بـ Stripe */}
            <div className="flex flex-col gap-3">
              {isPro ? (
                <StripeButton
                  text="⚙️ إدارة اشتراكك وتحديث البطاقة"
                  endpoint="/api/portal"
                  priceId=""
                  variant="muted"
                />
              ) : (
                <StripeButton
                  text="⚡ ترقية حسابي الآن"
                  endpoint="/api/checkout"
                  priceId={priceId}
                  variant="primary"
                />
              )}
            </div>
          </div>
        </div>

        {/* إحصائيات معدلات الاستخدام واستهلاك المحرك */}
        <div className="rounded-lg p-6 mb-10 bg-white border border-slate-100 shadow-sm">
          <p className="text-[11px] uppercase tracking-[1.5px] mb-4 text-slate-400 font-bold">📊 حجم استهلاك موارد الحساب</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl">
              <div className="text-[20px] font-black text-slate-900">{datasetsCount}</div>
              <div className="text-[12px] text-slate-500 mt-0.5">مجموعات البيانات المرفوعة / {isPro ? 'لا محدود' : 'حد أقصى 3'}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
              <div className="text-[20px] font-black text-slate-900">{reportsCount}</div>
              <div className="text-[12px] text-slate-500 mt-0.5">التقارير المستخرجة / {isPro ? 'لا محدود' : 'حد أقصى 5'}</div>
            </div>
          </div>
        </div>

        <hr className="border-slate-100 my-8" />

        {/* إدراج كتل بطاقات الأسعار الكاملة والتوصيات والأسئلة الشائعة هنا */}
        <div className="mt-6 bg-white p-4 rounded-2xl border border-slate-50 shadow-xs">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-black text-slate-900">🏷️ باقات الاشتراك المتاحة</h2>
            <p className="text-xs text-slate-500 mt-1">اختر الخطة المناسبة لأعمالك وابدأ في تحسين حملاتك الإعلانية فوراً.</p>
          </div>
          
          <PricingPlans />
        </div>
      </div>
    </PageContainer>
  );
}
