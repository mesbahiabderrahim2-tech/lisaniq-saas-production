// components/PricingPlans.tsx
'use client';

import React, { useState } from 'react';

export default function PricingPlans() {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // استدعاء مسار الـ API لتهيئة جلسة الدفع سحابياً
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء الاتصال ببوابة الدفع.');
      }

      // إذا نجحت الجلسة، نقوم بنقل المستخدم فوراً لصفحة Stripe الآمنة
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('لم يتم استلام رابط الدفع بشكل صحيح.');
      }
    } catch (error: any) {
      alert(`⚠️ إشعار: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      name: 'الباقة المجانية (Free)',
      price: '$0',
      period: 'للأبد',
      description: 'مثالية لتجربة المنصة واستكشاف الميزات الأساسية.',
      features: [
        'تحليل حتى 5 ملفات CSV شهرياً',
        'دعم تقارير حتى 1,000 سطر للملف',
        'أرشفة التقارير والقرارات التاريخية',
        'دعم منصات إعلانية محدودة'
      ],
      buttonText: 'الخطة الحالية',
      active: true,
      color: 'slate',
      onClick: () => {}
    },
    {
      name: 'الباقة المتقدمة (Pro)',
      price: '$49',
      period: 'شهرياً',
      description: 'الباقة المثالية لوكالات التسويق والمحترفين لإدارة حملات ضخمة.',
      features: [
        'رفع وتحليل ملفات CSV بلا حدود',
        'دعم ملفات ضخمة تصل إلى 50,000 سطر',
        'ذكاء اصطناعي متقدم لاستخراج التوصيات الحرجة',
        'تصدير التقارير بصيغة PDF و Excel بضغطة زر',
        'دعم فني متواصل 24/7'
      ],
      buttonText: isLoading ? 'جاري تحويلك لبوابة الدفع... 💳' : '🚀 ترقية الحساب الآن',
      active: false,
      color: 'indigo',
      onClick: handleUpgrade
    }
  ];

  return (
    <div className="mt-16 bg-slate-50 rounded-3xl border border-slate-200/60 p-8 text-right" dir="rtl">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200">
          خطط الأسعار والاشتراكات 💰
        </span>
        <h2 className="text-2xl font-black text-slate-900 mt-3">اختر الخطة المناسبة لأعمالك</h2>
        <p className="text-sm text-slate-500 mt-2">
          استهلكت حصتك المجانية؟ لا تدع نزيف الحملات الإعلانية يستمر، قم بالترقية الآن واستمتع بتحليلات غير محدودة لعملائك.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col justify-between relative transition-all duration-300 hover:shadow-md ${
              plan.color === 'indigo' ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-100'
            }`}
          >
            {plan.color === 'indigo' && (
              <span className="absolute -top-3 left-6 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                موصى به 🔥
              </span>
            )}

            <div>
              <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
              
              <div className="my-6 flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                <span className="text-xs font-bold text-slate-400">/ {plan.period}</span>
              </div>

              <ul className="space-y-3 border-t border-slate-50 pt-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className={`text-sm ${plan.color === 'indigo' ? 'text-indigo-600' : 'text-slate-400'}`}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={plan.onClick}
              disabled={plan.active || isLoading}
              className={`w-full mt-8 py-3 px-4 rounded-xl font-bold text-xs transition duration-200 text-center ${
                plan.active 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 disabled:opacity-50'
              }`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
