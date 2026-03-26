export const dynamic = 'force-dynamic'
import { createAdminSupabase } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import AdminReviewsClient from '@/components/admin/AdminReviewsClient'

export const revalidate = 0

export default async function AdminReviewsPage() {
  const supabase = createAdminSupabase()
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, product:products(name,gender)')
    .order('created_at', { ascending: false })
  return (
    <AdminShell active="reviews">
      <AdminReviewsClient reviews={reviews ?? []} />
    </AdminShell>
  )
}
