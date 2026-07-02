// app/api/webhook/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

// إنشاء عميل Supabase بصلاحيات السيرفر (Service Role) لتخطي الحماية وتحديث الباقة داخلياً بأمان
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature') || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    // التحقق من أن الإشارة قادمة فعلياً من Stripe وليس من هاكر خارجي
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET غير معرف في خادم البيئة.');
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ فشل التحقق من هوية الإشارة: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // ⚡ الاستماع لحدث نجاح الاشتراك (checkout.session.completed)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // سحب معرف المستخدم الذي قمنا بتخزينه مسبقاً في الميتا-داتا
    const userId = session.metadata?.userId;

    if (userId) {
      console.log(`🎰 تم تأكيد الدفع للمستخدم: ${userId}. جاري ترقية الحساب سحابياً...`);

      // تحديث حقل الباقة (plan) للمستخدم ليصبح 'pro' لفتح كل القيود وجدار الحماية
      const { error } = await supabaseAdmin
        .from('profiles') // أو جدول users_plans حسب هيكلة قاعدة بياناتك
        .update({ plan: 'pro' })
        .eq('id', userId);

      if (error) {
        console.error('❌ فشل تحديث باقة العميل في Supabase:', error);
        return NextResponse.json({ error: 'فشل ترقية الحساب داخلياً' }, { status: 500 });
      }

      console.log(`🚀 مبروك! تم تحويل حساب المستخدم ${userId} إلى باقة PRO بنجاح باهر.`);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

