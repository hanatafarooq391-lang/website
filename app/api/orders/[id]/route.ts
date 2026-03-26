import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { sendOrderDispatched, sendOrderDelivered, sendOrderCancelled } from '@/lib/email'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sb = createAdminSupabase()
    const { data, error } = await sb.from('orders').select('*, order_items(*)').eq('id', params.id).single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const sb   = createAdminSupabase()

    // Fetch current order BEFORE update
    const { data: old, error: fe } = await sb
      .from('orders')
      .select('*, order_items(product_name, size)')
      .eq('id', params.id)
      .single()
    if (fe) throw fe

    // Update order
    const { data, error } = await sb
      .from('orders')
      .update(body)
      .eq('id', params.id)
      .select()
      .single()
    if (error) throw error

    const newStatus = body.status
    const oldStatus = old?.status

    // Trigger email only when status changes
    if (newStatus && newStatus !== oldStatus && old?.customer_email) {
      const info = {
        customerName:  old.customer_name  ?? '',
        customerEmail: old.customer_email,
        orderNumber:   old.order_number   ?? params.id,
      }
      console.log(`📧 Sending email: ${oldStatus} → ${newStatus} to ${info.customerEmail}`)

      if (newStatus === 'shipped') {
        await sendOrderDispatched({
          ...info,
          items: (old.order_items ?? []).map((i: any) => ({ name: i.product_name })),
        })
      } else if (newStatus === 'delivered') {
        await sendOrderDelivered(info)
      } else if (newStatus === 'cancelled') {
        await sendOrderCancelled({ ...info, reason: body.cancel_reason })
      }
    }

    return NextResponse.json({ data, message: 'Updated' })
  } catch (err: any) {
    console.error('PATCH order error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
