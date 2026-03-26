'use client'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { price } from '@/lib/currency'
import type { Product } from '@/types'

function stars(n: number) {
  const f = Math.max(0,Math.min(5,Math.floor(n||0)))
  return '★'.repeat(f) + '☆'.repeat(5-f)
}

export function BottleSVG({ color, neck, h=140 }: { color:string; neck:string; h?:number }) {
  const s = h/160
  return (
    <div style={{ transform:`scale(${s})`, transformOrigin:'center', display:'inline-block' }}>
      <div style={{ width:28, height:16, background:neck, margin:'0 auto', borderRadius:'2px 2px 0 0', filter:'brightness(1.4)' }} />
      <div style={{ width:20, height:32, background:neck, margin:'0 auto' }} />
      <div style={{ width:64, height:110, background:color, margin:'0 auto', borderRadius:'6px 6px 3px 3px', position:'relative' }}>
        <div style={{ position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)', width:42, height:42, background:'rgba(255,255,255,.1)', borderRadius:2, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:6, color:'rgba(255,255,255,.65)', letterSpacing:1, textTransform:'uppercase', textAlign:'center', fontFamily:'Jost,sans-serif', lineHeight:1.6 }}>VIAURA</span>
        </div>
      </div>
    </div>
  )
}

export default function ProductCard({ product }: { product: Product }) {
  const addItem     = useCartStore(s => s.addItem)
  const defaultSize = product.sizes?.[product.sizes.length>1?1:0] ?? '50ml'
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const imageUrl   = (product as any).image_url as string|undefined
  const salePrice  = (product as any).sale_price as number|undefined
  const saleLabel  = (product as any).sale_label as string|undefined
  const discPct    = salePrice ? Math.round((1 - salePrice/product.price)*100) : 0

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    addItem(product, defaultSize)
    toast.success(`${product.name} cart mein! 🛒`)
  }

  return (
    <Link href={`/product/${product.slug}`}
      style={{ textDecoration:'none', display:'block', border:'1px solid #e8e0d4', background:'white', overflow:'hidden', borderRadius:2 }}
      className="product-card">

      {/* Image */}
      <div style={{ height:240, background:product.bg_color??'#f5f0e8', position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {/* Badges */}
        {product.featured && !salePrice && (
          <span style={{ position:'absolute', top:12, left:12, background:'#1a1510', color:'#d4b896', fontSize:8, letterSpacing:2, textTransform:'uppercase', padding:'4px 8px', zIndex:2 }}>Bestseller</span>
        )}
        {salePrice && (
          <span style={{ position:'absolute', top:12, left:12, background:'#f87171', color:'white', fontSize:8, letterSpacing:1, textTransform:'uppercase', padding:'4px 8px', zIndex:2, fontWeight:700 }}>
            {saleLabel || `${discPct}% OFF`}
          </span>
        )}

        {imageUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={imageUrl} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .4s ease' }}
              onError={e=>{(e.target as HTMLImageElement).style.display='none'}}
              onMouseOver={e=>(e.target as HTMLImageElement).style.transform='scale(1.04)'}
              onMouseOut={e=>(e.target as HTMLImageElement).style.transform='scale(1)'} />
          : <BottleSVG color={product.bottle_color??'#333'} neck={product.neck_color??product.bottle_color??'#333'} h={130} />
        }

        {/* Quick add */}
        {mounted && (
          <button onClick={handleAdd} className="pcard-quick"
            style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(26,21,16,.92)', backdropFilter:'blur(4px)', color:'#d4b896', fontSize:10, letterSpacing:2, textTransform:'uppercase', padding:'11px', textAlign:'center', fontFamily:'Jost,sans-serif', border:'none', cursor:'pointer' }}>
            + Cart Mein Add Karein
          </button>
        )}
      </div>

      {/* Info */}
      <div style={{ padding:'16px 18px 18px', background:'white', borderTop:'1px solid #f2ede4' }}>
        <p style={{ fontSize:9, letterSpacing:3, textTransform:'uppercase', color:'#b8956a', marginBottom:3 }}>{product.collection}</p>
        <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.2rem', color:'#1a1510', marginBottom:3, fontWeight:400 }}>{product.name}</h3>
        <p style={{ fontSize:11, color:'#8a7d6e', lineHeight:1.6, marginBottom:10 }}>{product.description}</p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            {salePrice ? (
              <>
                <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.15rem', color:'#f87171', fontWeight:600 }}>{price(salePrice)}</span>
                <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1rem', color:'#bbb', textDecoration:'line-through' }}>{price(product.price)}</span>
              </>
            ) : (
              <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.15rem', color:'#3d3328' }}>{price(product.price)}</span>
            )}
          </div>
          {(product.avg_rating??0)>0 && (
            <span style={{ fontSize:11, color:'#b8956a' }}>
              {stars(product.avg_rating??0)} <span style={{ fontSize:10, color:'#8a7d6e' }}>({product.review_count??0})</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}