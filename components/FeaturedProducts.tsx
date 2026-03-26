'use client'
import Link from 'next/link'
import ProductCard from './ProductCard'
import { useEffect, useRef } from 'react'
import type { Product } from '@/types'

export default function FeaturedProducts({ products, label }: { products: Product[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cards = ref.current?.querySelectorAll('.product-card') ?? []
    const io = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            (entry.target as HTMLElement).style.opacity    = '1'
            ;(entry.target as HTMLElement).style.transform = 'translateY(0)'
          }, i * 80)
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })
    cards.forEach(c => {
      (c as HTMLElement).style.opacity    = '0'
      ;(c as HTMLElement).style.transform = 'translateY(20px)'
      io.observe(c)
    })
    return () => io.disconnect()
  }, [products])

  return (
    <section style={{ background:'#f2ede4' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'3rem 1.5rem' }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'2rem', gap:'1rem', flexWrap:'wrap' }}>
          <div>
            <p style={{ fontSize:10, letterSpacing:5, textTransform:'uppercase', color:'#b8956a', marginBottom:6 }}>Bestsellers</p>
            <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.6rem,4vw,2.5rem)', fontWeight:300, color:'#1a1510' }}>{label}</h2>
          </div>
          <Link href="/collection" className="btn-outline-gold" style={{ whiteSpace:'nowrap' }}>View All</Link>
        </div>
        <div ref={ref} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:'1.25rem' }}>
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}
