'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

interface Card { slug: string; label: string; tagline: string; emoji: string; bg: string; count?: number }

const DEFAULT_CARDS: Card[] = [
  { slug:'men',   label:'Men',   tagline:'For Him',  emoji:'🖤', bg:'linear-gradient(160deg,#1a1208,#2a1f10)' },
  { slug:'women', label:'Women', tagline:'For Her',  emoji:'🌹', bg:'linear-gradient(160deg,#2a1520,#1a0d14)' },
  { slug:'kids',  label:'Kids',  tagline:'For Them', emoji:'✨', bg:'linear-gradient(160deg,#1a2a1a,#0d1a0d)'  },
]

export default function CollectionCategories({ cards = DEFAULT_CARDS }: { cards?: Card[] }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.col-card') ?? []
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            (entry.target as HTMLElement).style.opacity    = '1'
            ;(entry.target as HTMLElement).style.transform = 'translateY(0)'
          }, i * 120)
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.15 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section style={{ maxWidth:1200, margin:'0 auto', padding:'3rem 1.5rem' }} ref={ref}>
      <p style={{ fontSize:10, letterSpacing:5, textTransform:'uppercase', color:'#b8956a', marginBottom:6 }}>Shop By</p>
      <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.6rem,4vw,2.5rem)', fontWeight:300, color:'#1a1510', marginBottom:'1.5rem' }}>Browse Collections</h2>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:'1rem' }}>
        {cards.map((c, i) => (
          <Link key={c.slug} href={`/collection?col=${c.slug}`}
            className="col-card"
            style={{
              position:'relative', height:220, overflow:'hidden',
              display:'flex', alignItems:'flex-end', padding:'1.25rem',
              border:'1px solid rgba(255,255,255,.06)', textDecoration:'none',
              background:c.bg, borderRadius:4,
              opacity:0, transform:'translateY(24px)',
              transition:'opacity .5s ease, transform .5s ease, box-shadow .3s',
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 60px rgba(0,0,0,.4)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
            }}>
            {/* Big letter bg */}
            <span style={{
              position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
              opacity:.08, fontFamily:'Cormorant Garamond,serif', fontSize:'7rem',
              color:'#d4b896', fontStyle:'italic', pointerEvents:'none', userSelect:'none',
            }}>
              {c.label[0]}
            </span>
            {/* Emoji accent */}
            <span style={{ position:'absolute', top:16, right:16, fontSize:22, opacity:.7 }}>{c.emoji}</span>
            {/* Count badge */}
            {c.count !== undefined && (
              <span style={{ position:'absolute', top:14, left:14, background:'rgba(184,149,106,.2)', color:'#d4b896', fontSize:9, letterSpacing:2, padding:'3px 8px', borderRadius:2, textTransform:'uppercase' }}>
                {c.count} items
              </span>
            )}
            {/* Text */}
            <div style={{ position:'relative', zIndex:1 }}>
              <p style={{ fontSize:9, letterSpacing:3, textTransform:'uppercase', color:'#b8956a', marginBottom:4 }}>{c.tagline}</p>
              <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.6rem', color:'#f5ede0', fontWeight:300, margin:0 }}>{c.label}</h3>
            </div>
            {/* Hover arrow */}
            <div style={{ position:'absolute', bottom:20, right:20, width:32, height:32, border:'1px solid rgba(212,184,150,.3)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#d4b896', fontSize:14, opacity:.6 }}>→</div>
          </Link>
        ))}
      </div>
    </section>
  )
}
