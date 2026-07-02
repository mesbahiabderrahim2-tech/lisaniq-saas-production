// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import cookies from 'next/headers';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // 1. إنشاء اتصال متوافق مع السيرفر لقراءة الكوكيز وبيانات المستخدم الحالي
  const cookieStore = await cookies();
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
            // يمكن تجاهل الخطأ إذا تم استدعاؤه داخل مكون سيرفر
          }
        },
      },
    }
  );

  // 2. التحقق من هوية المستخدم النشط
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: '🔒 غير مصرح بالدخول، يرجى تسجيل الدخول أولاً.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { plan } = body;

    if (!plan) {
      return NextResponse.json(
        { error: '⚠️ نوع خطة الأسعار غير محدد.' },
        { status: 400 }
      );
    }

    // 3. رابط بوابة الدفع الافتراضي (Stripe / Paddle) للتحديث الجديد
    // يمكنك تعديل الرابط أدناه برابط صفحة الدفع الحقيقية الخاصة بك في Stripe لاحقاً
    const checkoutUrl = `https://checkout.lisaniq.com/pay/pro?user_id=${user.id}&plan=${plan}`;

    // إرجاع رابط الدفع بنجاح إلى الواجهة الأمامية للتوجه التلقائي
    return NextResponse.json({ url: checkoutUrl }, { status: 200 });

  } catch (globalError: any) {
    console.error('❌ حدث خطأ في السيرفر أثناء تحضير الفاتورة:', globalError.message);
    return NextResponse.json(
      { error: 'حدث خطأ داخلي في السيرفر أثناء تهيئة عملية الدفع.' },
      { status: 500 }
    );
  }
}
