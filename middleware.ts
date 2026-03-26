import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })
  const { pathname } = request.nextUrl

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) return response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string)                         { return request.cookies.get(name)?.value },
        set(name: string, value: string, opts: CookieOptions) {
          request.cookies.set({ name, value, ...opts })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...opts })
        },
        remove(name: string, opts: CookieOptions) {
          request.cookies.set({ name, value: '', ...opts })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...opts })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in → redirect to login
  if (!user) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Not admin → redirect to home with error
  if (!profile || profile.role !== 'admin') {
    const url = new URL('/', request.url)
    url.searchParams.set('error', 'unauthorized')
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
