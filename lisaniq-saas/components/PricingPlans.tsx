// components/PricingPlans.tsx
'use client';

import React, { useState } from 'react';
import { Check, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PricingPlans() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'الخطة المجانية',
      description: 'لتجربة المحرك واكتشاف الفرص المبدئية',
      price: { monthly: 0, yearly: 0 },
      features: [
        'تحليل ملف CSV واحد شهرياً',
        'تتبع عميل تجاري واحد فقط',
        'الوصول إلى التوصيات الحرجة (🚨)',
        'تحديث البيانات يدوياً'
      ],
      buttonText: 'حسابك الحالي',
      variant: 'outline' as const,
      disabled: true
    },
    {
      id: 'pro',
      name: 'LisanIQ Pro',
      description: 'الحل المتكامل للمسوقين والوكالات لإيقاف الهدر المالي',
      price: { monthly: 49, yearly: 39 },
      features: [
        'تحليل ملفات CSV غير محدود',
        'إدارة حسابات عملاء متعددة بلا حدود',
        'الوصول الكامل لجميع التوصيات (الحرجة، العالية، والمثالية)',
        'استخراج التقارير التنفيذية للعملاء بنقرة واحدة',
        'أرشفة تاريخية كاملة لقرارات المحرك المستدامة',
        'دعم فني متقدم عبر الواتساب والبريد'
      ],
      buttonText: 'قم بالترقية إلى الإصدار الاحترافي 🚀',
      variant: 'default' as const,
      isPopular: true
    }
  ];

  const faqs = [
    {
      question: 'كيف يقوم المحرك باكتشاف هدر الميزانية؟',
      answer: 'يقوم المحرك بقراءة متقدمة لبيانات الحملات من ملف الـ CSV ومقارنة معدلات التحويل التاريخية، وتكلفة الاكتساب الحالية (CPA)، والعائد على الإنفاق الإعلاني (ROAS) مع المستهدفات المطلوبة لتحديد الحملات المسببة للنزيف فوراً.'
    },
    {
      question: 'هل بيانات عملائي آمنة عند رفع الملفات؟',
      answer: 'نعم، الأمان هو أولويتنا القصوى. يتم معالجة وتشفير كافة البيانات سحابياً بشكل مؤقت لاستخراج التوصيات، ولا يتم مشاركتها أو استخدامها لأي أغراض أخرى خارج نطاق حسابك المخصص.'
    },
    {
      question: 'هل يمكنني إلغاء الاشتراك في أي وقت؟',
      answer: 'بالتأكيد. يمكنك إلغاء اشتراكك أو ترقيته أو تعديله بنقرة واحدة من صفحة إعدادات الفواتير عبر بوابة التمويل الآمنة الخاصة بـ Stripe دون أي تعقيدات.'
    }
  ];

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;
    setLoadingPlan(planId);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: billingPeriod === 'monthly' ? 'pro_monthly' : 'pro_yearly' })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'حدث خطأ أثناء الاتصال ببوابة الدفع.');
      }
    } catch (err) {
      console.error(err);
      alert('فشل الاتصال بالسيرفر، يرجى المحاولة مرة أخرى.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-2" dir="rtl">
      {/* مفتاح التبديل بين الشهري والسنوي */}
      <div className="flex justify-center items-center gap-4 mb-10">
        <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>فاتورة شهرية</span>
        <button
          onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
          className="w-12 h-6 bg-slate-900 rounded-full p-1 transition-all duration-200 relative flex items-center"
        >
          <div className={`w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm ${billingPeriod === 'yearly' ? 'translate-x-[-24px]' : 'translate-x-0'}`} />
        </button>
        <span className={`text-sm font-medium flex items-center gap-1.5 ${billingPeriod === 'yearly' ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
          فاتورة سنوية
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">توفير 20%</span>
        </span>
      </div>

      {/* بطاقات عرض الخطط والأسعار */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl border p-6 flex flex-col justify-between relative transition-all duration-200 ${plan.isPopular ? 'border-indigo-600 shadow-md md:scale-[1.02]' : 'border-slate-200 shadow-xs'}`}
          >
            {plan.isPopular && (
              <span className="absolute top-0 left-1/2 translate-x-[-50%] translate-y-[-50%] bg-indigo-600 text-white text-xs font-black px-4 py-1 rounded-full">
                🔥 الأكثر اختياراً وتوفيراً
              </span>
            )}

            <div>
              <h3 className="text-xl font-black text-slate-900 mb-1">{plan.name}</h3>
              <p className="text-xs text-slate-500 mb-6">{plan.description}</p>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-slate-900">${billingPeriod === 'monthly' ? plan.price.monthly : plan.price.yearly}</span>
                <span className="text-sm text-slate-400">/ شهرياً</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => handleUpgrade(plan.id)}
              disabled={plan.disabled || loadingPlan === plan.id}
              className={`w-full font-bold py-3 rounded-xl transition-all duration-200 ${plan.isPopular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
              {loadingPlan === plan.id ? '⏳ جاري الانتقال الآمن لبوابة Stripe...' : plan.buttonText}
            </Button>
          </div>
        ))}
      </div>

      {/* قسم الأسئلة الشائعة */}
      <div className="border-t border-slate-100 pt-12">
        <div className="text-center mb-8">
          <h3 className="text-lg font-black text-slate-900 flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            الأسئلة الشائعة حول الفواتير والاشتراك
          </h3>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 text-right flex justify-between items-center font-bold text-sm text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <span>{faq.question}</span>
                {activeFaq === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {activeFaq === idx && (
                <div className="p-4 pt-0 text-xs text-slate-500 leading-relaxed bg-slate-50 border-t border-slate-50">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
