// app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createAdminSupabase()
    const { data, error } = await supabase.from('site_settings').select('*')
    if (error) throw error
    const settings = Object.fromEntries((data ?? []).map((s: any) => [s.key, s.value]))
    return NextResponse.json({ data: settings })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const updates = await req.json()
    const supabase = createAdminSupabase()
    for (const [key, value] of Object.entries(updates)) {
      await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() })
    }
    return NextResponse.json({ message: 'Settings updated' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
