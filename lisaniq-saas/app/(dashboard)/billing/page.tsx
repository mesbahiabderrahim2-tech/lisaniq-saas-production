// app/(dashboard)/billing/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { PageContainer, PageHeader, Card } from '@/components/dashboard/PagePrimitives';
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

        const { data: profileData } = await supabase
          .from('users')
          .select('plan, stripe_customer_id')
          .eq('id', user.id)
          .maybeSingle();

        const { data: subData } = await supabase
          .from('subscriptions')
          .select('status, current_period_end, cancel_at_period_end')
          .eq('user_id', user.id)
          .maybeSingle();

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
        <div className="p-12 text-center text-sm font-semibold text-slate-300" dir="rtl">
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
      <div className="max-w-5xl mx-auto text-right" dir="rtl">
        <PageHeader
          title="الفاتورة والاشتراكات"
          subtitle="إدارة خطتك الحالية، وتتبع معدلات استهلاك الحساب والمبيعات."
        />

        {/* كرت حالة الاشتراك الحالي (تم تعديل النصوص لتصبح واضحة جداً) */}
        <Card className="mb-6">
          <p className="font-data text-[11px] font-bold uppercase tracking-[1.5px] mb-2 text-indigo-400">حالة الحساب الحالي</p>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <h3 className="text-xl font-black text-slate-100">
                {isPro ? '🚀 LisanIQ Pro (الإصدار الاحترافي)' : 'الحساب الحالي: إنشاء تطبيق (الخطة المجانية)'}
              </h3>
              {isPro && subscription?.current_period_end && (
                <p className="text-sm text-slate-200 mt-1">
                  تاريخ تجديد الفاتورة القادم: <span className="font-bold text-white">{new Date(subscription.current_period_end).toLocaleDateString('ar-EG')}</span>
                </p>
              )}
            </div>

            <div className="shrink-0">
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
        </Card>

        {/* إحصائيات استهلاك الموارد (تم تحسين الوضوح والتباين هنا) */}
        <Card className="mb-10">
          <p className="font-data text-[11px] font-bold uppercase tracking-[1.5px] mb-4 text-indigo-400">📊 حجم استهلاك موارد الحساب</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="font-data text-3xl font-black text-white mb-1">{usage.datasets}</div>
              <div className="text-sm text-slate-200 font-medium">مجموعات البيانات المرفوعة / {isPro ? 'لا محدود' : 'أقصى حد 3 ملفات'}</div>
            </div>
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="font-data text-3xl font-black text-white mb-1">{usage.reports}</div>
              <div className="text-sm text-slate-200 font-medium">التقارير المستخرجة / {isPro ? 'لا محدود' : 'أقصى حد 5 تقارير'}</div>
            </div>
          </div>
        </Card>

        {/* عرض خطط الأسعار المعدلة */}
        <PricingPlans />
      </div>
    </PageContainer>
  );
}
