// app/(dashboard)/dashboard/billing/page.tsx
"use client";

import { useState } from "react";
import { PageHeader, Card, StatCard } from "@/components/dashboard/PagePrimitives";

// معرفات الأسعار التي سترتبط برمز البيئة الديناميكي لاحقاً
const STRIPE_PRICING_IDS = {
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || "price_placeholder_will_be_updated_soon",
};

export default function BillingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // دالة إرسال طلب الترقية إلى السيرفر (API) لتوليد رابط الدفع
  const handleUpgrade = async (planKey: "pro") => {
    setIsLoading(planKey);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: STRIPE_PRICING_IDS[planKey],
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "خطة الأسعار المحددة غير صالحة أو لم يتم العثور عليها في السيرفر.");
      }

      // توجيه المستخدم بأمان تام إلى بوابة Stripe
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Stripe Connection Error:", error);
      setErrorMessage(error.message || "حدث خطأ داخلي أثناء إعداد بوابة الدفع.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen p-6 text-right space-y-8" style={{ backgroundColor: '#0b0f19' }} dir="rtl">
      
      {/* هيدر الصفحة الرئيسي المتناسق مع مظهر المنصة الفاخر */}
      <PageHeader
        title="الفاتورة والاشتراكات"
        subtitle="إدارة خطتك، واشتراكك الحالي، وتتبع تفاصيل عمليات الفوترة."
      />

      {/* صندوق عرض الخطأ بشكل منسق واحترافي إن وجد */}
      {errorMessage && (
        <div className="p-4 rounded-xl text-sm font-medium border" style={{ backgroundColor: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* الإحصائيات الحالية للاشتراك */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card padding="p-6">
          <div className="text-xs font-bold mb-2" style={{ color: 'var(--slate)' }}>الاشتراك الحالي للمؤسسة</div>
          <div className="text-xl font-bold flex items-center gap-3" style={{ color: 'var(--platinum)' }}>
            <span>الباقة الأساسية المحدودة</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md border" style={{ backgroundColor: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}>
              نشط الآن
            </span>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <StatCard label="مجموعات البيانات المرفوعة" value="0" note="الحد الأقصى: 3 ملفات CSV" color="var(--platinum)" />
          <StatCard label="التقارير المستخرجة" value="0" note="الحد الأقصى: 5 تقارير ذكية" color="var(--platinum)" />
        </div>
      </div>

      {/* عنوان قسم الترقيات */}
      <div className="text-center pt-4">
        <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--platinum)' }}>🚀 ترقية الحساب وحجم الأعمال</h2>
        <p className="text-sm" style={{ color: 'var(--slate)' }}>اختر الخطة المناسبة لحجم حملاتك الإعلانية وابدأ بتحليل بياناتك بلا حدود.</p>
      </div>

      {/* بطاقات خطط الأسعار */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
        
        {/* الخطة المجانية الحالية */}
        <div className="border rounded-2xl p-6 flex flex-col justify-between opacity-75" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--line-1)' }}>
          <div>
            <div className="text-xs font-bold mb-1" style={{ color: 'var(--slate)' }}>مبتدئ / تجريبي</div>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--platinum)' }}>الحساب المجاني الأساسي</h3>
            <div className="text-2xl font-black mb-6" style={{ color: 'var(--platinum)' }}>0 دولار <span className="text-xs font-normal" style={{ color: 'var(--slate)' }}>/ شهرياً</span></div>
            
            <ul className="space-y-3 text-sm" style={{ color: 'var(--slate)' }}>
              <li className="flex items-center gap-2">✓ رفع حتى 3 ملفات CSV كحد أقصى</li>
              <li className="flex items-center gap-2">✓ معالجة وتحليل حتى 5,000 سطر للتقرير</li>
              <li className="flex items-center gap-2">✓ لوحة البيانات الاستراتيجية القياسية</li>
            </ul>
          </div>
          <button disabled className="w-full mt-8 py-3 rounded-xl text-xs font-bold cursor-not-allowed text-slate-500 bg-slate-900/50 border border-slate-800">
            باقة الحساب الحالية
          </button>
        </div>

        {/* خطة LisaniQ Pro الاحترافية */}
        <div className="border-2 rounded-2xl p-6 flex flex-col justify-between relative shadow-2xl transition-all" style={{ backgroundColor: 'var(--surface-2)', borderColor: '#3b82f6', boxShadow: '0 20px 25px -5px rgba(59,130,246,0.1)' }}>
          <div className="absolute -top-3 left-6 px-3 py-0.5 text-[10px] font-black rounded-full text-white bg-gradient-to-r from-blue-600 to-indigo-600">
            🔥 الأكثر اختياراً وتوفيراً
          </div>
          
          <div>
            <div className="text-xs font-bold mb-1" style={{ color: '#60a5fa' }}>للمحترفين والوكالات الرقمية</div>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--platinum)' }}>LisaniQ Pro</h3>
            <div className="text-2xl font-black mb-6" style={{ color: 'var(--platinum)' }}>49 دولار <span className="text-xs font-normal" style={{ color: 'var(--slate)' }}>/ شهرياً</span></div>
            
            <ul className="space-y-3 text-sm" style={{ color: 'var(--slate)' }}>
              <li className="flex items-center gap-2 text-emerald-400">✓ رفع وتحليل غير محدود لملفات الـ CSV</li>
              <li className="flex items-center gap-2 text-emerald-400">✓ استيعاب كامل حتى 500,000 سطر لكل ملف بيانات</li>
              <li className="flex items-center gap-2 text-emerald-400">✓ استخراج وتصدير التوصيات التنفيذية بصيغة PDF</li>
              <li className="flex items-center gap-2 text-emerald-400">✓ دعم فني ذو أولوية على مدار الساعة</li>
            </ul>
          </div>

          <button
            onClick={() => handleUpgrade("pro")}
            disabled={isLoading !== null}
            className="w-full mt-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/40 text-white rounded-xl text-xs font-black transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
          >
            {isLoading === "pro" ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            ) : "قم بالترقية إلى الإصدار الاحترافي 🚀"}
          </button>
        </div>

      </div>

    </div>
  );
}
