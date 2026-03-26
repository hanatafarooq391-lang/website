import { createAdminSupabase } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'

export const revalidate = 0

export default async function CollectionPage({ searchParams }: {
  searchParams: { gender?: string; col?: string }
}) {
  const genderFilter = searchParams.gender ?? 'all'
  const colFilter    = searchParams.col    ?? 'all'
  const sb           = createAdminSupabase()

  const { data: allProducts } = await sb
    .from('products').select('*').eq('status','active').order('created_at',{ascending:false})

  const products = allProducts ?? []
  const hasSale  = products.some((p:any) => p.sale_price)

  // Filter logic
  let filtered = products
  if      (colFilter === 'sale')   filtered = products.filter((p:any) => p.sale_price)
  else if (colFilter === 'men')    filtered = products.filter((p:any) => p.gender === 'men')
  else if (colFilter === 'women')  filtered = products.filter((p:any) => p.gender === 'women')
  else if (colFilter === 'kids')   filtered = products.filter((p:any) => p.gender === 'kids')

  const counts = {
    all:   products.length,
    men:   products.filter((p:any)=>p.gender==='men').length,
    women: products.filter((p:any)=>p.gender==='women').length,
    kids:  products.filter((p:any)=>p.gender==='kids').length,
    sale:  products.filter((p:any)=>p.sale_price).length,
  }

  const tabs = [
    { value:'all',   label:'All',       count:counts.all,   color:'#b8956a' },
    { value:'men',   label:'Men',       count:counts.men,   color:'#60a5fa' },
    { value:'women', label:'Women',     count:counts.women, color:'#f9a8d4' },
    { value:'kids',  label:'Kids',      count:counts.kids,  color:'#3ecf8e' },
    ...(hasSale ? [{ value:'sale', label:'🏷️ Sale', count:counts.sale, color:'#f87171' }] : []),
  ]

  const activeTab = tabs.find(t=>t.value===colFilter) ?? tabs[0]

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <div style={{ background:'linear-gradient(to bottom, #1a1510, #221a12)', padding:'3rem 1.5rem 0', textAlign:'center' }}>
          <p style={{ fontSize:10, letterSpacing:5, textTransform:'uppercase', color:'#b8956a', marginBottom:8 }}>VIAURA</p>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2rem,5vw,3rem)', fontWeight:300, color:'#f5ede0', fontStyle:'italic', margin:0, paddingBottom:'1.5rem' }}>
            {colFilter==='all' ? 'Our Fragrances' : activeTab?.label ?? colFilter}
          </h1>

          {/* Tabs */}
          <div style={{ display:'flex', justifyContent:'center', gap:4, flexWrap:'wrap', paddingBottom:'0', borderBottom:'1px solid rgba(255,255,255,.08)' }}>
            {tabs.map(t=>{
              const isActive = colFilter === t.value
              return (
                <a key={t.value} href={t.value==='all'?'/collection':`/collection?col=${t.value}`}
                  style={{
                    padding:'.75rem 1.25rem', fontSize:11, letterSpacing:2, textTransform:'uppercase',
                    fontFamily:'Jost,sans-serif', textDecoration:'none', whiteSpace:'nowrap',
                    borderBottom:`2px solid ${isActive ? t.color : 'transparent'}`,
                    color: isActive ? t.color : '#8a7d6e',
                    transition:'all .2s',
                  }}>
                  {t.label}
                  <span style={{ marginLeft:5, fontSize:10, opacity:.6 }}>({t.count})</span>
                </a>
              )
            })}
          </div>
        </div>

        {/* Products */}
        <section style={{ maxWidth:1200, margin:'0 auto', padding:'2.5rem 1.5rem' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'5rem 0', color:'#8a7d6e' }}>
              <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.8rem', marginBottom:8 }}>Koi product nahi mila</p>
              <a href="/collection" style={{ color:'#b8956a', fontSize:13 }}>Sab dekhein →</a>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:'1.25rem' }}>
              {filtered.map((p:any) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
