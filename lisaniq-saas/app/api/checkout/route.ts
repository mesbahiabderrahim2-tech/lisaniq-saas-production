// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createCheckoutSession, getOrCreateStripeCustomer, STRIPE_PRICES } from '@/services/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // تجاهل أخطاء التحديث داخل مكونات السيرفر
          }
        },
      },
    }
  );

  try {
    // 1. التحقق من هوية المستخدم الحالية من الجلسة
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '🔒 يرجى تسجيل الدخول أولاً لإتمام عملية الترقية.' },
        { status: 401 }
      );
    }

    // 2. قراءة البيانات المرسلة عند ضغط زر الترقية
    const body = await request.json();
    const { plan } = body; // المتوقع: 'pro_monthly' أو 'pro_yearly'

    if (!plan || !STRIPE_PRICES[plan]) {
      return NextResponse.json(
        { error: '⚠️ خطة الأسعار المحددة غير صالحة أو غير متوفرة.' },
        { status: 400 }
      );
    }

    // 3. جلب بيانات العميل الحالية من قاعدة البيانات لتفادي التكرار
    const { data: profile } = await supabase
      .from('users')
      .select('stripe_customer_id, full_name')
      .eq('id', user.id)
      .single();

    const existingCustomerId = profile?.stripe_customer_id || null;
    const fullName = profile?.full_name || user.user_metadata?.full_name || 'LisanIQ User';

    // 4. إنشاء أو جلب معرف العميل من Stripe بشكل آمن
    const customerId = await getOrCreateStripeCustomer({
      email: user.email!,
      fullName,
      userId: user.id,
      existingCustomerId,
    });

    // تحديث معرف Stripe في قاعدة البيانات إذا لم يكن موجوداً
    if (!existingCustomerId) {
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // 5. إعداد روابط العودة بعد إتمام أو إلغاء الدفع
    const origin = request.nextUrl.origin;
    const successUrl = `${origin}/dashboard/billing?success=true`;
    const cancelUrl = `${origin}/dashboard/billing?canceled=true`;

    // 6. إنشاء جلسة الدفع الرسمية من Stripe Service
    const session = await createCheckoutSession({
      customerId,
      priceId: STRIPE_PRICES[plan],
      userId: user.id,
      email: user.email!,
      successUrl,
      cancelUrl,
    });

    // إرجاع رابط الجلسة ليقوم العميل بالتحول إليه تلقائياً
    return NextResponse.json({ url: session.url }, { status: 200 });

  } catch (globalError: any) {
    console.error('Checkout API Error:', globalError.message);
    return NextResponse.json(
      { error: 'حدث خطأ داخلي أثناء إعداد بوابة الدفع.' },
      { status: 500 }
    );
  }
}
