import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware - runs on every matched request before page rendering.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          )
        },
      },
    }
  )

  // Refresh session - IMPORTANT: do not remove, keeps tokens alive
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // --- Route Protection Rules --------------------------------------

  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/reset-password')

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/settings')

  const isApiRoute = pathname.startsWith('/api')

  // 1. معالجة المسار الرئيسي (/) لمنع الـ 404 والـ 500 نهائياً
  if (pathname === '/') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 2. إذا كان المستخدم غير مسجل ويحاول دخول مسار محمي
  if (!user && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname) // حفظ الوجهة المقصودة
    return NextResponse.redirect(loginUrl)
  }

  // 3. إذا كان المستخدم مسجلاً ويحاول زيارة صفحات تسجيل الدخول
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 4. مسارات الـ API: ربط معرف المستخدم بالـ Headers
  if (isApiRoute && user) {
    supabaseResponse.headers.set('x-user-id', user.id)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Watch every request except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
