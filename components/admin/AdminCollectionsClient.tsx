'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const GENDER_TABS = [
  { value:'men',   label:'Men',   color:'#60a5fa', emoji:'👨' },
  { value:'women', label:'Women', color:'#f9a8d4', emoji:'👩' },
  { value:'kids',  label:'Kids',  color:'#3ecf8e', emoji:'👶' },
  { value:'sale',  label:'Sale',  color:'#f87171', emoji:'🏷️' },
]

// Card settings — what admins can edit
const DEFAULT_CARD_SETTINGS = {
  men:   { label:'Men',   tagline:'For Him',  emoji:'🖤', bg:'linear-gradient(160deg,#1a1208,#2a1f10)' },
  women: { label:'Women', tagline:'For Her',  emoji:'🌹', bg:'linear-gradient(160deg,#2a1520,#1a0d14)' },
  kids:  { label:'Kids',  tagline:'For Them', emoji:'✨', bg:'linear-gradient(160deg,#1a2a1a,#0d1a0d)'  },
}

export default function AdminCollectionsClient({ products, counts }: {
  products: any[]
  counts:   { men:number; women:number; kids:number; sale:number }
}) {
  const router     = useRouter()
  const [active, setActive] = useState<'men'|'women'|'kids'|'sale'>('men')
  const [cardSettings, setCardSettings] = useState<any>(DEFAULT_CARD_SETTINGS)
  const [editCard, setEditCard] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [search,   setSearch]   = useState('')

  // Products for active tab
  const tabProducts = products.filter(p => {
    const match = active === 'sale'
      ? p.sale_price && p.status === 'active'
      : p.gender === active && p.status === 'active'
    if (!match) return false
    if (search) return p.name.toLowerCase().includes(search.toLowerCase())
    return true
  })

  // Move product gender
  async function changeGender(productId: string, gender: string) {
    const res = await fetch(`/api/products/${productId}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ gender }),
    })
    if (res.ok) {
      toast.success(`Product moved to ${gender}!`)
      router.refresh()
    } else toast.error('Move nahi hua')
  }

  // Save card settings to site_settings
  async function saveCardSettings() {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ collection_cards: cardSettings }),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('✅ Card settings save ho gayi — store pe update!')
      router.refresh()
      setEditCard(false)
    } catch (err: any) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const SC = (gender: string, k: string, v: string) =>
    setCardSettings((prev: any) => ({ ...prev, [gender]: { ...prev[gender], [k]: v } }))

  const inp: React.CSSProperties = { background:'#1c2030', border:'1px solid #2a3050', color:'#e8ecf8', padding:'8px 12px', fontFamily:'DM Sans,sans-serif', fontSize:13, borderRadius:4, outline:'none', width:'100%' }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10 }}>
        {GENDER_TABS.map(t => (
          <div key={t.value} className="acard" style={{ position:'relative', overflow:'hidden', cursor:'pointer', border: active===t.value?`1px solid ${t.color}`:'1px solid #2a3050', transition:'border .2s' }} onClick={()=>setActive(t.value as any)}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background: active===t.value?t.color:'transparent', transition:'background .2s' }} />
            <div style={{ fontSize:18, marginBottom:4 }}>{t.emoji}</div>
            <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'#555e82', marginBottom:2 }}>{t.label}</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:24, fontWeight:600, color: active===t.value?t.color:'#e8ecf8' }}>
              {counts[t.value as keyof typeof counts]}
            </div>
            <div style={{ fontSize:10, color:'#555e82' }}>products</div>
          </div>
        ))}
      </div>

      {/* Card Editor */}
      {active !== 'sale' && (
        <div className="acard">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: editCard?16:0 }}>
            <div>
              <span style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:500, color:'#e8ecf8' }}>
                {GENDER_TABS.find(t=>t.value===active)?.emoji} {cardSettings[active]?.label} — Homepage Card
              </span>
              <p style={{ fontSize:11, color:'#555e82', marginTop:2 }}>Store pe jo card dikhta hai usko edit karein</p>
            </div>
            <button onClick={()=>setEditCard(!editCard)} className="abtn-ghost abtn-sm">
              {editCard ? 'Cancel' : '✏️ Edit Card'}
            </button>
          </div>

          {editCard && (
            <div>
              {/* Preview */}
              <div style={{ marginBottom:16, borderRadius:8, overflow:'hidden', maxWidth:220, height:150, display:'flex', alignItems:'flex-end', padding:'1rem', background:cardSettings[active]?.bg, border:'1px solid #3a4268', position:'relative' }}>
                <span style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', opacity:.08, fontFamily:'Cormorant Garamond,serif', fontSize:'5rem', color:'#d4b896', fontStyle:'italic', pointerEvents:'none' }}>
                  {cardSettings[active]?.label[0]}
                </span>
                <span style={{ position:'absolute', top:10, right:10, fontSize:18 }}>{cardSettings[active]?.emoji}</span>
                <div style={{ position:'relative', zIndex:1 }}>
                  <p style={{ fontSize:9, letterSpacing:3, textTransform:'uppercase', color:'#b8956a', marginBottom:3 }}>{cardSettings[active]?.tagline}</p>
                  <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.3rem', color:'#f5ede0', fontWeight:300, margin:0 }}>{cardSettings[active]?.label}</h3>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:14 }}>
                <div>
                  <label style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'#555e82', display:'block', marginBottom:4 }}>Label</label>
                  <input value={cardSettings[active]?.label??''} onChange={e=>SC(active,'label',e.target.value)} style={inp} placeholder="Men" />
                </div>
                <div>
                  <label style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'#555e82', display:'block', marginBottom:4 }}>Tagline</label>
                  <input value={cardSettings[active]?.tagline??''} onChange={e=>SC(active,'tagline',e.target.value)} style={inp} placeholder="For Him" />
                </div>
                <div>
                  <label style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'#555e82', display:'block', marginBottom:4 }}>Emoji</label>
                  <input value={cardSettings[active]?.emoji??''} onChange={e=>SC(active,'emoji',e.target.value)} style={inp} placeholder="🖤" />
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'#555e82', display:'block', marginBottom:4 }}>
                    Background (CSS gradient)
                  </label>
                  <input value={cardSettings[active]?.bg??''} onChange={e=>SC(active,'bg',e.target.value)} style={inp} placeholder="linear-gradient(160deg,#1a1208,#2a1f10)" />
                  <p style={{ fontSize:10, color:'#555e82', marginTop:3 }}>Any CSS background value — color ya gradient</p>
                </div>
              </div>

              <button onClick={saveCardSettings} disabled={saving} className="abtn-gold">
                {saving ? 'Saving...' : '✅ Save & Update Store'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Products list */}
      <div className="acard">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <span style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:500, color:'#e8ecf8' }}>
            {GENDER_TABS.find(t=>t.value===active)?.emoji} {active==='sale'?'Sale Products':active.charAt(0).toUpperCase()+active.slice(1)+' Products'}
            <span style={{ fontSize:12, color:'#555e82', marginLeft:8 }}>({tabProducts.length})</span>
          </span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."
            style={{ background:'#1c2030', border:'1px solid #2a3050', color:'#e8ecf8', padding:'5px 10px', fontSize:12, borderRadius:4, outline:'none', width:160 }} />
        </div>

        {tabProducts.length === 0 ? (
          <div style={{ textAlign:'center', padding:'2rem', color:'#555e82', fontSize:13 }}>
            {active==='sale' ? 'Koi sale product nahi — Products mein discount add karein'
              : `Koi ${active} product nahi — Products mein gender set karein`}
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
            {tabProducts.map((p:any) => (
              <div key={p.id} style={{ background:'#1c2030', border:'1px solid #2a3050', borderRadius:6, overflow:'hidden' }}>
                <div style={{ height:100, background:p.bg_color||'#f5f0e8', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', position:'relative' }}>
                  {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <div style={{ width:28, height:48, background:p.bottle_color||'#333', borderRadius:4 }} />}
                  {p.sale_price && <span style={{ position:'absolute', top:4, right:4, background:'#f87171', color:'white', fontSize:8, padding:'2px 5px', borderRadius:2, fontWeight:600 }}>SALE</span>}
                </div>
                <div style={{ padding:'8px 10px' }}>
                  <div style={{ fontSize:11, fontWeight:500, color:'#e8ecf8', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize:11, color:p.sale_price?'#f87171':'#8b93b8', fontFamily:'DM Mono,monospace', marginBottom:5 }}>
                    Rs.{Number(p.sale_price||p.price).toLocaleString()}
                  </div>
                  {/* Change gender */}
                  {active !== 'sale' && (
                    <select defaultValue={p.gender} onChange={e=>changeGender(p.id,e.target.value)}
                      style={{ width:'100%', background:'#0d0f12', border:'1px solid #2a3050', color:'#8b93b8', padding:'3px 6px', fontSize:10, borderRadius:3, outline:'none', cursor:'pointer' }}>
                      {['men','women','kids','unisex'].map(g=><option key={g} value={g}>{g}</option>)}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guide */}
      <div style={{ background:'#1c2030', border:'1px solid #2a3050', borderRadius:8, padding:'1rem 1.25rem', fontSize:12, color:'#555e82', lineHeight:1.8 }}>
        <div style={{ color:'#d4b896', fontWeight:500, marginBottom:6 }}>ℹ️ Collections Guide</div>
        <div>👨 <strong style={{ color:'#8b93b8' }}>Men/Women/Kids</strong> — Product ka gender change karo → automatically us collection mein aa jaata hai</div>
        <div>🏷️ <strong style={{ color:'#8b93b8' }}>Sale</strong> — Automatic, product mein discount lagao → Sale collection mein aa jaata hai</div>
        <div>✏️ <strong style={{ color:'#8b93b8' }}>Card Edit</strong> — Homepage pe jo card dikhta hai uska text, emoji, color change kar sakte ho</div>
      </div>
    </div>
  )
}
