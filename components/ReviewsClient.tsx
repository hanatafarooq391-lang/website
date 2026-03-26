'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

function stars(n: number) {
  const f = Math.max(0, Math.min(5, Math.floor(Number(n) || 0)))
  return '★'.repeat(f) + '☆'.repeat(5 - f)
}

export default function ReviewsClient({ reviews: init, products }: {
  reviews: any[]
  products: any[]
}) {
  const router = useRouter()
  const [reviews, setReviews] = useState<any[]>(init ?? [])
  const [filter,  setFilter]  = useState('all')
  const [rating,  setRating]  = useState(0)
  const [hover,   setHover]   = useState(0)
  const [busy,    setBusy]    = useState(false)
  const [form,    setForm]    = useState({ name:'', product_id:'', title:'', body:'' })

  // Sync when server refreshes
  useMemo(() => { setReviews(init ?? []) }, [init])

  const setF = (k: string, v: string) => setForm(p => ({...p, [k]: v}))

  const filtered = useMemo(() =>
    filter === 'all' ? reviews : reviews.filter(r => r.product?.gender === filter),
    [reviews, filter])

  const total = reviews.length
  const avg   = total ? (reviews.reduce((s,r) => s + Number(r.rating), 0) / total).toFixed(1) : '0.0'
  const dist  = [5,4,3,2,1].map(s => ({ s, n: reviews.filter(r => Number(r.rating) === s).length }))

  async function submit() {
    if (!form.name.trim())  { toast.error('Naam likhein');          return }
    if (!form.product_id)   { toast.error('Product select karein'); return }
    if (!rating)            { toast.error('Stars dein');            return }
    if (!form.title.trim()) { toast.error('Title likhein');         return }
    if (!form.body.trim())  { toast.error('Review likhein');        return }

    setBusy(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id:  form.product_id,
          author_name: form.name.trim(),
          rating:      Number(rating),
          title:       form.title.trim(),
          body:        form.body.trim(),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `Error ${res.status}`)

      // Build review with product info for instant display
      const prod = products.find(p => p.id === form.product_id)
      const newReview = {
        ...json.data,
        id:          json.data?.id ?? `temp-${Date.now()}`,
        author_name: form.name.trim(),
        rating:      Number(rating),
        title:       form.title.trim(),
        body:        form.body.trim(),
        created_at:  new Date().toISOString(),
        approved:    true,
        product:     json.data?.product ?? (prod ? { name: prod.name, gender: prod.gender } : null),
      }

      // Instant add to list
      setReviews(prev => [newReview, ...prev])
      setForm({ name:'', product_id:'', title:'', body:'' })
      setRating(0)
      setHover(0)
      toast.success('✅ Review submit ho gayi!')
      window.scrollTo({ top: 0, behavior: 'smooth' })

      // Refresh server data after 1 second
      setTimeout(() => router.refresh(), 1000)

    } catch (err: any) {
      toast.error(err.message || 'Submit nahi hui')
    } finally {
      setBusy(false)
    }
  }

  const inp: React.CSSProperties = {
    width:'100%', background:'white', border:'1px solid #e8e0d4',
    color:'#1a1510', padding:'10px 12px', fontSize:13,
    outline:'none', fontFamily:'Jost,sans-serif', borderRadius:2,
  }

  return (
    <section style={{ maxWidth:1100, margin:'0 auto', padding:'2.5rem 1.5rem' }}>

      {/* Summary bar */}
      <div style={{ display:'flex', alignItems:'center', gap:'2rem', padding:'1.25rem', background:'#f2ede4', border:'1px solid #e8e0d4', marginBottom:'2rem', flexWrap:'wrap', borderRadius:4 }}>
        <div style={{ textAlign:'center', minWidth:80 }}>
          <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'3rem', fontWeight:300, color:'#1a1510', lineHeight:1 }}>{avg}</div>
          <div style={{ fontSize:16, color:'#b8956a', margin:'4px 0' }}>{stars(parseFloat(avg))}</div>
          <div style={{ fontSize:11, color:'#8a7d6e' }}>{total} reviews</div>
        </div>
        <div style={{ flex:1, minWidth:160 }}>
          {dist.map(d => (
            <div key={d.s} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <span style={{ fontSize:11, color:'#8a7d6e', width:22, textAlign:'right' }}>{d.s}★</span>
              <div style={{ flex:1, height:6, background:'#e8e0d4', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', background:'#b8956a', width:total?`${Math.round(d.n/total*100)}%`:'0%', transition:'width .6s' }} />
              </div>
              <span style={{ fontSize:10, color:'#8a7d6e', width:12 }}>{d.n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Header + filter */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'1rem' }}>
        <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:300, color:'#1a1510', margin:0 }}>
          {filtered.length} Reviews
        </h2>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ background:'#f2ede4', border:'1px solid #e8e0d4', color:'#1a1510', padding:'7px 12px', fontSize:12, outline:'none', cursor:'pointer', fontFamily:'Jost,sans-serif', borderRadius:4 }}>
          <option value="all">All</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="kids">Kids</option>
        </select>
      </div>

      {/* Reviews grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'3rem 0', color:'#8a7d6e', marginBottom:'2rem' }}>
          <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.4rem', marginBottom:8 }}>Koi review nahi abhi</p>
          <p style={{ fontSize:12 }}>Neeche form se pehli review likhein!</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:'1rem', marginBottom:'2.5rem' }}>
          {filtered.map((r, i) => (
            <div key={r.id ?? i} style={{ background:'white', border:'1px solid #e8e0d4', padding:'1.25rem', borderRadius:2 }}>
              <div style={{ color:'#b8956a', marginBottom:6, fontSize:14, letterSpacing:2 }}>{stars(r.rating)}</div>
              <p style={{ fontFamily:'Cormorant Garamond,serif', fontStyle:'italic', color:'#1a1510', marginBottom:8, lineHeight:1.6 }}>"{r.title}"</p>
              <p style={{ fontSize:12, color:'#8a7d6e', lineHeight:1.7, marginBottom:10 }}>{r.body}</p>
              <p style={{ fontSize:11, color:'#3d3328', textTransform:'uppercase', letterSpacing:1 }}>{r.author_name}</p>
              {r.product?.name && (
                <p style={{ fontSize:10, color:'#b8956a', letterSpacing:2, textTransform:'uppercase', marginTop:2 }}>{r.product.name}</p>
              )}
              <p style={{ fontSize:10, color:'#ccc', marginTop:4 }}>
                {r.created_at ? new Date(r.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Just now'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      <div style={{ background:'#f2ede4', border:'1px solid #e8e0d4', padding:'2rem', maxWidth:580, margin:'0 auto', borderRadius:4 }}>
        <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.7rem', fontWeight:300, color:'#1a1510', marginBottom:4 }}>Leave a Review</h3>
        <p style={{ fontSize:12, color:'#8a7d6e', marginBottom:'1.5rem' }}>Apna experience share karein</p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
          <div>
            <label style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'#8a7d6e', display:'block', marginBottom:4 }}>Naam *</label>
            <input value={form.name} onChange={e => setF('name',e.target.value)} placeholder="Sara Ahmed" style={inp}
              onFocus={e=>e.target.style.borderColor='#b8956a'} onBlur={e=>e.target.style.borderColor='#e8e0d4'} />
          </div>
          <div>
            <label style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'#8a7d6e', display:'block', marginBottom:4 }}>Product *</label>
            <select value={form.product_id} onChange={e => setF('product_id',e.target.value)}
              style={{ ...inp, cursor:'pointer' }}
              onFocus={e=>e.target.style.borderColor='#b8956a'} onBlur={e=>e.target.style.borderColor='#e8e0d4'}>
              <option value="">Select karein</option>
              {(products ?? []).map((p:any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom:10 }}>
          <label style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'#8a7d6e', display:'block', marginBottom:6 }}>Rating *</label>
          <div style={{ display:'flex', gap:4, alignItems:'center' }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} type="button"
                onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)} onClick={()=>setRating(n)}
                style={{ fontSize:30, cursor:'pointer', background:'none', border:'none', padding:'0 2px', lineHeight:1, color:n<=(hover||rating)?'#b8956a':'#ddd', transition:'color .1s, transform .1s', transform:n<=(hover||rating)?'scale(1.15)':'scale(1)' }}>
                ★
              </button>
            ))}
            {rating > 0 && <span style={{ fontSize:12, color:'#8a7d6e', marginLeft:6 }}>{rating} star{rating>1?'s':''}</span>}
          </div>
        </div>

        <div style={{ marginBottom:10 }}>
          <label style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'#8a7d6e', display:'block', marginBottom:4 }}>Title *</label>
          <input value={form.title} onChange={e=>setF('title',e.target.value)} placeholder="Absolutely mesmerizing" style={inp}
            onFocus={e=>e.target.style.borderColor='#b8956a'} onBlur={e=>e.target.style.borderColor='#e8e0d4'} />
        </div>

        <div style={{ marginBottom:'1.25rem' }}>
          <label style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'#8a7d6e', display:'block', marginBottom:4 }}>Review *</label>
          <textarea value={form.body} onChange={e=>setF('body',e.target.value)} rows={4}
            placeholder="Apna experience likhen..." style={{ ...inp, resize:'none' }}
            onFocus={e=>e.target.style.borderColor='#b8956a'} onBlur={e=>e.target.style.borderColor='#e8e0d4'} />
        </div>

        <button onClick={submit} disabled={busy}
          style={{ width:'100%', background:busy?'#8a6a42':'#1a1510', color:'#d4b896', padding:14, fontFamily:'Jost,sans-serif', fontSize:11, letterSpacing:3, textTransform:'uppercase', border:'none', cursor:busy?'not-allowed':'pointer', transition:'background .3s' }}>
          {busy ? '⏳ Saving...' : 'Submit Review'}
        </button>
      </div>
    </section>
  )
}
