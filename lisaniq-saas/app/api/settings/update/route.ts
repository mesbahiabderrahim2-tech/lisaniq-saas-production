import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // 1. التحقق من الجلسة والأمان وهل المستخدم مسجل دخول؟
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح لك بالدخول' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, profileData, orgData } = body;

    // 2. معالجة تحديث البيانات الشخصية والتفضيلات لجدول users العام
    if (type === 'profile') {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: session.user.id, // ربط تلقائي بمعرف المستخدم الفريد
          full_name: profileData.fullName,
          language: profileData.language,
          timezone: profileData.timezone,
          date_format: profileData.dateFormat,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return NextResponse.json({ success: true, message: 'تم حفظ البيانات الشخصية والتفضيلات بنجاح' });
    }

    // 3. معالجة تحديث بيانات المؤسسة والشركة
    if (type === 'organization') {
      // جلب معرف المؤسسة المرتبط بالمستخدم الحالي أولاً
      const { data: userRow } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', session.user.id)
        .single();

      let orgId = userRow?.organization_id;

      // إذا لم يكن لدى المستخدم مؤسسة سابقة، ننشئ له واحدة جديدة فوراً
      if (!orgId) {
        const { data: newOrg, error: createError } = await supabase
          .from('organizations')
          .insert({
            name: orgData.name,
            website: orgData.website,
            description: orgData.description
          })
          .select('id')
          .single();

        if (createError) throw createError;
        orgId = newOrg.id;

        // نربط المستخدم بالمؤسسة الجديدة التي أنشأناها
        await supabase
          .from('users')
          .update({ organization_id: orgId })
          .eq('id', session.user.id);
      } else {
        // إذا كانت المؤسسة موجودة بالفعل، نقوم بتحديث بياناتها فقط
        const { error: updateError } = await supabase
          .from('organizations')
          .update({
            name: orgData.name,
            website: orgData.website,
            description: orgData.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', orgId);

        if (updateError) throw updateError;
      }

      return NextResponse.json({ success: true, message: 'تم حفظ بيانات المؤسسة بنجاح' });
    }

    return NextResponse.json({ error: 'نوع الطلب غير مدعوم' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

