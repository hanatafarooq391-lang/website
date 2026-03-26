export const dynamic = 'force-dynamic'
import { createAdminSupabase } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import AdminOrdersClient from '@/components/admin/AdminOrdersClient'

export default async function AdminOrdersPage() {
  const supabase = createAdminSupabase()
  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(product_name, quantity, unit_price, size)')
    .order('created_at', { ascending: false })
    .limit(100)
  return (
    <AdminShell active="orders">
      <AdminOrdersClient orders={orders ?? []} />
    </AdminShell>
  )
}
