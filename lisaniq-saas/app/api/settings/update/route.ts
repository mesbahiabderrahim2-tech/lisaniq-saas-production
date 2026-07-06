import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SUPPORTED_LANGUAGES = ['ar', 'en'];
const DATE_FORMATS = ['YYYY/MM/DD', 'DD/MM/YYYY', 'MM/DD/YYYY'];

export async function POST(req: Request) {
  const cookieStore = await cookies();
  
  // إنشاء عميل Supabase SSR الحديث المتوافق مع Next.js 15 و Vercel
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // تجاهل الأخطاء أثناء الـ Server Rendering
          }
        },
      },
    }
  );
  
  // حزام الأمان: التحقق من جلسة المستخدم الشخصية
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'عذراً، انتهت الجلسة. يرجى إعادة تسجيل الدخول.' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    const { type, profileData, orgData } = body;

    // 👤 معالجة تحديث بيانات الحساب الشخصي والتفضيلات
    if (type === 'profile') {
      const { fullName, language, timezone, dateFormat } = profileData;

      if (!fullName || fullName.trim().length < 3) {
        return NextResponse.json({ error: 'الاسم الكامل يجب أن يتكون من 3 أحرف على الأقل.' }, { status: 400 });
      }
      if (!SUPPORTED_LANGUAGES.includes(language)) {
        return NextResponse.json({ error: 'اللغة المحددة غير مدعومة.' }, { status: 400 });
      }

      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          full_name: fullName.trim(),
          language,
          timezone,
          date_format: dateFormat,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (dbError) throw dbError;

      return NextResponse.json({ success: true, message: 'تم حفظ تفضيلات الحساب بنجاح ✨' });
    }

    // 🏢 معالجة تحديث بيانات المؤسسة (Workspace)
    if (type === 'organization') {
      const { name, website, description } = orgData;

      if (!name || name.trim().length < 2) {
        return NextResponse.json({ error: 'اسم المؤسسة حقل مطلوب.' }, { status: 400 });
      }

      const { data: userRow } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .maybeSingle();

      let orgId = userRow?.organization_id;

      if (!orgId) {
        const { data: newOrg, error: createError } = await supabase
          .from('organizations')
          .insert({
            name: name.trim(),
            website: website || null,
            description: description || null
          })
          .select('id')
          .single();

        if (createError) throw createError;
        orgId = newOrg.id;

        await supabase.from('users').update({ organization_id: orgId }).eq('id', userId);
      } else {
        const { error: updateError } = await supabase
          .from('organizations')
          .update({
            name: name.trim(),
            website: website || null,
            description: description || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', orgId);

        if (updateError) throw updateError;
      }

      return NextResponse.json({ success: true, message: 'تم تحديث بيانات المؤسسة بنجاح 🏢' });
    }

    return NextResponse.json({ error: 'نوع الطلب غير صالح.' }, { status: 400 });

  } catch (error: any) {
    // إرسال الخطأ الحقيقي للـ Logs الخلفية لحماية أمن البيانات وعدم إظهاره للعميل
    console.error('[SaaS Settings API Error Logging]:', error.message);
    return NextResponse.json(
      { error: 'حدث خطأ داخلي أثناء معالجة البيانات، تم تسجيل المشكلة وجاري فحصها.' }, 
      { status: 500 }
    );
  }
}
