import { createServerClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set({ name, value, ...options }))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set({ name, value, ...options }))
        },
      },
    }
  )

  // جلب بيانات المستخدم بأمان للتحقق من الجلسة الشخصية
  const { data: { user } } = await supabase.auth.getUser()

  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isAuthRoute = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/sign-up'

  // 1. حماية لوحة التحكم: إذا لم يكن هناك مستخدم، وجهه إجبارياً إلى صفحة تسجيل الدخول
  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. إذا كان المستخدم مسجلاً ويحاول فتح صفحات المصادقة، وجهه للدشبرد تلقائياً
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 3. معالجة المسار الرئيسي (/) لمنع الـ 404 في حال عدم وجود صفحة هبوط عامة مبنية
  if (request.nextUrl.pathname === '/') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * مطابقة جميع مسارات الطلبات باستثناء المسارات التي تبدأ بـ:
     * - _next/static (ملفات الاستاتيك)
     * - _next/image (تحسين الصور)
     * - favicon.ico (أيقونة الموقع)
     * - الملفات العامة (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
