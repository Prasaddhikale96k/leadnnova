import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in trying to access dashboard
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Logged in but not onboarded — redirect to onboarding
  if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_onboarded')
      .eq('id', user.id)
      .single()

    if (profile && !profile.is_onboarded && request.nextUrl.pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  // Logged in on landing page → allow staying on home
  // (user can navigate to dashboard manually via the navbar)

  return response
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/onboarding'],
}
