import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function CheckoutSuccessPage({ searchParams }: { searchParams: { order?: string } }) {
  return (
    <>
      <Navbar />
      <div style={{ minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'3rem 1.5rem' }}>
        <div style={{ maxWidth:500 }}>
          <div style={{ width:72, height:72, border:'1px solid #b8956a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 2rem', fontSize:28, color:'#b8956a' }}>✓</div>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2rem,5vw,2.8rem)', fontWeight:300, fontStyle:'italic', color:'#1a1510', marginBottom:16 }}>
            Order Confirm!
          </h1>
          <div style={{ width:56, height:1, background:'#b8956a', margin:'0 auto 20px' }} />

          {searchParams.order && (
            <div style={{ background:'#f2ede4', border:'1px solid #e8e0d4', padding:'14px 24px', marginBottom:20, display:'inline-block' }}>
              <p style={{ fontSize:9, letterSpacing:3, textTransform:'uppercase', color:'#8a7d6e', marginBottom:4 }}>Order Number</p>
              <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.4rem', color:'#1a1510' }}>{searchParams.order}</p>
            </div>
          )}

          <div style={{ color:'#8a7d6e', fontSize:13, lineHeight:2, marginBottom:28, background:'#f2ede4', border:'1px solid #e8e0d4', padding:'1.25rem' }}>
            <p>✅ Confirmation email bhej di gayi hai</p>
            <p>📦 Hum jald hi order pack karenge</p>
            <p>🚚 Dispatch hone pe email aayegi</p>
            <p>💵 Delivery pe cash payment karni hogi</p>
          </div>

          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            {searchParams.order && (
              <Link href={`/track?order=${searchParams.order}`}
                style={{ background:'#1a1510', color:'#d4b896', padding:'12px 24px', fontSize:10, letterSpacing:3, textTransform:'uppercase', textDecoration:'none', fontFamily:'Jost,sans-serif' }}>
                🔍 Track Order
              </Link>
            )}
            <Link href="/collection"
              style={{ background:'transparent', border:'1px solid #e8e0d4', color:'#3d3328', padding:'12px 24px', fontSize:10, letterSpacing:3, textTransform:'uppercase', textDecoration:'none', fontFamily:'Jost,sans-serif' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
