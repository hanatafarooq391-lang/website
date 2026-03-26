import { createAdminSupabase } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import AdminCollectionsClient from '@/components/admin/AdminCollectionsClient'

export const revalidate = 0

export default async function AdminCollectionsPage() {
  const sb = createAdminSupabase()
  const { data: products } = await sb
    .from('products')
    .select('id,name,collection,gender,price,sale_price,status,image_url,bottle_color,bg_color,stock,slug')
  
  const counts = {
    men:   (products??[]).filter((p:any)=>p.gender==='men'   && p.status==='active').length,
    women: (products??[]).filter((p:any)=>p.gender==='women' && p.status==='active').length,
    kids:  (products??[]).filter((p:any)=>p.gender==='kids'  && p.status==='active').length,
    sale:  (products??[]).filter((p:any)=>p.sale_price       && p.status==='active').length,
  }

  return (
    <AdminShell active="collections">
      <AdminCollectionsClient products={products ?? []} counts={counts} />
    </AdminShell>
  )
}
