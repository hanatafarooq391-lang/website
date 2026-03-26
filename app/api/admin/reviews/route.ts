// app/api/admin/reviews/route.ts — ALL reviews (approved + hidden)
import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createAdminSupabase()
    const { data, error } = await supabase
      .from('reviews')
      .select('*, product:products(name,gender)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ data: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
