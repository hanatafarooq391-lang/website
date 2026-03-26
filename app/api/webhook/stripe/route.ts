// app/api/webhook/stripe/route.ts
// Stripe sends payment events here — we update order status accordingly
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminSupabase } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const adminSb = createAdminSupabase()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId

      if (orderId) {
        await adminSb
          .from('orders')
          .update({
            status:                'confirmed',
            stripe_payment_intent: session.payment_intent as string,
            shipping_address:      session.shipping_details?.address
              ? {
                  line1:       session.shipping_details.address.line1,
                  line2:       session.shipping_details.address.line2,
                  city:        session.shipping_details.address.city,
                  state:       session.shipping_details.address.state,
                  postal_code: session.shipping_details.address.postal_code,
                  country:     session.shipping_details.address.country,
                }
              : null,
          })
          .eq('id', orderId)

        // Decrement stock for each item
        const { data: items } = await adminSb
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', orderId)

        for (const item of items ?? []) {
          if (item.product_id) {
            await adminSb.rpc('decrement_stock', {
              p_id: item.product_id,
              qty:  item.quantity,
            })
          }
        }

        console.log(`✅ Order ${orderId} confirmed via Stripe`)
      }
      break
    }

    case 'checkout.session.expired':
    case 'payment_intent.payment_failed': {
      const obj     = event.data.object as any
      const orderId = obj.metadata?.orderId
      if (orderId) {
        await adminSb.from('orders').update({ status: 'cancelled' }).eq('id', orderId)
        console.log(`❌ Order ${orderId} cancelled`)
      }
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      await adminSb
        .from('orders')
        .update({ status: 'refunded' })
        .eq('stripe_payment_intent', charge.payment_intent)
      break
    }

    default:
      console.log(`Unhandled Stripe event: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

// Required: disable body parsing for Stripe signature verification
export const config = { api: { bodyParser: false } }
