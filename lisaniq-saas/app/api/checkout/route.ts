// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // 1. استدعاء الكوكيز بشكل صحيح متوافق مع Next.js 15
  const cookieStore = await cookies();
  
  // 2. إنشاء اتصال السيرفر المستقر
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // تجاهل الأخطاء إذا تم الاستدعاء من مكونات سيرفر محمية
          }
        },
      },
    }
  );

  try {
    // 3. التحقق من المستخدم بأمان
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '🔒 يرجى تسجيل الدخول أولاً لإتمام العملية.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan } = body;

    if (!plan) {
      return NextResponse.json(
        { error: '⚠️ نوع خطة الأسعار غير محدد.' },
        { status: 400 }
      );
    }

    // 4. توجيه المستخدم إلى رابط الدفع المباشر
    const checkoutUrl = `https://checkout.lisaniq.com/pay/pro?user_id=${user.id}&plan=${plan}`;

    return NextResponse.json({ url: checkoutUrl }, { status: 200 });

  } catch (globalError: any) {
    console.error('API Error:', globalError.message);
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في السيرفر.' },
      { status: 500 }
    );
  }
}
