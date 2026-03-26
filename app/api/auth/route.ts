// app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'

export async function GET() {
  return NextResponse.json({ message: 'Use client-side Supabase auth' })
}
