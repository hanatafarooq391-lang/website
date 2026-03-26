'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

function stars(n: number) {
  const f = Math.max(0,Math.min(5,Math.floor(Number(n)||0)))
  return '★'.repeat(f)+'☆'.repeat(5-f)
}

export default function AdminReviewsClient({ reviews: init }: { reviews: any[] }) {
  const router    = useRouter()
  const [reviews, setReviews] = useState<any[]>(init)
  const [filter,  setFilter]  = useState('all')

  // Sync whenever server sends new data
  useEffect(() => { setReviews(init) }, [init])

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 10000)
    return () => clearInterval(t)
  }, [router])

  const filtered = filter === 'all' ? reviews : reviews.filter(r => String(r.rating) === filter)
  const avg = reviews.length ? (reviews.reduce((s,r)=>s+Number(r.rating),0)/reviews.length).toFixed(1) : '0.0'

  async function del(id: string) {
    if (!confirm('Delete karein?')) return
    setReviews(rs => rs.filter(r => r.id !== id))
    const res = await fetch(`/api/reviews/${id}`, { method:'DELETE' })
    if (!res.ok) { setReviews(init); toast.error('Delete nahi hua') }
    else { toast.success('Deleted!'); router.refresh() }
  }

  async function toggleApprove(r: any) {
    setReviews(rs => rs.map(x => x.id===r.id ? {...x, approved:!x.approved} : x))
    await fetch(`/api/reviews/${r.id}`, {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ approved: !r.approved }),
    })
    router.refresh()
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10 }}>
        {[
          { l:'Total',    v:reviews.length,                         c:'#b8956a' },
          { l:'Avg',      v:avg+' ★',                               c:'#fbbf24' },
          { l:'5 Stars',  v:reviews.filter(r=>r.rating===5).length, c:'#3ecf8e' },
          { l:'Approved', v:reviews.filter(r=>r.approved).length,   c:'#60a5fa' },
        ].map(s => (
          <div key={s.l} className="acard" style={{ position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:s.c }} />
            <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'#555e82', marginBottom:3 }}>{s.l}</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:600, color:'#e8ecf8' }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="acard">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:8 }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:500, color:'#e8ecf8', margin:0 }}>
            Reviews <span style={{ fontSize:12, color:'#555e82' }}>({filtered.length})</span>
          </h2>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>router.refresh()} className="abtn-ghost abtn-sm">🔄 Refresh</button>
            <select value={filter} onChange={e=>setFilter(e.target.value)}
              style={{ background:'#1c2030', border:'1px solid #2a3050', color:'#e8ecf8', padding:'6px 10px', fontSize:12, borderRadius:4, outline:'none', cursor:'pointer' }}>
              <option value="all">All</option>
              {[5,4,3,2,1].map(n=><option key={n} value={String(n)}>{n} Stars</option>)}
            </select>
          </div>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              {['Customer','Product','Rating','Review','Date','Status','Actions'].map(h=>(
                <th key={h} style={{ textAlign:'left', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'#555e82', paddingBottom:10, borderBottom:'1px solid #2a3050', fontWeight:400, paddingRight:12, whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(r=>(
                <tr key={r.id} style={{ borderBottom:'1px solid #2a3050' }}>
                  <td style={{ padding:'10px 12px 10px 0', fontSize:13, fontWeight:500, color:'#e8ecf8' }}>{r.author_name}</td>
                  <td style={{ padding:'10px 12px 10px 0', fontSize:12, color:'#8b93b8' }}>{r.product?.name??'—'}</td>
                  <td style={{ padding:'10px 12px 10px 0', color:'#b8956a', fontSize:13 }}>{stars(r.rating)}</td>
                  <td style={{ padding:'10px 12px 10px 0', fontSize:12, color:'#8b93b8', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>"{r.title}"</td>
                  <td style={{ padding:'10px 12px 10px 0', fontSize:11, color:'#555e82', whiteSpace:'nowrap' }}>
                    {new Date(r.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                  </td>
                  <td style={{ padding:'10px 12px 10px 0' }}>
                    <span className={`badge ${r.approved?'badge-delivered':'badge-cancelled'}`}>
                      {r.approved?'Visible':'Hidden'}
                    </span>
                  </td>
                  <td style={{ padding:'10px 0' }}>
                    <div style={{ display:'flex', gap:5 }}>
                      <button onClick={()=>toggleApprove(r)} className="abtn-ghost abtn-sm">{r.approved?'Hide':'Show'}</button>
                      <button onClick={()=>del(r.id)} className="abtn-danger abtn-sm">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0&&(
                <tr><td colSpan={7} style={{ textAlign:'center', padding:'2rem', color:'#555e82', fontSize:13 }}>Koi review nahi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
