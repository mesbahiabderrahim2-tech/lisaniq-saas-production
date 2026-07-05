"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader, Card, StatCard } from "@/components/dashboard/PagePrimitives";

// ⚠️ تأكد من تبديل هذه المعرفات بمعرفات الأسعار الحقيقية من لوحة تحكم Stripe الخاصة بك
const STRIPE_PRICING_IDS = {
  free: "price_free_tier_placeholder", // إذا كان هناك معرف مجاني أو اتركه فارغاً
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || "price_1Qxxxxxxxxx", // ضع معرف الـ Pro هنا كاحتياطي
};

export default function BillingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        throw new Error(data.error || "حدث خطأ غير متوقع أثناء إعداد بوابة الدفع.");
      }

      // التوجيه المباشر والآمن إلى صفحة إتمام الدفع في Stripe
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Stripe Checkout Error:", error);
      setErrorMessage(error.message || "حدث خطأ داخلي أثناء إعداد بوابة الدفع.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-right" dir="rtl">
      <PageHeader
        title="الفاتورة والاشتراكات"
        subtitle="إدارة خطتك، واشتراكك الحالي، وتتبع تفاصيل عمليات الفوترة."
      />

      {/* تنبيه الخطأ في حال حدوثه بشكل منسق مع الهوية الداكنة */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* كتل الإحصائيات الحالية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="text-sm text-slate-400 mb-2">الحساب الحالي</div>
          <div className="text-xl font-bold text-white flex items-center gap-3">
            <span>الحساب الحالي: إنشاء القواعد الأساسية</span>
            <span className="px-2 py-0.5 text-xs bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-md">
              الخطة الحالية
            </span>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <StatCard label="مجموعات البيانات المرفوعة" value="0" note="أقصى حد 3 ملفات" />
          <StatCard label="التقارير المكتملة" value="0" note="أقصى حد 5 تقارير" />
        </div>
      </div>

      {/* قسم خطط الأسعار والترقية */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">🚀 ابتكار التصاميم والترقية الاحترافية</h2>
        <p className="text-sm text-slate-400">ابتكر مؤسستك مسبقاً لحجم أعمالك وابدأ بعشرات الآلاف من عملائك الآن.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
        {/* الخطة المجانية */}
        <div className="bg-[#111625] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between opacity-75">
          <div>
            <div className="text-sm text-slate-400 mb-1">مبتدئ</div>
            <h3 className="text-xl font-bold text-white mb-4">الحساب مجاني (مجاني)</h3>
            <div className="text-3xl font-bold text-white mb-6">0 دولار <span className="text-sm text-slate-400">/ شهر</span></div>
            
            <ul className="space-y-3 text-right text-sm text-slate-300">
              <li className="flex items-center gap-2 justify-start">✓ رفع ملف CSV شهرياً حتى 3 ملفات</li>
              <li className="flex items-center gap-2 justify-start">✓ تحليل حتى 5,000 صف لكل تقرير</li>
              <li className="flex items-center gap-2 justify-start">✓ لوحة الإنتاج الأساسية</li>
            </ul>
          </div>
          <button disabled className="w-full mt-8 py-3 bg-slate-800 text-slate-400 rounded-xl text-sm font-semibold cursor-not-allowed">
            خطتك السنوية حالياً
          </button>
        </div>

        {/* خطة LisaniQ Pro الاحترافية */}
        <div className="bg-[#111625] border-2 border-blue-500 rounded-2xl p-6 flex flex-col justify-between relative shadow-2xl shadow-blue-500/10">
          <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold rounded-full">
            🔥 الأكثر اختياراً وتوفيراً
          </div>
          <div>
            <div className="text-sm text-blue-400 mb-1">للمحترفين والوكالات</div>
            <h3 className="text-xl font-bold text-white mb-4">LisaniQ Pro</h3>
            <div className="text-3xl font-bold text-white mb-6">49 دولار <span className="text-sm text-slate-400">/ قطعة</span></div>
            
            <ul className="space-y-3 text-right text-sm text-slate-300">
              <li className="flex items-center gap-2 justify-start text-emerald-400">✓ تحميل ملفات CSV غير محدود والتحليل للرصيد</li>
              <li className="flex items-center gap-2 justify-start text-emerald-400">✓ تحميل حتى 500,000 صف لكل مجموعة البيانات</li>
              <li className="flex items-center gap-2 justify-start text-emerald-400">✓ تصدير التقارير والتوصيات إلى ملفات PDF</li>
              <li className="flex items-center gap-2 justify-start text-emerald-400">✓ دعم فني ذو صلة بالساعة</li>
            </ul>
          </div>

          <button
            onClick={() => handleUpgrade("pro")}
            disabled={isLoading !== null}
            className="w-full mt-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 text-white rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
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
