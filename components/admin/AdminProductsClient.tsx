'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const EMPTY = {
  name:'', collection:'', gender:'men', description:'', long_desc:'',
  price:0, bottle_color:'#333333', bg_color:'#f5ede0', neck_color:'',
  notes:[], sizes:['50ml'], stock:0, status:'active', featured:false,
  image_url:'', images:[], discount_pct:0, sale_price:null, sale_label:'',
}

export default function AdminProductsClient({ products: init }: { products: any[] }) {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>(init)
  const [modal,    setModal]    = useState(false)
  const [ed,       setEd]       = useState<any>(EMPTY)
  const [loading,  setLoading]  = useState(false)
  const [uploading,setUploading]= useState(false)
  const [previews, setPreviews] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const S = (k: string, v: any) => setEd((d: any) => ({ ...d, [k]: v }))

  function openNew()        { setEd({...EMPTY}); setPreviews([]); setModal(true) }
  function openEdit(p: any) {
    setEd({...p, discount_pct:p.discount_pct??0, sale_label:p.sale_label??''})
    setPreviews(p.images?.length ? p.images : p.image_url ? [p.image_url] : [])
    setModal(true)
  }

  const liveSalePrice = ed.discount_pct > 0 && ed.price > 0
    ? Math.round(ed.price * (1 - ed.discount_pct / 100)) : null

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      const res  = await fetch('/api/upload', { method:'POST', body:fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const all = [...previews, ...data.urls]
      setPreviews(all); S('image_url', all[0]); S('images', all)
      toast.success(`${data.urls.length} image upload ho gayi!`)
    } catch (err: any) { toast.error(err.message) }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  function removeImg(url: string) {
    const up = previews.filter(x => x !== url)
    setPreviews(up); S('image_url', up[0]??''); S('images', up)
  }

  // ── SAVE with instant UI update + server revalidation ──
  async function save() {
    if (!ed.name || !ed.price) { toast.error('Name aur price zaroori hain'); return }
    setLoading(true)
    try {
      const isEdit = !!ed.id
      const body = {
        ...ed,
        notes:       typeof ed.notes==='string' ? ed.notes.split(',').map((s:string)=>s.trim()).filter(Boolean) : ed.notes,
        sizes:       typeof ed.sizes==='string' ? ed.sizes.split(',').map((s:string)=>s.trim()).filter(Boolean) : ed.sizes,
        images:      previews,
        image_url:   previews[0] ?? ed.image_url ?? '',
        sale_price:  liveSalePrice,
        discount_pct: Number(ed.discount_pct) || 0,
      }
      const url    = isEdit ? `/api/products/${ed.id}` : '/api/products'
      const method = isEdit ? 'PATCH' : 'POST'
      const res    = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
      const data   = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Instant UI update — no reload needed
      if (isEdit) setProducts(ps => ps.map(p => p.id===data.data.id ? data.data : p))
      else        setProducts(ps => [data.data, ...ps])

      setModal(false)
      toast.success(isEdit ? '✅ Product update ho gaya!' : '✅ Product add ho gaya!')

      // Revalidate server cache silently
      router.refresh()
    } catch (err: any) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  // ── DELETE with instant UI update ──
  async function del(id: string, name: string) {
    if (!confirm(`"${name}" delete karein?`)) return
    // Optimistic — remove immediately
    setProducts(ps => ps.filter(p => p.id !== id))
    try {
      const res = await fetch(`/api/products/${id}`, { method:'DELETE' })
      if (!res.ok) {
        // Rollback if failed
        setProducts(init)
        toast.error('Delete nahi hua')
        return
      }
      toast.success('✅ Product delete ho gaya!')
      router.refresh()
    } catch {
      setProducts(init)
      toast.error('Delete nahi hua')
    }
  }

  async function toggleFeat(p: any) {
    setProducts(ps => ps.map(x => x.id===p.id ? {...x,featured:!x.featured} : x))
    await fetch(`/api/products/${p.id}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ featured: !p.featured }),
    })
    router.refresh()
  }

  const inp: React.CSSProperties = { background:'#1c2030', border:'1px solid #2a3050', color:'#e8ecf8', padding:'9px 12px', fontFamily:'DM Sans,sans-serif', fontSize:13, borderRadius:4, outline:'none', width:'100%' }
  const lbl: React.CSSProperties = { fontSize:9, letterSpacing:2, textTransform:'uppercase' as const, color:'#555e82', display:'block', marginBottom:4 }

  return (
    <>
      <div className="acard">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:500, color:'#e8ecf8' }}>
            Products <span style={{ fontSize:12, color:'#555e82', fontWeight:400 }}>({products.length})</span>
          </h2>
          <button onClick={openNew} className="abtn-gold abtn-sm">+ Add Product</button>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              {['Product','Price','Sale','Stock','Featured','Status','Actions'].map(h=>(
                <th key={h} style={{ textAlign:'left', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'#555e82', paddingBottom:12, borderBottom:'1px solid #2a3050', fontWeight:400, paddingRight:14, whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {products.map(p=>(
                <tr key={p.id} style={{ borderBottom:'1px solid #2a3050', transition:'background .15s' }}
                  onMouseOver={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.02)'}
                  onMouseOut={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                  <td style={{ padding:'10px 14px 10px 0' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:42, height:42, flexShrink:0, overflow:'hidden', borderRadius:4, border:'1px solid #3a4268', background:p.bg_color }}>
                        {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          : <div style={{ width:'100%', height:'100%', background:p.bottle_color, opacity:.7 }} />}
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:500, color:'#e8ecf8' }}>{p.name}</div>
                        <div style={{ fontSize:11, color:'#555e82' }}>{p.gender} · {p.collection}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'10px 14px 10px 0', fontFamily:'DM Mono,monospace', fontSize:13, color:'#8b93b8' }}>Rs.{Number(p.price).toLocaleString()}</td>
                  <td style={{ padding:'10px 14px 10px 0' }}>
                    {p.sale_price ? <div><span style={{ color:'#f87171', fontFamily:'DM Mono,monospace', fontSize:12 }}>Rs.{Number(p.sale_price).toLocaleString()}</span><br/><span style={{ fontSize:10, color:'#fbbf24' }}>{p.discount_pct}% off</span></div>
                      : <span style={{ fontSize:11, color:'#555e82' }}>—</span>}
                  </td>
                  <td style={{ padding:'10px 14px 10px 0' }}><span style={{ color:p.stock<20?'#f87171':'#3ecf8e', fontWeight:500 }}>{p.stock}</span></td>
                  <td style={{ padding:'10px 14px 10px 0' }}>
                    <input type="checkbox" checked={!!p.featured} onChange={()=>toggleFeat(p)} style={{ cursor:'pointer', width:16, height:16, accentColor:'#b8956a' }} />
                  </td>
                  <td style={{ padding:'10px 14px 10px 0' }}><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                  <td style={{ padding:'10px 0' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={()=>openEdit(p)} className="abtn-ghost abtn-sm">Edit</button>
                      <button onClick={()=>del(p.id,p.name)} className="abtn-danger abtn-sm">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length===0 && <tr><td colSpan={7} style={{ textAlign:'center', padding:'2rem', color:'#555e82' }}>Koi product nahi</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={()=>setModal(false)}>
          <div style={{ background:'#141720', border:'1px solid #3a4268', borderRadius:12, padding:24, width:'100%', maxWidth:600, maxHeight:'92vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:500, color:'#d4b896', marginBottom:20 }}>
              {ed.id ? 'Edit Product' : 'New Product'}
            </div>

            {/* Images */}
            <div style={{ marginBottom:20 }}>
              <label style={lbl}>Product Images</label>
              {previews.length > 0 && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(72px,1fr))', gap:8, marginBottom:10 }}>
                  {previews.map((url,i)=>(
                    <div key={i} style={{ position:'relative', aspectRatio:'1', borderRadius:6, overflow:'hidden', border:url===ed.image_url?'2px solid #b8956a':'1px solid #3a4268' }}>
                      <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      {url===ed.image_url && <div style={{ position:'absolute', top:0, left:0, right:0, background:'rgba(184,149,106,.9)', fontSize:8, textAlign:'center', color:'#1a1510', padding:'2px 0' }}>MAIN</div>}
                      <div style={{ position:'absolute', bottom:0, left:0, right:0, display:'flex', gap:2, padding:3, background:'rgba(0,0,0,.6)' }}>
                        {url!==ed.image_url && <button onClick={()=>S('image_url',url)} style={{ flex:1, fontSize:8, background:'#b8956a', border:'none', color:'#1a1510', cursor:'pointer', borderRadius:2 }}>Main</button>}
                        <button onClick={()=>removeImg(url)} style={{ flex:1, fontSize:8, background:'#f87171', border:'none', color:'white', cursor:'pointer', borderRadius:2 }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} style={{ display:'none' }} />
              <button onClick={()=>fileRef.current?.click()} disabled={uploading}
                style={{ width:'100%', background:'transparent', border:'1px solid #3a4268', color:'#8b93b8', padding:'9px 16px', fontSize:12, borderRadius:4, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
                {uploading ? '⏳ Uploading...' : '📁 Images Choose Karein (Multiple)'}
              </button>
            </div>

            {/* Discount */}
            <div style={{ background:'#1c2030', borderRadius:8, padding:14, border:'1px solid #3a4268', marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'#d4b896', marginBottom:12 }}>🏷️ Sale / Discount</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                <div>
                  <label style={lbl}>Discount %</label>
                  <input type="number" min={0} max={90} value={ed.discount_pct??0} onChange={e=>S('discount_pct',+e.target.value)} style={inp} placeholder="20" />
                </div>
                <div>
                  <label style={lbl}>Sale Price (auto)</label>
                  <div style={{ padding:'9px 12px', background:'#0d0f12', border:'1px solid #2a3050', borderRadius:4, fontSize:13, color:liveSalePrice?'#3ecf8e':'#555e82', fontFamily:'DM Mono,monospace' }}>
                    {liveSalePrice ? `Rs.${liveSalePrice.toLocaleString()}` : '—'}
                  </div>
                </div>
                <div>
                  <label style={lbl}>Badge Text</label>
                  <input value={ed.sale_label??''} onChange={e=>S('sale_label',e.target.value)} style={inp} placeholder="Eid Sale" />
                </div>
              </div>
              {(ed.discount_pct??0)>0 && ed.price>0 && (
                <div style={{ marginTop:8, padding:'6px 10px', background:'rgba(248,113,113,.1)', borderRadius:4, fontSize:11, color:'#f87171' }}>
                  ✨ {ed.discount_pct}% off · Rs.{Number(ed.price).toLocaleString()} → Rs.{liveSalePrice?.toLocaleString()}
                </div>
              )}
            </div>

            {/* Fields */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={lbl}>Product Name *</label>
                <input value={ed.name??''} onChange={e=>S('name',e.target.value)} placeholder="Soir de Soie" style={inp} />
              </div>
              <div>
                <label style={lbl}>Collection</label>
                <input value={ed.collection??''} onChange={e=>S('collection',e.target.value)} placeholder="Nuit" style={inp} />
              </div>
              <div>
                <label style={lbl}>Gender</label>
                <select value={ed.gender??'men'} onChange={e=>S('gender',e.target.value)} style={{ ...inp, cursor:'pointer' }}>
                  {['men','women','kids','unisex'].map(g=><option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Price (Rs.) * <span style={{ color:'#3ecf8e', fontSize:9 }}>PKR mein</span></label>
                <div style={{ display:'flex', alignItems:'center', background:'#1c2030', border:'1px solid #2a3050', borderRadius:4, overflow:'hidden' }}>
                  <span style={{ padding:'9px 10px', fontSize:13, color:'#b8956a', fontWeight:700, fontFamily:'DM Mono,monospace', background:'#0d0f12', borderRight:'1px solid #2a3050' }}>Rs.</span>
                  <input type="number" value={ed.price??''} onChange={e=>S('price',+e.target.value)} placeholder="52000" style={{ ...inp, border:'none', borderRadius:0, background:'transparent', flex:1 }} />
                </div>
                {ed.price>0 && <div style={{ fontSize:11, color:'#3ecf8e', marginTop:3 }}>✓ Rs.{Number(ed.price).toLocaleString()}</div>}
              </div>
              <div>
                <label style={lbl}>Stock Qty</label>
                <input type="number" value={ed.stock??''} onChange={e=>S('stock',+e.target.value)} placeholder="50" style={inp} />
              </div>
              <div>
                <label style={lbl}>Status</label>
                <select value={ed.status??'active'} onChange={e=>S('status',e.target.value)} style={{ ...inp, cursor:'pointer' }}>
                  {['active','draft','archived'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Bottle Color</label>
                <input value={ed.bottle_color??''} onChange={e=>S('bottle_color',e.target.value)} placeholder="#2a1f1a" style={inp} />
              </div>
              <div>
                <label style={lbl}>Bg Color</label>
                <input value={ed.bg_color??''} onChange={e=>S('bg_color',e.target.value)} placeholder="#f5ede0" style={inp} />
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={lbl}>Short Description</label>
                <input value={ed.description??''} onChange={e=>S('description',e.target.value)} placeholder="Black oud, dark rose..." style={inp} />
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={lbl}>Long Description</label>
                <textarea value={ed.long_desc??''} onChange={e=>S('long_desc',e.target.value)} rows={3} style={{ ...inp, resize:'none' }} placeholder="Full story..." />
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={lbl}>Scent Notes (comma separated)</label>
                <input value={Array.isArray(ed.notes)?ed.notes.join(', '):(ed.notes??'')} onChange={e=>S('notes',e.target.value)} placeholder="Black Oud, Dark Rose, Amber" style={inp} />
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={lbl}>Sizes (comma separated)</label>
                <input value={Array.isArray(ed.sizes)?ed.sizes.join(', '):(ed.sizes??'')} onChange={e=>S('sizes',e.target.value)} placeholder="30ml, 50ml, 100ml" style={inp} />
              </div>
              <div style={{ gridColumn:'1/-1', display:'flex', alignItems:'center', gap:8 }}>
                <input type="checkbox" id="feat" checked={!!ed.featured} onChange={e=>S('featured',e.target.checked)} style={{ width:16, height:16, cursor:'pointer', accentColor:'#b8956a' }} />
                <label htmlFor="feat" style={{ fontSize:13, color:'#8b93b8', cursor:'pointer' }}>Bestseller / Featured</label>
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:12, marginTop:20 }}>
              <button onClick={()=>setModal(false)} className="abtn-ghost">Cancel</button>
              <button onClick={save} disabled={loading} className="abtn-gold" style={{ opacity:loading?.6:1 }}>
                {loading ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
