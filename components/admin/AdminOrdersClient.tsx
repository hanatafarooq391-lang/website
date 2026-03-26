'use client'
import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { toPKR } from '@/lib/currency'

const STATUSES = ['pending','confirmed','shipped','delivered','cancelled','refunded'] as const

export default function AdminOrdersClient({ orders: init }: { orders: any[] }) {
  const [orders,  setOrders]  = useState<any[]>(init)
  const [filter,  setFilter]  = useState('all')
  const [search,  setSearch]  = useState('')
  const [detail,  setDetail]  = useState<any|null>(null)

  const filtered = useMemo(() => {
    let list = orders
    if (filter !== 'all') list = list.filter(o => o.status === filter)
    if (search) list = list.filter(o =>
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
      o.order_number?.toLowerCase().includes(search.toLowerCase())
    )
    return list
  }, [orders, filter, search])

  async function updateStatus(id: string, status: string) {
    try {
      const res  = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Update failed')
      setOrders(os => os.map(o => o.id===id ? {...o,status} : o))
      if (detail?.id === id) setDetail((d:any) => d ? {...d,status} : d)
      toast.success(`Status → ${status}`)
    } catch (err: any) { toast.error(err.message) }
  }

  const SC: Record<string,string> = {
    pending:'badge-pending', confirmed:'badge-confirmed', shipped:'badge-shipped',
    delivered:'badge-delivered', cancelled:'badge-cancelled', refunded:'badge-refunded',
  }
  const steps = ['pending','confirmed','shipped','delivered']

  return (
    <>
      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <select value={filter} onChange={e=>setFilter(e.target.value)}
          style={{ background:'#1c2030', border:'1px solid #2a3050', color:'#e8ecf8', padding:'7px 12px', fontSize:12, borderRadius:4, outline:'none', cursor:'pointer' }}>
          <option value="all">All Statuses</option>
          {STATUSES.map(s=><option key={s} value={s} style={{ textTransform:'capitalize' }}>{s}</option>)}
        </select>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search name, email, order ID..."
          style={{ background:'#1c2030', border:'1px solid #2a3050', color:'#e8ecf8', padding:'7px 12px', fontSize:12, borderRadius:4, outline:'none', width:220 }} />
        <span style={{ fontSize:12, color:'#555e82', marginLeft:'auto' }}>{filtered.length} orders</span>
      </div>

      <div className="acard">
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              {['Order','Customer','Items','Total (PKR)','Status','Type','Date','Update'].map(h=>(
                <th key={h} style={{ textAlign:'left', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'#555e82', paddingBottom:10, borderBottom:'1px solid #2a3050', fontWeight:400, paddingRight:12, whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(o=>(
                <tr key={o.id} style={{ borderBottom:'1px solid #2a3050', cursor:'pointer' }} onClick={()=>setDetail(o)}>
                  <td style={{ padding:'10px 12px 10px 0' }}><span style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'#d4b896' }}>{o.order_number}</span></td>
                  <td style={{ padding:'10px 12px 10px 0' }}>
                    <div style={{ fontSize:13, fontWeight:500, color:'#e8ecf8' }}>{o.customer_name}</div>
                    <div style={{ fontSize:11, color:'#555e82' }}>{o.customer_email}</div>
                  </td>
                  <td style={{ padding:'10px 12px 10px 0', fontSize:12, color:'#8b93b8', maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {(o.order_items??[]).map((i:any)=>i.product_name).join(', ')}
                  </td>
                  <td style={{ padding:'10px 12px 10px 0', fontFamily:'DM Mono,monospace', fontSize:13, color:'#3ecf8e', fontWeight:600 }}>
                    Rs.{toPKR(Number(o.total)).toLocaleString()}
                  </td>
                  <td style={{ padding:'10px 12px 10px 0' }}><span className={`badge ${SC[o.status]||'badge-pending'}`}>{o.status}</span></td>
                  <td style={{ padding:'10px 12px 10px 0' }}>
                    <span className={`badge ${o.is_first_order?'badge-new':'badge-repeat'}`}>
                      {o.is_first_order?'1st':'Return'}
                    </span>
                  </td>
                  <td style={{ padding:'10px 12px 10px 0', fontSize:11, color:'#555e82', whiteSpace:'nowrap' }}>
                    {new Date(o.created_at).toLocaleDateString('en-PK',{month:'short',day:'numeric'})}
                  </td>
                  <td style={{ padding:'10px 0' }} onClick={e=>e.stopPropagation()}>
                    <select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)}
                      style={{ background:'#1c2030', border:'1px solid #2a3050', color:'#8b93b8', padding:'4px 8px', fontSize:11, borderRadius:3, outline:'none', cursor:'pointer' }}>
                      {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length===0&&<tr><td colSpan={8} style={{ textAlign:'center', padding:'2rem', color:'#555e82', fontSize:13 }}>Koi order nahi mila</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.8)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={()=>setDetail(null)}>
          <div style={{ background:'#141720', border:'1px solid #3a4268', borderRadius:12, padding:24, width:'100%', maxWidth:580, maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <span style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:500, color:'#d4b896' }}>{detail.order_number}</span>
              <button onClick={()=>setDetail(null)} style={{ background:'none', border:'none', color:'#555e82', cursor:'pointer', fontSize:20 }}>✕</button>
            </div>

            {/* Info grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
              {[
                { label:'Customer',  value: detail.customer_name  },
                { label:'Email',     value: detail.customer_email },
                { label:'Phone',     value: detail.customer_phone || '—' },
                { label:'Date',      value: new Date(detail.created_at).toLocaleDateString('en-PK',{month:'long',day:'numeric',year:'numeric'}) },
                { label:'Total',     value: `Rs.${toPKR(Number(detail.total)).toLocaleString()}` },
                { label:'Shipping',  value: Number(detail.shipping)===0 ? 'Free ✨' : `Rs.${detail.shipping}` },
              ].map(r=>(
                <div key={r.label} style={{ background:'#1c2030', borderRadius:6, padding:'10px 12px' }}>
                  <div style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'#555e82', marginBottom:3 }}>{r.label}</div>
                  <div style={{ fontSize:13, color:'#e8ecf8' }}>{r.value}</div>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
              <span className={`badge ${SC[detail.status]}`}>{detail.status}</span>
              <span className={`badge ${detail.is_first_order?'badge-new':'badge-repeat'}`}>
                {detail.is_first_order?'First Order 🎉':'Returning Customer'}
              </span>
            </div>

            {/* Progress */}
            {!['cancelled','refunded'].includes(detail.status) && (
              <div style={{ background:'#1c2030', borderRadius:8, padding:'12px 16px', marginBottom:16 }}>
                <div style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'#555e82', marginBottom:12 }}>Progress</div>
                <div style={{ display:'flex', alignItems:'flex-start' }}>
                  {steps.map((s,i)=>{
                    const idx  = steps.indexOf(detail.status)
                    const done = i < idx
                    const act  = i === idx
                    return (
                      <div key={s} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
                        {i < steps.length-1 && <div style={{ position:'absolute', top:12, left:'50%', width:'100%', height:1, background:done?'#b8956a':'#2a3050', zIndex:0 }} />}
                        <div style={{ width:24, height:24, borderRadius:'50%', zIndex:1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, background:done?'#b8956a':act?'#1a1510':'#1c2030', color:done?'white':act?'#d4b896':'#555e82', border:act?'2px solid #b8956a':done?'none':'1px solid #2a3050', fontWeight:700 }}>
                          {done?'✓':i+1}
                        </div>
                        <div style={{ fontSize:9, color:act?'#d4b896':done?'#b8956a':'#555e82', marginTop:4, textTransform:'uppercase', letterSpacing:1 }}>{s}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Items */}
            <div style={{ background:'#1c2030', borderRadius:8, padding:'12px 16px', marginBottom:16 }}>
              <div style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'#555e82', marginBottom:10 }}>Items</div>
              {(detail.order_items??[]).map((item:any,i:number)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #2a3050', fontSize:13 }}>
                  <div>
                    <div style={{ color:'#e8ecf8' }}>{item.product_name}</div>
                    <div style={{ fontSize:11, color:'#555e82' }}>{item.size} × {item.quantity}</div>
                  </div>
                  <div style={{ color:'#3ecf8e', fontFamily:'DM Mono,monospace' }}>Rs.{toPKR(Number(item.total_price)).toLocaleString()}</div>
                </div>
              ))}
            </div>

            {/* Quick update */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ fontSize:11, color:'#555e82' }}>Update:</span>
              {STATUSES.map(s=>(
                <button key={s} onClick={()=>updateStatus(detail.id,s)}
                  style={{ padding:'5px 12px', fontSize:11, background:'transparent', border:`1px solid ${detail.status===s?'#b8956a':'#2a3050'}`, color:detail.status===s?'#d4b896':'#8b93b8', borderRadius:4, cursor:'pointer', fontFamily:'DM Sans,sans-serif', textTransform:'capitalize' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
