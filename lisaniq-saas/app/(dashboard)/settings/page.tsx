import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// أوقات ومناطق زمنية معتمدة عالمياً للتحقق
const SUPPORTED_LANGUAGES = ['ar', 'en', 'fr'];
const DATE_FORMATS = ['YYYY/MM/DD', 'DD/MM/YYYY', 'MM/DD/YYYY'];

export async function POST(req: Request) {
  const cookieStore = await cookies();
  
  // 1. تهيئة عميل Supabase SSR المتوافق مع Next.js 15
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
            // تجاهل الأخطاء إذا تم الاستدعاء أثناء رندر الصفحات
          }
        },
      },
    }
  );
  
  // 2. فحص الجلسة وأمان المستخدم (Authentication Shield)
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized - يرجى تسجيل الدخول أولاً' }, 
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    const { type, profileData, orgData } = body;

    // ==========================================
    // 🧠 القسم الأول: تحديث تفضيلات الحساب الشخصي
    // ==========================================
    if (type === 'profile') {
      const { fullName, language, timezone, dateFormat } = profileData;

      // التحقق من صحة البيانات المدخلة (Data Validation)
      if (!fullName || fullName.trim().length < 3) {
        return NextResponse.json({ error: 'الاسم الكامل يجب أن لا يقل عن 3 أحرف' }, { status: 400 });
      }
      if (!SUPPORTED_LANGUAGES.includes(language)) {
        return NextResponse.json({ error: 'اللغة المحددة غير مدعومة حالياً' }, { status: 400 });
      }
      if (!DATE_FORMATS.includes(dateFormat)) {
        return NextResponse.json({ error: 'تنسيق التاريخ غير صالح' }, { status: 400 });
      }

      // تنفيذ عملية الـ Upsert الآمنة لبيانات المستخدم
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          full_name: fullName.trim(),
          language,
          timezone,
          date_format: dateFormat,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (profileError) throw profileError;

      return NextResponse.json({
        success: true,
        message: 'تم تحديث الإعدادات الشخصية والتفضيلات بنجاح عالمي 🌍',
        meta: { updatedBy: userId, timestamp: new Date().toISOString() }
      });
    }

    // ==========================================
    // 🏢 القسم الثاني: إدارة المؤسسة والـ Multi-Tenancy
    // ==========================================
    if (type === 'organization') {
      const { name, website, description, logoUrl } = orgData;

      if (!name || name.trim().length < 2) {
        return NextResponse.json({ error: 'اسم المؤسسة أو الشركة مطلوب بشكل إجباري' }, { status: 400 });
      }

      // فحص هل المستخدم مرتبط بمؤسسة حالية أم لا لمنع تداخل الجلسات
      const { data: userRow, error: userFetchError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .maybeSingle();

      if (userFetchError) throw userFetchError;
      let orgId = userRow?.organization_id;

      if (!orgId) {
        // [حالة مؤسسة جديدة]: ننشئ سجل تجاري ومساحة عمل جديدة كلياً
        const { data: newOrg, error: createOrgError } = await supabase
          .from('organizations')
          .insert({
            name: name.trim(),
            website: website ? website.trim() : null,
            description: description ? description.trim() : null,
            logo_url: logoUrl || null
          })
          .select('id')
          .single();

        if (createOrgError) throw createOrgError;
        orgId = newOrg.id;

        // ربط المستخدم بالمؤسسة الجديدة فوراً
        const { error: linkError } = await supabase
          .from('users')
          .update({ organization_id: orgId })
          .eq('id', userId);

        if (linkError) throw linkError;

      } else {
        // [حالة مؤسسة قائمة]: تحديث البيانات مع حماية الـ Tenant من التداخل
        const { error: updateOrgError } = await supabase
          .from('organizations')
          .update({
            name: name.trim(),
            website: website ? website.trim() : null,
            description: description ? description.trim() : null,
            logo_url: logoUrl || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', orgId); // تحديث حصري للمؤسسة التابعة للمستخدم فقط

        if (updateOrgError) throw updateOrgError;
      }

      return NextResponse.json({
        success: true,
        message: 'تم مزامنة بيانات المؤسسة ومساحة العمل بنجاح (Multi-Tenant Isolated) 🏢🛡️',
        orgId: orgId
      });
    }

    return NextResponse.json({ error: 'Bad Request - نوع طلب غير معروف' }, { status: 400 });

  } catch (error: any) {
    // تتبع الأخطاء بشكل احترافي للـ Logs
    console.error('SaaS Settings API Error:', error.message);
    return NextResponse.json(
      { error: 'خطأ داخلي في الخادم الموحد للمنصة', details: error.message }, 
      { status: 500 }
    );
  }
}
