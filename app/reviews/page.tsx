import { createAdminSupabase } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ReviewsClient from '@/components/ReviewsClient'

export const revalidate = 0

export default async function ReviewsPage() {
  const supabase = createAdminSupabase()
  const [{ data: reviews }, { data: products }] = await Promise.all([
    supabase
      .from('reviews')
      .select('*, product:products(name,gender)')
      .order('created_at', { ascending: false }),  // NO approved filter
    supabase
      .from('products')
      .select('id,name,gender')
      .eq('status', 'active')
      .order('name', { ascending: true }),
  ])
  return (
    <>
      <Navbar />
      <div style={{ background:'#1a1510', padding:'3.5rem 1.5rem', textAlign:'center' }}>
        <p style={{ fontSize:10, letterSpacing:5, textTransform:'uppercase', color:'#b8956a', marginBottom:10 }}>Customer Voices</p>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:300, color:'#f5ede0', fontStyle:'italic', margin:0 }}>
          What They Say
        </h1>
      </div>
      <ReviewsClient reviews={reviews ?? []} products={products ?? []} />
      <Footer />
    </>
  )
}
