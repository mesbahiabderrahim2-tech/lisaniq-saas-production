// components/PricingPlans.tsx
'use client';

import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function PricingPlans() {
  // الاتصال الآمن والمتوافق مع إصدار مشروعك الحالي
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async (planType: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('🔒 يرجى تسجيل الدخول أولاً لتتمكن من الترقية.');
        window.location.href = '/login';
        return;
      }

      // استدعاء بوابة الدفع بأمان
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planType, userId: user.id }),
      });

      const result = await response.json();

      if (result.url) {
        window.location.href = result.url; // التوجه لصفحة الدفع
      } else {
        throw new Error(result.error || 'فشل تشغيل بوابة الدفع.');
      }
    } catch (error: any) {
      alert(`⚠️ خطأ في معالجة الترقية: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-16 text-right" dir="rtl">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-slate-900">خطط الأسعار والترقية الإحترافية 🚀</h2>
        <p className="text-slate-500 mt-2 text-sm">اختر الخطة المناسبة لحجم أعمالك وابدأ في مضاعفة أرباح حملاتك الآن.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* الخطة المجانية */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">الخطة الحالية</span>
            <h3 className="text-xl font-bold text-slate-800 mt-2">الحساب المجاني (Free)</h3>
            <p className="text-slate-400 text-xs mt-1">لتجربة المنصة واستكشاف محرك القرارات الذكي.</p>
            <div className="my-6">
              <span className="text-4xl font-black text-slate-900">$0</span>
              <span className="text-slate-500 text-sm"> / شهرياً</span>
            </div>
            <ul className="space-y-3 text-sm text-slate-600 border-t border-slate-100 pt-4">
              <li>• رفع حتى 3 ملفات CSV شهرياً</li>
              <li>• تحليل حتى 5000 صف لكل تقرير</li>
              <li>• لوحة مؤشرات الأداء الأساسية</li>
            </ul>
          </div>
          <button disabled className="w-full mt-8 bg-slate-100 text-slate-400 font-bold py-3 rounded-xl text-sm cursor-not-allowed">
            خطتك النشطة حالياً
          </button>
        </div>

        {/* الخطة الاحترافية */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl border-2 border-indigo-500 shadow-xl relative flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-black px-4 py-1.5 rounded-bl-xl">
            الأكثر مبيعاً 🔥
          </div>
          <div>
            <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full">للمحترفين والوكالات</span>
            <h3 className="text-xl font-bold mt-2">LisanIQ Pro</h3>
            <p className="text-slate-400 text-xs mt-1">تحليلات غير محدودة وميزات متقدمة مخصصة لنمو سريع.</p>
            <div className="my-6">
              <span className="text-4xl font-black text-white">$49</span>
              <span className="text-slate-400 text-sm"> / شهرياً</span>
            </div>
            <ul className="space-y-3 text-sm text-slate-300 border-t border-slate-800 pt-4">
              <li className="text-emerald-400">✓ رفع تقارير وملفات CSV غير محدودة</li>
              <li className="text-emerald-400">✓ تحليل حتى 500,000 صف لكل تقرير</li>
              <li>✓ تصدير التقارير والتوصيات إلى ملفات PDF</li>
              <li>✓ دعم فني ذو أولوية على مدار الساعة</li>
            </ul>
          </div>
          <button
            onClick={() => handleUpgrade('pro')}
            disabled={isLoading}
            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {isLoading ? 'جاري تحضير بوابة الدفع...' : '🚀 قم بالترقية إلى الإصدار الإحترافي'}
          </button>
        </div>
      </div>
    </div>
  );
}
