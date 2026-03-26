// app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const adminSb = createAdminSupabase()

    // All orders
    const { data: orders } = await adminSb
      .from('orders')
      .select('id, total, status, customer_email, is_first_order, created_at')
      .neq('status', 'cancelled')

    // Revenue stats
    const confirmed = orders?.filter(o => ['confirmed','shipped','delivered'].includes(o.status)) ?? []
    const totalRevenue    = confirmed.reduce((s, o) => s + o.total, 0)
    const avgOrderValue   = confirmed.length ? totalRevenue / confirmed.length : 0

    // Unique customers
    const allEmails      = [...new Set(orders?.map(o => o.customer_email) ?? [])]
    const firstOrders    = orders?.filter(o => o.is_first_order) ?? []
    const returningEmails = allEmails.filter(email => {
      const emailOrders = orders?.filter(o => o.customer_email === email) ?? []
      return emailOrders.length > 1
    })

    // Order status breakdown
    const statusBreakdown = {
      pending:   orders?.filter(o => o.status === 'pending').length   ?? 0,
      confirmed: orders?.filter(o => o.status === 'confirmed').length ?? 0,
      shipped:   orders?.filter(o => o.status === 'shipped').length   ?? 0,
      delivered: orders?.filter(o => o.status === 'delivered').length ?? 0,
      cancelled: orders?.filter(o => o.status === 'cancelled').length ?? 0,
    }

    // Revenue by day (last 7 days)
    const now = new Date()
    const revenueByDay = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (6 - i))
      const dateStr = date.toISOString().split('T')[0]
      const dayOrders = confirmed.filter(o => o.created_at.startsWith(dateStr))
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayOrders.reduce((s, o) => s + o.total, 0),
        orders:  dayOrders.length,
      }
    })

    // Top products
    const { data: topProducts } = await adminSb
      .from('order_items')
      .select('product_name, total_price, quantity')
      .limit(100)

    const productRevMap: Record<string, number> = {}
    topProducts?.forEach(item => {
      productRevMap[item.product_name] = (productRevMap[item.product_name] || 0) + item.total_price
    })
    const topProductsList = Object.entries(productRevMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, revenue]) => ({ name, revenue }))

    // Profiles for customer details
    const { data: profiles } = await adminSb
      .from('profiles')
      .select('id, full_name, email, created_at')
      .eq('role', 'customer')

    // Build customer list with order counts
    const customers = profiles?.map(p => {
      const custOrders = orders?.filter(o => o.customer_email === p.email) ?? []
      const ltv = custOrders.reduce((s, o) => s + o.total, 0)
      return {
        ...p,
        order_count: custOrders.length,
        ltv,
        segment: custOrders.length === 0 ? 'new'
          : custOrders.length === 1 ? 'new'
          : custOrders.length < 5  ? 'repeat'
          : 'vip',
      }
    }).sort((a, b) => b.order_count - a.order_count) ?? []

    return NextResponse.json({
      data: {
        revenue: {
          total:    Math.round(totalRevenue * 100) / 100,
          avg:      Math.round(avgOrderValue * 100) / 100,
          byDay:    revenueByDay,
        },
        orders: {
          total:    orders?.length ?? 0,
          breakdown: statusBreakdown,
        },
        customers: {
          total:    allEmails.length,
          new:      firstOrders.length,
          returning: returningEmails.length,
          vip:      returningEmails.filter(email => (orders?.filter(o => o.customer_email === email).length ?? 0) >= 5).length,
          list:     customers,
        },
        repeatRate: allEmails.length
          ? Math.round((returningEmails.length / allEmails.length) * 100)
          : 0,
        topProducts: topProductsList,
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
