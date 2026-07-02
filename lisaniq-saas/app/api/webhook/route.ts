// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { constructWebhookEvent, mapStripePlanName } from '@/services/stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials are missing in environment variables.');
    return NextResponse.json(
      { error: 'إعدادات السيرفر غير مكتملة لتلقي الـ Webhook حالياً.' },
      { status: 500 }
    );
  }

  // إنشاء اتصال العميل الخلفي ذو الصلاحيات العالية لتحديث الاشتراكات
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  try {
    // قراءة نص الطلب الخام والتحقق من التوقيع الأمني القادم من Stripe
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    let event;
    try {
      event = constructWebhookEvent(rawBody, signature);
    } catch (err: any) {
      console.error(`❌ Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: 'توقيع الـ Webhook غير صالحة برمجياً.' }, { status: 400 });
    }

    console.log(`📥 Webhook event verified and received: ${event.type}`);

    // المعالجة البرمجة الكاملة والأصلية لأحداث الدفع الحيوية
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata?.supabase_user_id;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (userId) {
          // تحديث بيانات المستخدم في قاعدة البيانات إلى ترقية Pro فورية
          await supabase
            .from('users')
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plan: 'pro',
              role: 'user'
            })
            .eq('id', userId);
          console.log(`✅ User ${userId} successfully upgraded to PRO via Webhook.`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;
        const priceId = subscription.items.data[0].price.id;
        const internalPlanName = mapStripePlanName(priceId);

        // تحديث نوع الخطة بناءً على التعديل الجديد في لوحة تحكم Stripe
        await supabase
          .from('users')
          .update({ plan: internalPlanName })
          .eq('stripe_customer_id', customerId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;

        // إعادة المستخدم إلى الخطة المجانية فور إلغاء أو انتهاء الاشتراك
        await supabase
          .from('users')
          .update({
            plan: 'free',
            stripe_subscription_id: null
          })
          .eq('stripe_customer_id', customerId);
        console.log(`ℹ️ Subscription for customer ${customerId} canceled.`);
        break;
      }

      default:
        console.log(`🔄 Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true, status: 'success' }, { status: 200 });

  } catch (error: any) {
    console.error('⚠️ Webhook execution error:', error.message);
    return NextResponse.json(
      { error: 'حدث خطأ داخلي أثناء معالجة البيانات.' },
      { status: 400 }
    );
  }
}
