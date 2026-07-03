// components/PricingPlans.tsx
'use client';

import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function PricingPlans() {
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

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planType, userId: user.id }),
      });

      const result = await response.json();

      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error(result.error || 'فشل تفعيل بوابة الدفع');
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
        <h2 className="text-3xl font-black text-slate-100">🚀 خطط الأسعار والترقية الاحترافية</h2>
        <p className="text-slate-400 mt-2 text-sm">اختر الخطة المناسبة لحجم أعمالك وابدأ في مضاعفة أرباح حملاتك الآن.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* ─── الخطة المجانية (خلفية بيضاء - تم تصحيح ألوان النصوص لتصبح داكنة وواضحة جداً) ─── */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between text-slate-900">
          <div>
            <span className="text-xs font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-full">الخطة الحالية</span>
            <h3 className="text-xl font-bold text-slate-900 mt-2">الحساب المجاني (Free)</h3>
            <p className="text-slate-700 text-xs mt-1 font-medium">لتجربة المنصة واستكشاف محرك القرارات الذكي.</p>
            
            <div className="my-6">
              <span className="text-4xl font-black text-slate-900">$0</span>
              <span className="text-slate-600 text-sm"> / شهرياً</span>
            </div>

            <ul className="space-y-3 text-sm text-slate-800 border-t border-slate-100 pt-4 font-medium">
              <li className="flex items-center gap-2">
                <svg className="text-emerald-600 w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>شهرياً CSV رفع حتى 3 ملفات</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="text-emerald-600 w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>تحليل حتى 5000 صف لكل تقرير</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="text-emerald-600 w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>لوحة مؤشرات الأداء الأساسية</span>
              </li>
            </ul>
          </div>
          
          <button disabled className="w-full mt-8 bg-slate-100 text-slate-500 font-bold py-3 rounded-xl text-sm cursor-not-allowed">
            خطتك النشطة حالياً
          </button>
        </div>

        {/* ─── الخطة الاحترافية (خلفية داكنة - متناسقة مع ثيم لوحة التحكم وبنصوص واضحة) ─── */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl border-2 border-indigo-500 relative flex flex-col justify-between shadow-xl">
          <div className="absolute top-0 left-0 bg-indigo-600 text-white text-xs font-black px-4 py-1.5 rounded-br-xl rounded-tl-sm animate-pulse">
            🔥 الأكثر طلباً وتوفيراً
          </div>
          
          <div>
            <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full">للمحترفين والوكالات</span>
            <h3 className="text-xl font-bold text-white mt-2">LisanIQ Pro</h3>
            <p className="text-slate-300 text-xs mt-1">تحليلات غير محدودة وميزات متقدمة مخصصة لنمو سريع جداً.</p>
            
            <div className="my-6">
              <span className="text-4xl font-black text-white">$49</span>
              <span className="text-slate-400 text-sm"> / شهرياً</span>
            </div>

            <ul className="space-y-3 text-sm text-slate-100 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2">
                <svg className="text-indigo-400 w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>تحميل ملفات CSV غير محدود والتحليل الفوري</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="text-indigo-400 w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>تحليل حتى 500,000 صف لكل مجموعة بيانات</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="text-indigo-400 w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>تصدير التقارير والتوصيات إلى ملفات PDF</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="text-indigo-400 w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>دعم فني ذو أولوية على مدار الساعة</span>
              </li>
            </ul>
          </div>
          
          <button 
            onClick={() => handleUpgrade('pro')}
            disabled={isLoading}
            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md active:scale-[0.98]"
          >
            {isLoading ? '⏳ جاري تجهيز بوابة الدفع آمنة...' : '🚀 قم بالترقية إلى الإصدار الاحترافي'}
          </button>
        </div>

      </div>
    </div>
  );
}
