import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { sendOrderConfirmation } from '@/lib/email'

const FREE_SHIPPING = 50000
const SHIPPING_CHARGE = 250

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminSupabase()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, customerName, customerEmail, customerPhone, userId, address, notes } = body
    if (!items?.length)   return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    if (!customerName)    return NextResponse.json({ error: 'Name required' }, { status: 400 })
    if (!customerEmail)   return NextResponse.json({ error: 'Email required' }, { status: 400 })
    if (!address?.city)   return NextResponse.json({ error: 'Address required' }, { status: 400 })

    const supabase = createAdminSupabase()

    const { count: prevOrders } = await supabase
      .from('orders').select('id', { count:'exact', head:true }).eq('customer_email', customerEmail)

    // Use sale_price if available
    const subtotal  = items.reduce((s: number, i: any) => s + (i.product.sale_price ?? i.product.price) * i.quantity, 0)
    const shipping  = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_CHARGE
    const total     = subtotal + shipping
    const orderNum  = 'VIA-' + Date.now().toString().slice(-8)

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_number:     orderNum,
        user_id:          userId || null,
        customer_name:    customerName,
        customer_email:   customerEmail,
        customer_phone:   customerPhone || null,
        subtotal, shipping, gift_wrap: 0, total,
        status:           'pending',
        is_first_order:   (prevOrders ?? 0) === 0,
        shipping_address: address,
        notes:            notes || 'Cash on Delivery',
      })
      .select().single()

    if (orderErr) throw orderErr

    await supabase.from('order_items').insert(
      items.map((i: any) => ({
        order_id:     order.id,
        product_id:   i.product.id,
        product_name: i.product.name,
        size:         i.size,
        quantity:     i.quantity,
        unit_price:   i.product.sale_price ?? i.product.price,
        total_price:  (i.product.sale_price ?? i.product.price) * i.quantity,
      }))
    )

    await sendOrderConfirmation({
      customerName, customerEmail,
      orderNumber: orderNum,
      items: items.map((i: any) => ({
        name:     i.product.name,
        size:     i.size,
        quantity: i.quantity,
        price:    i.product.sale_price ?? i.product.price,
      })),
      total,
      shipping,
    })

    return NextResponse.json({ data: { orderId: order.id, orderNumber: orderNum } }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
