import { createAdminSupabase } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductDetailClient from '@/components/ProductDetailClient'

export const revalidate = 0 // ← no cache

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = createAdminSupabase()
  const { data: product } = await supabase.from('products').select('*').eq('slug',params.slug).eq('status','active').single()
  if (!product) notFound()
  const { data: reviews } = await supabase.from('reviews').select('*').eq('product_id',product.id).eq('approved',true).order('created_at',{ascending:false}).limit(10)
  return (
    <>
      <Navbar />
      <div style={{ background:'#f2ede4', borderBottom:'1px solid #e8e0d4', padding:'.75rem 1.5rem', fontSize:11, color:'#8a7d6e' }}>
        <a href="/" style={{ color:'#8a7d6e', textDecoration:'none' }}>Home</a>
        <span style={{ margin:'0 .5rem' }}>›</span>
        <a href="/collection" style={{ color:'#8a7d6e', textDecoration:'none' }}>Collection</a>
        <span style={{ margin:'0 .5rem' }}>›</span>
        <span style={{ color:'#1a1510' }}>{product.name}</span>
      </div>
      <ProductDetailClient product={product} reviews={reviews??[]} />
      <Footer />
    </>
  )
}
