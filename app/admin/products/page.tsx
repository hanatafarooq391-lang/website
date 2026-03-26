import { createAdminSupabase } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import AdminProductsClient from '@/components/admin/AdminProductsClient'

export default async function AdminProductsPage() {
  const supabase = createAdminSupabase()
  const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  return (
    <AdminShell active="products">
      <AdminProductsClient products={products ?? []} />
    </AdminShell>
  )
}
