// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

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
            // تجاهل الأخطاء أثناء التشغيل داخل السيرفر
          }
        },
      },
    }
  );

  try {
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
