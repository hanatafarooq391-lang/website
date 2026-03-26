import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminSupabase()
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('product_id')
    let query = supabase
      .from('reviews')
      .select('*, product:products(name,gender)')
      .order('created_at', { ascending: false })
    if (productId) query = query.eq('product_id', productId)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { product_id, author_name, rating, title, body: rb } = body

    if (!product_id)  return NextResponse.json({ error: 'Product select karein' }, { status: 400 })
    if (!author_name) return NextResponse.json({ error: 'Naam likhein' },          { status: 400 })
    if (!rating)      return NextResponse.json({ error: 'Rating dein' },            { status: 400 })
    if (!title)       return NextResponse.json({ error: 'Title likhein' },          { status: 400 })
    if (!rb)          return NextResponse.json({ error: 'Review likhein' },         { status: 400 })

    const supabase = createAdminSupabase()
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id,
        author_name: String(author_name).trim(),
        rating:      Number(rating),
        title:       String(title).trim(),
        body:        String(rb).trim(),
        approved:    true,
        verified:    false,
      })
      .select('*, product:products(name,gender)')
      .single()

    if (error) {
      console.error('Review insert error:', error.code, error.message)
      throw error
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    const sb = createAdminSupabase()
    const { error } = await sb.from('reviews').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ message: 'Deleted' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
