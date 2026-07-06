import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SUPPORTED_LANGUAGES = ['ar', 'en', 'fr'];
const DATE_FORMATS = ['YYYY/MM/DD', 'DD/MM/YYYY', 'MM/DD/YYYY'];

export async function POST(req: Request) {
  const cookieStore = await cookies();
  
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
            // تجاهل أخطاء الـ Server Components
          }
        },
      },
    }
  );
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    const { type, profileData, orgData } = body;

    if (type === 'profile') {
      const { fullName, language, timezone, dateFormat } = profileData;

      if (!fullName || fullName.trim().length < 3) {
        return NextResponse.json({ error: 'الاسم غير صالح' }, { status: 400 });
      }

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

      return NextResponse.json({ success: true, message: 'تم التحديث بنجاح 🌍' });
    }

    if (type === 'organization') {
      const { name, website, description } = orgData;

      if (!name || name.trim().length < 2) {
        return NextResponse.json({ error: 'اسم المؤسسة مطلوب' }, { status: 400 });
      }

      const { data: userRow } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .maybeSingle();

      let orgId = userRow?.organization_id;

      if (!orgId) {
        const { data: newOrg, error: createOrgError } = await supabase
          .from('organizations')
          .insert({
            name: name.trim(),
            website: website ? website.trim() : null,
            description: description ? description.trim() : null
          })
          .select('id')
          .single();

        if (createOrgError) throw createOrgError;
        orgId = newOrg.id;

        await supabase
          .from('users')
          .update({ organization_id: orgId })
          .eq('id', userId);

      } else {
        const { error: updateOrgError } = await supabase
          .from('organizations')
          .update({
            name: name.trim(),
            website: website ? website.trim() : null,
            description: description ? description.trim() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', orgId);

        if (updateOrgError) throw updateOrgError;
      }

      return NextResponse.json({ success: true, message: 'تمت المزامنة بنجاح 🏢' });
    }

    return NextResponse.json({ error: 'طلب غير معروف' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
