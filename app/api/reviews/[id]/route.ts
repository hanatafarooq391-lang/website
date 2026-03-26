import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const sb   = createAdminSupabase()
    const { data, error } = await sb.from('reviews').update(body).eq('id', params.id).select().single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sb = createAdminSupabase()
    const { error } = await sb.from('reviews').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ message: 'Deleted' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
