import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const sb   = createAdminSupabase()
    const { data, error } = await sb
      .from('collections').update(body).eq('id', params.id).select().single()
    if (error) throw error
    revalidatePath('/collection')
    revalidatePath('/')
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sb = createAdminSupabase()
    const { error } = await sb.from('collections').delete().eq('id', params.id)
    if (error) throw error
    revalidatePath('/collection')
    return NextResponse.json({ message: 'Deleted' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
