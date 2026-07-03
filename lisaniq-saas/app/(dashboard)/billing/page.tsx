// app/(dashboard)/billing/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { PageContainer, PageHeader } from '@/components/dashboard/PagePrimitives';
import { StripeButton } from '@/components/dashboard/StripeButton';
import PricingPlans from '@/components/PricingPlans';

export default function BillingPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [usage, setUsage] = useState({ datasets: 0, reports: 0 });

  useEffect(() => {
    async function getBillingData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. جلب بيانات خطة العميل
        const { data: profileData } = await supabase
          .from('users')
          .select('plan, stripe_customer_id')
          .eq('id', user.id)
          .maybeSingle();

        // 2. جلب بيانات الاشتراك من Stripe
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('status, current_period_end, cancel_at_period_end')
          .eq('user_id', user.id)
          .maybeSingle();

        // 3. جلب معدلات استهلاك الحساب للعميل الحالي
        const { count: datasetsCount } = await supabase
          .from('datasets')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { count: reportsCount } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (profileData) setProfile(profileData);
        if (subData) setSubscription(subData);
        setUsage({
          datasets: datasetsCount || 0,
          reports: reportsCount || 0
        });
      } catch (err) {
        console.error("Error loading billing data:", err);
      } finally {
        setLoading(false);
      }
    }

    getBillingData();
  }, [supabase]);

  if (loading) {
    return (
      <PageContainer>
        <div className="p-10 text-center font-bold text-slate-500" dir="rtl">
          ⏳ جاري تحميل السجلات المالية الآمنة وفحص بوابة الدفع...
        </div>
      </PageContainer>
    );
  }

  const currentPlan = profile?.plan || 'free';
  const subStatus = subscription?.status;
  const isPro = currentPlan === 'pro' && (subStatus === 'active' || subStatus === 'trialing');
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || '';

  return (
    <PageContainer>
      <div className="p-6 lg:p-10 max-w-[900px] text-right" dir="rtl">
        <PageHeader
          title="الفواتير والاشتراكات"
          subtitle="إدارة خطتك واشتراكك الحالي، وتتبع معدلات استهلاك الحساب."
        />

        {/* كرت ملخص خطة العميل الحالية */}
        <div className="rounded-lg p-6 mb-6 bg-white border border-slate-100 shadow-sm mt-6">
          <p className="text-[11px] uppercase tracking-[1.5px] mb-2 text-slate-400 font-bold">حالة الحساب الحالي</p>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <h3 className="text-[20px] font-black text-slate-900 mb-1">
                {isPro ? '🚀 LisanIQ Pro (النسخة الاحترافية)' : 'الحساب الحالي: الخطة المجانية'}
              </h3>
              {isPro && subscription?.current_period_end && (
                <p className="text-[12px] text-slate-500">
                  تاريخ التجديد التلقائي القادم للفاتورة: <span className="font-bold text-slate-700">{new Date(subscription.current_period_end).toLocaleDateString('ar-EG')}</span>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {isPro ? (
                <StripeButton
                  text="⚙️ إدارة اشتراكك وتحديث بطاقة الدفع"
                  endpoint="/api/portal"
                  priceId=""
                  variant="muted"
                />
              ) : (
                <StripeButton
                  text="⚡ ترقية حسابي الآن للنسخة الاحترافية"
                  endpoint="/api/checkout"
                  priceId={priceId}
                  variant="primary"
                />
              )}
            </div>
          </div>
        </div>

        {/* إحصائيات استهلاك الحساب ومحدودية الموارد */}
        <div className="rounded-lg p-6 mb-10 bg-white border border-slate-100 shadow-sm">
          <p className="text-[11px] uppercase tracking-[1.5px] mb-4 text-slate-400 font-bold">📊 حجم استهلاك موارد الحساب</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl">
              <div className="text-[20px] font-black text-slate-900">{usage.datasets}</div>
              <div className="text-[12px] text-slate-500 mt-0.5">مجموعات البيانات المرفوعة / {isPro ? 'لا محدود' : 'حد أقصى 3 ملفات'}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
              <div className="text-[20px] font-black text-slate-900">{usage.reports}</div>
              <div className="text-[12px] text-slate-500 mt-0.5">التقارير المستخرجة / {isPro ? 'لا محدود' : 'حد أقصى 5 تقارير'}</div>
            </div>
          </div>
        </div>

        <hr className="border-slate-100 my-8" />

        {/* عرض بطاقات الأسعار الاحترافية المدمجة والأسئلة الشائعة بسلام وأمان */}
        <div className="mt-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-black text-slate-900">🏷️ باقات الاشتراك وتوصيات الترقية الاحترافية</h2>
            <p className="text-sm text-slate-500 mt-1">اختر الخطة المناسبة لحجم أعمالك وانتقل إلى تتبع حملاتك التسويقية بلا حدود.</p>
          </div>
          
          <PricingPlans />
        </div>
      </div>
    </PageContainer>
  );
}
