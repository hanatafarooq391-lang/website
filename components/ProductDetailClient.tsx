'use client'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { BottleSVG } from './ProductCard'
import { price } from '@/lib/currency'
import type { Product, Review } from '@/types'

function starsStr(n: number) { return '★'.repeat(Math.floor(n)) + '☆'.repeat(5 - Math.floor(n)) }

export default function ProductDetailClient({ product: p, reviews }: { product: Product; reviews: Review[] }) {
  const addItem = useCartStore(s => s.addItem)
  const [size, setSize]   = useState(p.sizes?.[p.sizes.length > 1 ? 1 : 0] ?? '50ml')
  const [acc,  setAcc]    = useState<string|null>('desc')
  const [activeImg, setActiveImg] = useState('')

  const images: string[] = (p as any).images?.length
    ? (p as any).images
    : (p as any).image_url ? [(p as any).image_url] : []

  useEffect(() => { if (images.length > 0) setActiveImg(images[0]) }, [p.id])

  const salePrice   = (p as any).sale_price as number | undefined
  const saleLabel   = (p as any).sale_label as string | undefined
  const discountPct = salePrice ? Math.round((1 - salePrice / p.price) * 100) : 0
  const displayPrice = salePrice ?? p.price

  return (
    <main style={{ maxWidth:1100, margin:'0 auto', padding:'2rem 1.5rem' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px,1fr))', gap:'3rem', alignItems:'start' }}>

        {/* LEFT — Images */}
        <div style={{ position:'sticky', top:72 }}>
          <div style={{ aspectRatio:'1/1', maxHeight:440, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid #e8e0d4', background:p.bg_color??'#f5f0e8', overflow:'hidden', borderRadius:4 }}>
            {activeImg
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={activeImg} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />
              : <BottleSVG color={p.bottle_color??'#333'} neck={p.neck_color??p.bottle_color??'#333'} h={200} />
            }
          </div>
          {images.length > 1 && (
            <div style={{ display:'flex', gap:8, marginTop:10, overflowX:'auto' }}>
              {images.map((url,i) => (
                <div key={i} onClick={()=>setActiveImg(url)} style={{ width:68, height:68, flexShrink:0, cursor:'pointer', border:url===activeImg?'2px solid #b8956a':'1px solid #e8e0d4', borderRadius:4, overflow:'hidden', background:p.bg_color }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Info */}
        <div>
          <p style={{ fontSize:9, letterSpacing:3, textTransform:'uppercase', color:'#b8956a', marginBottom:6 }}>
            {p.collection} · {p.gender==='men'?'For Him':p.gender==='women'?'For Her':'For Kids'}
          </p>
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.8rem,5vw,2.6rem)', fontWeight:300, fontStyle:'italic', color:'#1a1510', lineHeight:1.1, marginBottom:12 }}>
            {p.name}
          </h1>

          {/* Price in PKR */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, flexWrap:'wrap' }}>
            {salePrice ? (
              <>
                <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'2rem', color:'#f87171', fontWeight:600 }}>{price(salePrice)}</span>
                <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.4rem', color:'#aaa', textDecoration:'line-through' }}>{price(p.price)}</span>
                <span style={{ background:'#f87171', color:'white', fontSize:10, padding:'3px 10px', letterSpacing:1, textTransform:'uppercase', fontWeight:600 }}>
                  {saleLabel || `${discountPct}% OFF`}
                </span>
              </>
            ) : (
              <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'2rem', color:'#3d3328' }}>{price(p.price)}</span>
            )}
          </div>

          {(p.avg_rating??0) > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <span style={{ fontSize:16, color:'#b8956a', letterSpacing:2 }}>{starsStr(p.avg_rating??0)}</span>
              <span style={{ fontSize:12, color:'#8a7d6e' }}>{p.avg_rating} · {reviews.length||p.review_count} reviews</span>
            </div>
          )}

          <hr style={{ borderColor:'#e8e0d4', margin:'14px 0' }} />

          {(p.notes??[]).length > 0 && (
            <div style={{ marginBottom:18 }}>
              <p style={{ fontSize:9, letterSpacing:3, textTransform:'uppercase', color:'#8a7d6e', marginBottom:8 }}>Scent Notes</p>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {(p.notes??[]).map((n:string) => (
                  <span key={n} style={{ background:'#f2ede4', border:'1px solid #e8e0d4', padding:'4px 10px', fontSize:11, color:'#3d3328', borderRadius:2 }}>{n}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom:20 }}>
            <p style={{ fontSize:9, letterSpacing:3, textTransform:'uppercase', color:'#8a7d6e', marginBottom:8 }}>Size</p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {(p.sizes??['50ml']).map((s:string) => (
                <button key={s} onClick={()=>setSize(s)} style={{ padding:'8px 16px', border:`1px solid ${size===s?'#1a1510':'#e8e0d4'}`, background:size===s?'#1a1510':'transparent', color:size===s?'#d4b896':'#3d3328', fontFamily:'Jost,sans-serif', fontSize:12, cursor:'pointer', transition:'all .2s' }}>{s}</button>
              ))}
            </div>
          </div>

          <button onClick={()=>{ addItem(p,size); toast.success(`${p.name} cart mein add ho gaya`) }}
            style={{ width:'100%', background:'#1a1510', color:'#d4b896', border:'none', padding:15, fontFamily:'Jost,sans-serif', fontSize:11, letterSpacing:3, textTransform:'uppercase', cursor:'pointer', marginBottom:10, transition:'background .3s' }}
            onMouseOver={e=>(e.target as any).style.background='#8a6a42'}
            onMouseOut={e=>(e.target as any).style.background='#1a1510'}>
            Cart Mein Dalein — {price(displayPrice)}
          </button>

          <div style={{ borderTop:'1px solid #e8e0d4', marginTop:16 }}>
            {[
              { k:'desc',     l:'Description',         t: p.long_desc??p.description },
              { k:'notes',    l:'Ingredients & Notes', t: (p.notes??[]).join(' · ')+' — natural, ethically sourced.' },
              { k:'shipping', l:'Shipping',             t: 'Rs.50,000 se upar ke orders pe free shipping. Standard: Rs.250. Dispatch 1–2 business days mein.' },
            ].map(a=>(
              <div key={a.k} style={{ borderBottom:'1px solid #e8e0d4' }}>
                <button onClick={()=>setAcc(acc===a.k?null:a.k)}
                  style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'#3d3328', background:'none', border:'none', cursor:'pointer' }}>
                  <span>{a.l}</span><span>{acc===a.k?'−':'+'}</span>
                </button>
                {acc===a.k && <div style={{ paddingBottom:12, fontSize:13, color:'#8a7d6e', lineHeight:1.8 }}>{a.t}</div>}
              </div>
            ))}
          </div>

          {reviews.length > 0 && (
            <div style={{ marginTop:20 }}>
              <p style={{ fontSize:9, letterSpacing:3, textTransform:'uppercase', color:'#8a7d6e', marginBottom:12 }}>Customer Reviews</p>
              {reviews.slice(0,2).map(r=>(
                <div key={r.id} style={{ padding:'12px 0', borderBottom:'1px solid #e8e0d4' }}>
                  <div style={{ color:'#b8956a', marginBottom:4, fontSize:14 }}>{starsStr(r.rating)}</div>
                  <p style={{ fontFamily:'Cormorant Garamond,serif', fontStyle:'italic', color:'#1a1510', marginBottom:4 }}>"{r.title}"</p>
                  <p style={{ fontSize:12, color:'#8a7d6e', lineHeight:1.7 }}>{r.body}</p>
                </div>
              ))}
              <a href="/reviews" className="btn-outline-gold" style={{ display:'block', textAlign:'center', marginTop:12 }}>Sab Reviews →</a>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
