// app/api/upload/route.ts — Multiple image upload
import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files    = formData.getAll('files') as File[]
    if (!files.length) return NextResponse.json({ error: 'No files provided' }, { status: 400 })

    const supabase = createAdminSupabase()
    const urls: string[] = []

    for (const file of files) {
      if (!['image/jpeg','image/png','image/webp','image/jpg'].includes(file.type))
        continue
      if (file.size > 5 * 1024 * 1024) continue

      const ext      = file.name.split('.').pop()
      const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const buffer   = Buffer.from(await file.arrayBuffer())

      const { error } = await supabase.storage
        .from('viaura-images')
        .upload(fileName, buffer, { contentType: file.type, upsert: false })

      if (error) { console.error('Upload error:', error); continue }

      const { data } = supabase.storage.from('viaura-images').getPublicUrl(fileName)
      urls.push(data.publicUrl)
    }

    if (!urls.length) return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    return NextResponse.json({ urls, url: urls[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
