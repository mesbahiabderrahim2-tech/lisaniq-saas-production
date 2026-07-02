// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

// تهيئة مكتبة Stripe باستخدام المفتاح السري المخرّن في البيئة
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // 1. التحقق من هوية المستخدم الجاري دفعه
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'غير مصرح لك. يرجى تسجيل الدخول أولاً.' }, { status: 401 });
    }

    const origin = new URL(request.url).origin;

    // 2. إنشاء جلسة الدفع سحابياً في Stripe
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          // سعر باقة الـ Pro التخيلية (يمكنك ربطها بمعرف السعر الفعلي من لوحة التحكم في Stripe لاحقاً)
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'باقة المحترفين LisanIQ Pro Plan',
              description: 'رفع وتحليل ملفات CSV بلا حدود مع دعم تقارير ضخمة وأرشفة سحابية متقدمة.',
            },
            unit_amount: 4900, // الـ 49 دولار تحسب بالسنت (4900 سنت)
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // حفظ معرف المستخدم (user_id) داخل الميتا-داتا لكي نقرأه في الـ Webhook فور نجاح الدفع
      metadata: {
        userId: user.id,
      },
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&payment=success`,
      cancel_url: `${origin}/dashboard?payment=cancelled`,
    });

    // إرجاع رابط الدفع الآمن للواجهة الأمامية
    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تهيئة جلسة الدفع السحابية.' }, { status: 500 });
  }
}

