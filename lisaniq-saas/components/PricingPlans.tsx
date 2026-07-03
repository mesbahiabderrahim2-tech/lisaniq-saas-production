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
        <h2 className="text-3xl font-black" style={{ color: 'var(--platinum)' }}>🚀 خطط الأسعار والترقية الاحترافية</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--slate)' }}>اختر الخطة المناسبة لحجم أعمالك وابدأ في مضاعفة أرباح حملاتك الآن.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* ─── الخطة المجانية (تعديل كامل لتصبح داكنة واحترافية والكلمات واضحة 100%) ─── */}
        <div 
          className="p-8 rounded-3xl border flex flex-col justify-between"
          style={{ background: 'var(--surface-2)', borderColor: 'var(--line-1)' }}
        >
          <div>
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--silver)' }}>الخطة الحالية</span>
            <h3 className="text-xl font-bold mt-2" style={{ color: 'var(--platinum)' }}>الحساب المجاني (Free)</h3>
            <p className="text-xs mt-1 font-medium" style={{ color: 'var(--slate)' }}>لتجربة المنصة واستكشاف محرك القرارات الذكي.</p>
            
            <div className="my-6">
              <span className="text-4xl font-black" style={{ color: 'var(--platinum)' }}>$0</span>
              <span className="text-sm" style={{ color: 'var(--slate)' }}> / شهرياً</span>
            </div>

            <ul className="space-y-3 text-sm border-t pt-4 font-medium" style={{ borderColor: 'var(--line-1)', color: 'var(--silver)' }}>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>رفع حتى 3 ملفات CSV شهرياً</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>تحليل حتى 5,000 صف لكل تقرير</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>لوحة مؤشرات الأداء الأساسية</span>
              </li>
            </ul>
          </div>
          
          <button disabled className="w-full mt-8 font-bold py-3 rounded-xl text-sm cursor-not-allowed opacity-60" style={{ background: 'var(--line-1)', color: 'var(--slate)' }}>
            خطتك النشطة حالياً
          </button>
        </div>

        {/* ─── الخطة الاحترافية (احترافية وثابتة) ─── */}
        <div 
          className="p-8 rounded-3xl border-2 relative flex flex-col justify-between shadow-xl"
          style={{ background: 'var(--surface-2)', borderColor: 'var(--sapphire)' }}
        >
          <div 
            className="absolute top-0 left-0 text-white text-xs font-black px-4 py-1.5 rounded-br-xl rounded-tl-sm animate-pulse"
            style={{ background: 'var(--sapphire)' }}
          >
            🔥 الأكثر طلباً وتوفيراً
          </div>
          
          <div>
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: 'rgba(61,111,232,0.1)', color: '#9fc4f5' }}>للمحترفين والوكالات</span>
            <h3 className="text-xl font-bold mt-2" style={{ color: 'var(--platinum)' }}>LisanIQ Pro</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--slate)' }}>تحليلات غير محدودة وميزات متقدمة مخصصة لنمو سريع جداً.</p>
            
            <div className="my-6">
              <span className="text-4xl font-black" style={{ color: 'var(--platinum)' }}>$49</span>
              <span className="text-sm" style={{ color: 'var(--slate)' }}> / شهرياً</span>
            </div>

            <ul className="space-y-3 text-sm border-t pt-4" style={{ borderColor: 'var(--line-1)', color: 'var(--silver)' }}>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>تحميل ملفات CSV غير محدود والتحليل الفوري</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>تحليل حتى 500,000 صف لكل مجموعة بيانات</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>تصدير التقارير والتوصيات إلى ملفات PDF</span>
              </li>
            </ul>
          </div>
          
          <button 
            onClick={() => handleUpgrade('pro')}
            disabled={isLoading}
            className="w-full mt-8 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md active:scale-[0.98]"
            style={{ background: 'var(--sapphire)' }}
          >
            {isLoading ? '⏳ جاري تجهيز بوابة الدفع...' : '🚀 قم بالترقية إلى الإصدار الاحترافي'}
          </button>
        </div>

      </div>
    </div>
  );
}
