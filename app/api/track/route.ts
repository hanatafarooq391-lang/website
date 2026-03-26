import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    if (!query?.trim()) return NextResponse.json({ error: 'Order number ya email daalen' }, { status: 400 })

    const supabase = createAdminSupabase()
    const q = query.trim().toLowerCase()

    // Search by order number OR email
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(product_name, size, quantity, unit_price, total_price)')
      .or(`order_number.ilike.%${q}%,customer_email.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error
    if (!orders?.length) return NextResponse.json({ error: 'Koi order nahi mila. Order number ya email check karein.' }, { status: 404 })

    // Hide sensitive info
    const safe = orders.map(o => ({
      id:             o.id,
      order_number:   o.order_number,
      status:         o.status,
      created_at:     o.created_at,
      updated_at:     o.updated_at,
      customer_name:  o.customer_name,
      customer_email: o.customer_email?.replace(/(.{2}).+(@.+)/, '$1***$2'), // mask email
      subtotal:       o.subtotal,
      shipping:       o.shipping,
      total:          o.total,
      is_first_order: o.is_first_order,
      shipping_address: o.shipping_address,
      notes:          o.notes,
      order_items:    o.order_items,
    }))

    return NextResponse.json({ data: safe })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
