'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

export default function HeroSection({ headline, subtext, ctaText, tagline }: {
  headline: string; subtext: string; ctaText: string; tagline: string
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.hero-el') ?? []
    els.forEach((el, i) => {
      setTimeout(() => {
        (el as HTMLElement).style.opacity    = '1'
        ;(el as HTMLElement).style.transform = 'translateY(0)'
      }, i * 180)
    })
  }, [])

  return (
    <section ref={ref} style={{ minHeight:'90vh', background:'linear-gradient(135deg,#1a1510 0%,#221a12 60%,#1a1510 100%)', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'5rem 1.5rem', position:'relative', overflow:'hidden' }}>
      <div className="hero-dots" />

      {/* Animated rings */}
      <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', border:'1px solid rgba(184,149,106,.06)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', border:'1px solid rgba(184,149,106,.04)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:1, maxWidth:640, width:'100%' }}>
        <p className="hero-el" style={{ fontSize:10, letterSpacing:6, textTransform:'uppercase', color:'#b8956a', marginBottom:'1.5rem', opacity:0, transform:'translateY(20px)', transition:'all .6s ease' }}>
          {tagline}
        </p>
        <h1 className="hero-el" style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2.8rem,8vw,5.5rem)', fontWeight:300, color:'#f5ede0', lineHeight:1.05, marginBottom:'1.5rem', fontStyle:'italic', opacity:0, transform:'translateY(20px)', transition:'all .6s ease' }}
          dangerouslySetInnerHTML={{ __html: headline.replace(/\n/g,'<br/>') }} />

        <div className="hero-el" style={{ width:56, height:1, background:'#b8956a', margin:'0 auto 1.5rem', opacity:0, transform:'translateY(20px)', transition:'all .6s ease' }} />

        <p className="hero-el" style={{ fontSize:'clamp(10px,2vw,12px)', letterSpacing:2, color:'#8a7d6e', textTransform:'uppercase', marginBottom:'2.5rem', lineHeight:1.9, opacity:0, transform:'translateY(20px)', transition:'all .6s ease' }}
          dangerouslySetInnerHTML={{ __html: subtext.replace(/\n/g,'<br/>') }} />

        <div className="hero-el" style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', opacity:0, transform:'translateY(20px)', transition:'all .6s ease' }}>
          <Link href="/collection" className="btn-gold">{ctaText}</Link>
          <Link href="/reviews"    className="btn-outline-gold">Reviews</Link>
        </div>
      </div>
    </section>
  )
}
