'use client'
import Link from 'next/link'

export default function Footer({ brandName = 'VIAURA' }: { brandName?: string }) {
  return (
    <footer style={{ background:'#1a1510', color:'#8a7d6e', paddingTop:'3rem' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 1.5rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px,1fr))', gap:'2.5rem', paddingBottom:'2.5rem', borderBottom:'1px solid #2a2018' }}>

          {/* Brand */}
          <div>
            <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, fontWeight:300, color:'#d4b896', letterSpacing:5, textTransform:'uppercase', marginBottom:12 }}>{brandName}</div>
            <p style={{ fontSize:12, lineHeight:1.8, color:'#6b5f52', maxWidth:220 }}>Rare fragrances crafted from the finest botanicals on earth. Luxury delivered to your door.</p>
            <div style={{ display:'flex', gap:12, marginTop:16 }}>
              {[
                { label:'Instagram', href:'https://instagram.com',       icon:'📸' },
                { label:'WhatsApp',  href:'https://wa.me/923000000000', icon:'💬' },
                { label:'Facebook',  href:'https://facebook.com',        icon:'📘' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                  style={{ width:36, height:36, border:'1px solid #2a2018', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, textDecoration:'none' }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#b8956a', marginBottom:16, fontWeight:400 }}>Collections</h4>
            {[
              { label:'Men',            href:'/collection?gender=men'    },
              { label:'Women',          href:'/collection?gender=women'  },
              { label:'Kids',           href:'/collection?gender=kids'   },
              { label:'Sale',           href:'/collection?collection=sale'},
              { label:'All Fragrances', href:'/collection'               },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ display:'block', fontSize:13, color:'#6b5f52', marginBottom:10, textDecoration:'none' }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Customer */}
          <div>
            <h4 style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#b8956a', marginBottom:16, fontWeight:400 }}>Customer</h4>
            {[
              { label:'🔍 Track My Order',    href:'/track'                   },
              { label:'⭐ Customer Reviews',   href:'/reviews'                 },
              { label:'🔐 Login / Register',  href:'/auth/login'              },
              { label:'📧 Contact Us',        href:'mailto:hello@viaura.com'  },
              { label:'💬 WhatsApp Support',  href:'https://wa.me/923000000000'},
            ].map(l => (
              <a key={l.label} href={l.href} style={{ display:'block', fontSize:13, color:'#6b5f52', marginBottom:10, textDecoration:'none' }}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#b8956a', marginBottom:16, fontWeight:400 }}>Contact</h4>
            <div style={{ fontSize:13, color:'#6b5f52', lineHeight:2.2 }}>
              <div>📧 hello@viaura.com</div>
              <div>📱 +92 300 0000000</div>
              <div>🕐 Mon–Sat, 10am–7pm</div>
              <div>📦 Free shipping: Rs.50,000+</div>
              <div>🚚 Standard: Rs.250</div>
            </div>
            <a href="https://wa.me/923000000000?text=Hi VIAURA, I need help with my order"
              target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:8, marginTop:14, background:'#25D366', color:'white', padding:'8px 16px', fontSize:11, letterSpacing:1, textTransform:'uppercase', textDecoration:'none', borderRadius:2 }}>
              💬 WhatsApp Us
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.25rem 0', flexWrap:'wrap', gap:'1rem' }}>
          <p style={{ fontSize:11, color:'#3d3328', margin:0 }}>© {new Date().getFullYear()} {brandName} · All rights reserved</p>
          <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap' }}>
            {['Privacy Policy','Terms of Service','Shipping Policy'].map(t => (
              <span key={t} style={{ fontSize:11, color:'#3d3328', cursor:'pointer' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
