'use client'
import { useState, useEffect } from 'react'
import { price, toPKR } from '@/lib/currency'
import toast from 'react-hot-toast'

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered']

const STATUS_INFO: Record<string, { label: string; color: string; bg: string; icon: string; desc: string }> = {
  pending:   { label:'Pending',   color:'#fbbf24', bg:'rgba(251,191,36,.1)',  icon:'⏳', desc:'Aapka order receive ho gaya — review mein hai' },
  confirmed: { label:'Confirmed', color:'#60a5fa', bg:'rgba(96,165,250,.1)', icon:'✅', desc:'Order confirm ho gaya — packing shuru ho gayi' },
  shipped:   { label:'Shipped',   color:'#b8956a', bg:'rgba(184,149,106,.1)',icon:'🚚', desc:'Aapka order dispatch ho gaya — raaste mein hai' },
  delivered: { label:'Delivered', color:'#3ecf8e', bg:'rgba(62,207,142,.1)', icon:'🎉', desc:'Order deliver ho gaya! Enjoy your fragrance ✨' },
  cancelled: { label:'Cancelled', color:'#f87171', bg:'rgba(248,113,113,.1)',icon:'❌', desc:'Yeh order cancel ho gaya' },
  refunded:  { label:'Refunded',  color:'#a78bfa', bg:'rgba(167,139,250,.1)',icon:'↩️', desc:'Refund process ho raha hai' },
}

export default function TrackClient({ initialOrder }: { initialOrder?: string }) {
  const [query,   setQuery]   = useState(initialOrder ?? '')
  const [orders,  setOrders]  = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Auto-search if order number passed in URL
  useEffect(() => {
    if (initialOrder) search(initialOrder)
  }, [])

  async function search(q?: string) {
    const val = (q ?? query).trim()
    if (!val) { toast.error('Order number ya email daalen'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/track', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ query: val }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOrders(data.data)
      setSearched(true)
    } catch (err: any) {
      toast.error(err.message)
      setOrders([])
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  function getStepIndex(status: string) {
    return STATUS_STEPS.indexOf(status)
  }

  return (
    <section style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

      {/* Search Box */}
      <div style={{ background:'#f2ede4', border:'1px solid #e8e0d4', padding:'1.75rem', marginBottom:'2rem' }}>
        <p style={{ fontSize:9, letterSpacing:3, textTransform:'uppercase', color:'#8a7d6e', marginBottom:8 }}>
          Order Number ya Email
        </p>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="e.g. VIA-12345678 ya sara@email.com"
            style={{ flex:1, minWidth:200, background:'white', border:'1px solid #e8e0d4', color:'#1a1510', padding:'12px 14px', fontSize:13, outline:'none', fontFamily:'Jost,sans-serif', borderRadius:2, transition:'border-color .2s' }}
            onFocus={e => e.target.style.borderColor = '#b8956a'}
            onBlur={e  => e.target.style.borderColor = '#e8e0d4'}
          />
          <button
            onClick={() => search()}
            disabled={loading}
            style={{ background: loading ? '#8a6a42' : '#1a1510', color:'#d4b896', padding:'12px 24px', border:'none', fontFamily:'Jost,sans-serif', fontSize:11, letterSpacing:3, textTransform:'uppercase', cursor: loading ? 'not-allowed' : 'pointer', whiteSpace:'nowrap', transition:'background .2s' }}
          >
            {loading ? '⏳ Searching...' : 'Track Order →'}
          </button>
        </div>
        <p style={{ fontSize:11, color:'#aaa', marginTop:8 }}>
          💡 Order confirm hone pe email mein order number aata hai
        </p>
      </div>

      {/* No results */}
      {searched && orders.length === 0 && !loading && (
        <div style={{ textAlign:'center', padding:'3rem 1rem', background:'#f2ede4', border:'1px solid #e8e0d4' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
          <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.5rem', fontWeight:300, color:'#1a1510', marginBottom:8 }}>
            Koi Order Nahi Mila
          </h3>
          <p style={{ fontSize:13, color:'#8a7d6e', lineHeight:1.8 }}>
            Order number ya email sahi check karein.<br/>
            Confirmation email mein order number hota hai.
          </p>
          <a href="mailto:hello@viaura.com" style={{ display:'inline-block', marginTop:16, color:'#b8956a', fontSize:12 }}>
            Help chahiye? hello@viaura.com
          </a>
        </div>
      )}

      {/* Order Results */}
      {orders.map(order => {
        const info       = STATUS_INFO[order.status] ?? STATUS_INFO.pending
        const stepIdx    = getStepIndex(order.status)
        const isCancelled = order.status === 'cancelled' || order.status === 'refunded'
        const totalPKR   = toPKR(Number(order.total))
        const shippingPKR = Number(order.shipping ?? 0)

        return (
          <div key={order.id} style={{ marginBottom:'1.5rem', border:'1px solid #e8e0d4', background:'white', overflow:'hidden' }}>

            {/* Order Header */}
            <div style={{ background:info.bg, borderBottom:'1px solid #e8e0d4', padding:'1.25rem 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
              <div>
                <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#8a7d6e', marginBottom:3 }}>Order Number</div>
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.4rem', color:'#1a1510', letterSpacing:1 }}>
                  {order.order_number}
                </div>
                <div style={{ fontSize:11, color:'#8a7d6e', marginTop:2 }}>
                  {new Date(order.created_at).toLocaleDateString('en-PK', { month:'long', day:'numeric', year:'numeric' })}
                  {order.is_first_order && <span style={{ marginLeft:8, color:'#3ecf8e', fontSize:10 }}>🎉 First Order</span>}
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:info.bg, border:`1px solid ${info.color}30`, padding:'6px 14px', borderRadius:4 }}>
                  <span style={{ fontSize:16 }}>{info.icon}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:info.color, letterSpacing:1, textTransform:'uppercase' }}>{info.label}</span>
                </div>
                <div style={{ fontSize:11, color:'#8a7d6e', marginTop:4 }}>{info.desc}</div>
              </div>
            </div>

            <div style={{ padding:'1.5rem' }}>

              {/* Progress Tracker */}
              {!isCancelled && (
                <div style={{ marginBottom:'1.5rem' }}>
                  <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#8a7d6e', marginBottom:14 }}>Delivery Status</div>
                  <div style={{ display:'flex', alignItems:'flex-start', position:'relative' }}>
                    {STATUS_STEPS.map((step, i) => {
                      const done   = i < stepIdx
                      const active = i === stepIdx
                      const future = i > stepIdx
                      const stepInfo = STATUS_INFO[step]
                      return (
                        <div key={step} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
                          {/* Connector line */}
                          {i < STATUS_STEPS.length - 1 && (
                            <div style={{ position:'absolute', top:14, left:'50%', width:'100%', height:2, background: done ? '#b8956a' : '#e8e0d4', transition:'background .4s', zIndex:0 }} />
                          )}
                          {/* Circle */}
                          <div style={{
                            width:28, height:28, borderRadius:'50%', zIndex:1,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize: done ? 12 : active ? 14 : 12,
                            background: done ? '#b8956a' : active ? '#1a1510' : '#f2ede4',
                            color:      done ? 'white'   : active ? '#d4b896' : '#aaa',
                            border:     active ? '2px solid #b8956a' : done ? 'none' : '1px solid #e8e0d4',
                            transition: 'all .3s',
                            fontWeight: done || active ? 700 : 400,
                          }}>
                            {done ? '✓' : active ? stepInfo.icon : i + 1}
                          </div>
                          {/* Label */}
                          <div style={{ fontSize:9, letterSpacing:1, textTransform:'uppercase', marginTop:6, textAlign:'center', color: active ? '#1a1510' : done ? '#b8956a' : '#aaa', fontWeight: active ? 600 : 400 }}>
                            {step}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Cancelled banner */}
              {isCancelled && (
                <div style={{ background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.2)', borderRadius:6, padding:'12px 16px', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:20 }}>❌</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#f87171' }}>Order Cancel Ho Gaya</div>
                    <div style={{ fontSize:12, color:'#8a7d6e' }}>COD order tha — koi payment nahi kati. Dobara order karne ke liye neeche click karein.</div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div style={{ marginBottom:'1.25rem' }}>
                <div style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#8a7d6e', marginBottom:10 }}>Items</div>
                {(order.order_items ?? []).map((item: any, i: number) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f2ede4', gap:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color:'#1a1510', fontWeight:500 }}>{item.product_name}</div>
                      <div style={{ fontSize:11, color:'#8a7d6e' }}>{item.size} × {item.quantity}</div>
                    </div>
                    <div style={{ fontSize:13, color:'#3d3328', fontFamily:'Cormorant Garamond,serif', flexShrink:0 }}>
                      {price(item.total_price)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ background:'#f2ede4', padding:'1rem', borderRadius:4 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#8a7d6e', marginBottom:6 }}>
                  <span>Subtotal</span>
                  <span>{price(Number(order.subtotal))}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6 }}>
                  <span style={{ color:'#8a7d6e' }}>Shipping</span>
                  <span style={{ color: shippingPKR === 0 ? '#b8956a' : '#3d3328' }}>
                    {shippingPKR === 0 ? 'Free ✨' : `Rs.${shippingPKR}`}
                  </span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', paddingTop:8, borderTop:'1px solid #e8e0d4', marginTop:4 }}>
                  <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.1rem', color:'#1a1510' }}>Total</span>
                  <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.1rem', color:'#1a1510', fontWeight:600 }}>
                    Rs.{totalPKR.toLocaleString()}
                  </span>
                </div>
                <div style={{ marginTop:8, fontSize:11, color:'#b8956a', display:'flex', alignItems:'center', gap:5 }}>
                  💵 Cash on Delivery
                </div>
              </div>

              {/* Delivery Address */}
              {order.shipping_address?.city && (
                <div style={{ marginTop:'1rem', fontSize:12, color:'#8a7d6e' }}>
                  <span style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', display:'block', marginBottom:4 }}>Delivery Address</span>
                  📍 {[order.shipping_address.line1, order.shipping_address.city, order.shipping_address.country].filter(Boolean).join(', ')}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display:'flex', gap:10, marginTop:'1.25rem', flexWrap:'wrap' }}>
                <a href="/collection" style={{ padding:'10px 20px', background:'#1a1510', color:'#d4b896', fontSize:10, letterSpacing:2, textTransform:'uppercase', textDecoration:'none', fontFamily:'Jost,sans-serif' }}>
                  Continue Shopping
                </a>
                {order.status === 'delivered' && (
                  <a href="/reviews" style={{ padding:'10px 20px', background:'transparent', border:'1px solid #e8e0d4', color:'#8a7d6e', fontSize:10, letterSpacing:2, textTransform:'uppercase', textDecoration:'none', fontFamily:'Jost,sans-serif' }}>
                    Review Likhein ✦
                  </a>
                )}
                <a href="mailto:hello@viaura.com" style={{ padding:'10px 20px', background:'transparent', border:'1px solid #e8e0d4', color:'#8a7d6e', fontSize:10, letterSpacing:2, textTransform:'uppercase', textDecoration:'none', fontFamily:'Jost,sans-serif' }}>
                  Help
                </a>
              </div>
            </div>
          </div>
        )
      })}

      {/* Help section */}
      {!loading && (
        <div style={{ marginTop:'2rem', textAlign:'center', padding:'1.5rem', background:'#f2ede4', border:'1px solid #e8e0d4' }}>
          <p style={{ fontSize:13, color:'#8a7d6e', marginBottom:8 }}>Koi masla hai?</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <a href="https://wa.me/923000000000" target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#25D366', color:'white', padding:'8px 16px', fontSize:11, letterSpacing:1, textTransform:'uppercase', textDecoration:'none', borderRadius:2 }}>
              💬 WhatsApp
            </a>
            <a href="mailto:hello@viaura.com"
              style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#1a1510', color:'#d4b896', padding:'8px 16px', fontSize:11, letterSpacing:1, textTransform:'uppercase', textDecoration:'none', borderRadius:2 }}>
              📧 Email
            </a>
          </div>
        </div>
      )}
    </section>
  )
}
