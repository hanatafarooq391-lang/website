import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminSupabase()
    const { data, error } = await supabase.from('products').select('*').eq('id',params.id).single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body     = await req.json()
    const supabase = createAdminSupabase()
    const { data, error } = await supabase.from('products').update(body).eq('id',params.id).select().single()
    if (error) throw error

    // Revalidate storefront so changes show immediately
    revalidatePath('/')
    revalidatePath('/collection')
    revalidatePath(`/product/${data.slug}`)

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminSupabase()
    const { error } = await supabase.from('products').delete().eq('id',params.id)
    if (error) throw error

    revalidatePath('/')
    revalidatePath('/collection')

    return NextResponse.json({ message: 'Deleted' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
