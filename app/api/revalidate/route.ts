import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST() {
  try {
    // Revalidate all storefront pages
    revalidatePath('/')
    revalidatePath('/collection')
    revalidatePath('/product/[slug]', 'page')
    return NextResponse.json({ revalidated: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
