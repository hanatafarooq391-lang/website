import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function GET() {
  try {
    const sb = createAdminSupabase()
    const { data, error } = await sb
      .from('collections')
      .select('*')
      .order('sort_order', { ascending: true })
    if (error) {
      // fallback — table might not exist yet
      const { data: products } = await sb.from('products').select('collection,gender').eq('status','active')
      const cols = [...new Set((products??[]).map((p:any)=>p.collection).filter(Boolean))].sort()
      return NextResponse.json({ data: cols.map((c,i)=>({ id:c, name:c, slug:c, type:'custom', active:true, sort_order:i })) })
    }
    return NextResponse.json({ data: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const sb   = createAdminSupabase()
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
    const { data, error } = await sb
      .from('collections')
      .insert({ name: body.name, slug, description: body.description??'', type: body.type??'custom', active: true, sort_order: body.sort_order??99 })
      .select().single()
    if (error) throw error
    revalidatePath('/collection')
    revalidatePath('/')
    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
