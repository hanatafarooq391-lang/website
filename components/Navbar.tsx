'use client'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href:'/',           label:'Home',        icon:'🏠' },
  { href:'/collection', label:'Collection',  icon:'✨' },
  { href:'/reviews',    label:'Reviews',     icon:'⭐' },
  { href:'/track',      label:'Track Order', icon:'📦' },
]

export default function Navbar({ brandName = 'VIAURA' }: { brandName?: string }) {
  const pathname  = usePathname()
  const itemCount = useCartStore(s => s.itemCount())
  const [mounted,   setMounted]   = useState(false)
  const [sidebar,   setSidebar]   = useState(false)

  useEffect(() => setMounted(true), [])
  useEffect(() => { document.body.style.overflow = sidebar ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [sidebar])
  useEffect(() => setSidebar(false), [pathname])

  return (
    <>
      <nav style={{ background:'#1a1510', position:'sticky', top:0, zIndex:100, borderBottom:'1px solid rgba(184,149,106,.12)', boxShadow:'0 2px 20px rgba(0,0,0,.3)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 1.25rem', height:60, display:'flex', alignItems:'center', justifyContent:'space-between' }}>

          {/* Logo */}
          <Link href="/" style={{ fontFamily:'Cormorant Garamond,serif', fontSize:20, fontWeight:300, color:'#d4b896', letterSpacing:5, textTransform:'uppercase', textDecoration:'none', flexShrink:0 }}>
            {brandName}
          </Link>

          {/* Desktop */}
          <div className="hide-mobile" style={{ display:'flex', gap:'1.75rem', alignItems:'center' }}>
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{ color:pathname===l.href?'#d4b896':'#c9bfb2', fontSize:11, letterSpacing:2, textTransform:'uppercase', textDecoration:'none', transition:'color .2s', borderBottom:`1px solid ${pathname===l.href?'#b8956a':'transparent'}`, paddingBottom:1 }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Cart */}
            <Link href="/cart" style={{ display:'flex', alignItems:'center', gap:6, color:'#d4b896', textDecoration:'none', border:'1px solid #8a6a42', padding:'6px 12px', fontSize:10, letterSpacing:2, textTransform:'uppercase', transition:'all .2s' }}>
              <span>🛒</span>
              {mounted && itemCount > 0 && (
                <span style={{ background:'#b8956a', color:'#1a1510', borderRadius:'50%', width:18, height:18, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700 }}>
                  {itemCount}
                </span>
              )}
              <span className="hide-mobile">Cart</span>
            </Link>

            {/* Hamburger */}
            <button onClick={() => setSidebar(true)} className="show-mobile"
              style={{ background:'transparent', border:'1px solid rgba(184,149,106,.3)', borderRadius:4, color:'#d4b896', cursor:'pointer', padding:'7px 10px', fontSize:18, lineHeight:1 }}>
              ☰
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {sidebar && (
        <div onClick={() => setSidebar(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.65)', zIndex:200, backdropFilter:'blur(4px)' }} />
      )}

      {/* Sidebar */}
      <aside style={{ position:'fixed', top:0, right:0, bottom:0, width:280, background:'#1a1510', borderLeft:'1px solid rgba(184,149,106,.15)', zIndex:201, transform:sidebar?'translateX(0)':'translateX(100%)', transition:'transform .3s cubic-bezier(.4,0,.2,1)', display:'flex', flexDirection:'column', boxShadow:sidebar?'-20px 0 60px rgba(0,0,0,.5)':'none' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.25rem 1.5rem', borderBottom:'1px solid rgba(184,149,106,.1)' }}>
          <Link href="/" onClick={() => setSidebar(false)} style={{ fontFamily:'Cormorant Garamond,serif', fontSize:18, fontWeight:300, color:'#d4b896', letterSpacing:4, textTransform:'uppercase', textDecoration:'none' }}>
            {brandName}
          </Link>
          <button onClick={() => setSidebar(false)} style={{ background:'rgba(255,255,255,.07)', border:'none', color:'#8a7d6e', cursor:'pointer', fontSize:16, width:34, height:34, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
            ✕
          </button>
        </div>

        {/* Links */}
        <nav style={{ flex:1, padding:'0.75rem 0' }}>
          {LINKS.map(l => {
            const active = pathname === l.href
            return (
              <Link key={l.href} href={l.href} onClick={() => setSidebar(false)}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 1.5rem', color:active?'#d4b896':'#c9bfb2', textDecoration:'none', fontSize:13, letterSpacing:1.5, textTransform:'uppercase', fontFamily:'Jost,sans-serif', background:active?'rgba(184,149,106,.08)':'transparent', borderLeft:`3px solid ${active?'#b8956a':'transparent'}`, transition:'all .15s' }}>
                <span style={{ fontSize:18, width:24, textAlign:'center' }}>{l.icon}</span>
                {l.label}
              </Link>
            )
          })}

          {/* Cart in sidebar */}
          <Link href="/cart" onClick={() => setSidebar(false)}
            style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 1.5rem', color:pathname==='/cart'?'#d4b896':'#c9bfb2', textDecoration:'none', fontSize:13, letterSpacing:1.5, textTransform:'uppercase', fontFamily:'Jost,sans-serif', background:pathname==='/cart'?'rgba(184,149,106,.08)':'transparent', borderLeft:`3px solid ${pathname==='/cart'?'#b8956a':'transparent'}`, transition:'all .15s' }}>
            <span style={{ fontSize:18, width:24, textAlign:'center' }}>🛒</span>
            Cart
            {mounted && itemCount > 0 && (
              <span style={{ marginLeft:'auto', background:'#b8956a', color:'#1a1510', borderRadius:10, padding:'1px 8px', fontSize:10, fontWeight:700 }}>
                {itemCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Bottom */}
        <div style={{ padding:'1.25rem 1.5rem', borderTop:'1px solid rgba(184,149,106,.1)', display:'flex', flexDirection:'column', gap:10 }}>
          <a href="https://wa.me/923000000000?text=Hi VIAURA" target="_blank" rel="noopener noreferrer"
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'#25D366', color:'white', padding:'10px', borderRadius:6, fontSize:12, fontFamily:'Jost,sans-serif', textDecoration:'none', letterSpacing:1, textTransform:'uppercase' }}>
            💬 WhatsApp Support
          </a>
          <p style={{ fontSize:10, color:'#3d3328', textAlign:'center', letterSpacing:1 }}>© 2025 VIAURA</p>
        </div>
      </aside>
    </>
  )
}
