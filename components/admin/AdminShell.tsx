'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { group: 'Overview', items: [
    { href:'/admin',            label:'Dashboard',   icon:'▦' },
    { href:'/admin/analytics',  label:'Analytics',   icon:'↗' },
  ]},
  { group: 'Store', items: [
    { href:'/admin/products',   label:'Products',    icon:'◈' },
    { href:'/admin/collections',label:'Collections', icon:'⊞' },
    { href:'/admin/orders',     label:'Orders',      icon:'≡' },
    { href:'/admin/customers',  label:'Customers',   icon:'◎' },
    { href:'/admin/reviews',    label:'Reviews',     icon:'✦' },
  ]},
  { group: 'Content', items: [
    { href:'/admin/settings',   label:'Settings',    icon:'⚙' },
  ]},
]

export default function AdminShell({ children, active }: { children: React.ReactNode; active: string }) {
  const pathname = usePathname()

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0d0f12', fontFamily:'DM Sans,sans-serif' }}>

      {/* Sidebar */}
      <aside style={{ width:220, background:'#141720', borderRight:'1px solid #2a3050', display:'flex', flexDirection:'column', flexShrink:0, position:'sticky', top:0, height:'100vh', overflowY:'auto' }}>
        <div style={{ padding:'1.5rem 1.25rem 1rem', borderBottom:'1px solid #2a3050' }}>
          <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:600, color:'#d4b896', letterSpacing:4 }}>VIAURA</div>
          <div style={{ fontSize:10, color:'#555e82', letterSpacing:2, textTransform:'uppercase', marginTop:2 }}>Admin Console</div>
        </div>

        <nav style={{ flex:1, padding:'.5rem 0' }}>
          {nav.map(section => (
            <div key={section.group} style={{ marginBottom:4 }}>
              <div style={{ padding:'.5rem 1.25rem .2rem', fontSize:9, letterSpacing:3, textTransform:'uppercase', color:'#555e82' }}>
                {section.group}
              </div>
              {section.items.map(item => {
                const active = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}
                    style={{
                      display:'flex', alignItems:'center', gap:10,
                      padding:'.55rem 1.25rem', fontSize:13,
                      borderLeft: `2px solid ${active?'#b8956a':'transparent'}`,
                      background: active?'#1c2030':'transparent',
                      color: active?'#d4b896':'#8b93b8',
                      textDecoration:'none', transition:'all .15s',
                    }}>
                    <span style={{ fontSize:14, opacity:.7 }}>{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding:'1rem 1.25rem', borderTop:'1px solid #2a3050' }}>
          <Link href="/"
            style={{ display:'block', fontSize:11, color:'#555e82', textDecoration:'none', letterSpacing:1, textTransform:'uppercase', marginBottom:10 }}>
            ← View Store
          </Link>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:30, height:30, background:'#b8956a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#0d0f12', flexShrink:0 }}>VA</div>
            <div>
              <div style={{ fontSize:12, fontWeight:500, color:'#e8ecf8' }}>Admin</div>
              <div style={{ fontSize:10, color:'#555e82' }}>VIAURA HQ</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <header style={{ background:'#141720', borderBottom:'1px solid #2a3050', padding:'.75rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:40 }}>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:500, color:'#e8ecf8', margin:0, textTransform:'capitalize' }}>{active}</h1>
          <div style={{ display:'flex', gap:8 }}>
            <Link href="/admin/products" style={{ background:'#b8956a', color:'#0d0f12', padding:'6px 14px', fontSize:11, fontWeight:600, borderRadius:4, textDecoration:'none', letterSpacing:.5 }}>
              + New Product
            </Link>
          </div>
        </header>
        <main style={{ flex:1, padding:'1.5rem', overflowAuto:'auto' } as any}>
          {children}
        </main>
      </div>
    </div>
  )
}
