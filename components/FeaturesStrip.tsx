'use client'
import { useEffect, useRef } from 'react'

interface Feature { title: string; text: string }

const DEFAULTS: Feature[] = [
  { title:'Aged to Perfection',  text:'Raw materials matured 12–36 months' },
  { title:'Natural Extracts',    text:'100% ethically harvested botanicals' },
  { title:'Free Shipping',       text:'Rs.50,000+ orders pe free delivery'  },
  { title:'Luxury Packaging',    text:'Signature VIAURA gift wrapping'       },
]

export default function FeaturesStrip({ features }: { features: Feature[] }) {
  const items = features?.length ? features : DEFAULTS
  const ref   = useRef<HTMLElement>(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.feat-item') ?? []
    const io  = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            (entry.target as HTMLElement).style.opacity    = '1'
            ;(entry.target as HTMLElement).style.transform = 'translateY(0)'
          }, i * 100)
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.2 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section ref={ref} style={{ background:'#1a1510', padding:'3rem 1.5rem', borderTop:'1px solid rgba(255,255,255,.05)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:'2rem' }}>
        {items.map((f, i) => (
          <div key={i} className="feat-item" style={{ textAlign:'center', opacity:0, transform:'translateY(16px)', transition:'all .5s ease' }}>
            <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1rem', color:'#e8ddd0', marginBottom:5, letterSpacing:1 }}>{f.title}</div>
            <div style={{ fontSize:11, color:'#6b5f52', lineHeight:1.7 }}>{f.text}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
