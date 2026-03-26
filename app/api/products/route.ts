import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminSupabase()
    const { searchParams } = new URL(req.url)
    const gender   = searchParams.get('gender')
    const featured = searchParams.get('featured')
    const slug     = searchParams.get('slug')

    let query = supabase.from('products').select('*').eq('status','active').order('created_at',{ascending:false})
    if (gender)   query = query.eq('gender', gender)
    if (featured) query = query.eq('featured', true)
    if (slug) {
      const { data } = await query.eq('slug', slug).single()
      return NextResponse.json({ data })
    }
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body     = await req.json()
    const supabase = createAdminSupabase()
    const slug     = body.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
    const { data, error } = await supabase.from('products').insert({ ...body, slug }).select().single()
    if (error) throw error

    // Revalidate storefront
    revalidatePath('/')
    revalidatePath('/collection')

    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
