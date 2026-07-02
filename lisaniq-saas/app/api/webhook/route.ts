// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. إجبار Next.js على معالجة الملف كمسار ديناميكي لمنع انهيار الـ Build بسبب غياب المتغيرات السرية
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // 2. قراءة المتغيرات البيئية بأمان مع وضع قيم بديلة لحماية مرحلة البناء (Build Phase)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // التحقق من وجود المفاتيح أثناء التشغيل الفعلي للسيرفر
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials are missing in environment variables.');
    return NextResponse.json(
      { error: 'إعدادات السيرفر غير مكتملة لتلقي الـ Webhook حالياً.' },
      { status: 500 }
    );
  }

  // 3. إنشاء عميل Supabase المستقل والمخصص للعمليات الخلفية
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  try {
    // قراءة البيانات القادمة من بوابة الدفع (Stripe / Paddle)
    const payload = await request.json();
    
    console.log('📥 Webhook received successfully:', payload.type || 'Event');

    // -----------------------------------------------------------------
    // هنا تتم معالجة أحداث الدفع وتحديث حالة المستخدم إلى (Pro) في قاعدة البيانات
    // كمثال: إذا نجحت عملية الدفع، نقوم بتحديث جدول الـ profiles أو organizations
    // -----------------------------------------------------------------

    return NextResponse.json({ received: true, status: 'success' }, { status: 200 });

  } catch (error: any) {
    console.error('⚠️ Webhook Error during execution:', error.message);
    // نرجع استجابة ناجحة 200 أو 400 مبسطة لمنع بوابات الدفع من تكرار الإرسال العشوائي عند وجود أخطاء في الكود داخلياً
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة بيانات الـ Webhook' },
      { status: 400 }
    );
  }
}
