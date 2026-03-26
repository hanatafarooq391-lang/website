'use client'
import { useState } from 'react'
import { useCartStore } from '@/lib/store'
import { BottleSVG } from './ProductCard'
import { price, toPKR, USD_TO_PKR } from '@/lib/currency'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const FREE_SHIPPING_PKR = 5000
const SHIPPING_PKR      = 250

export default function CartClient() {
  const router = useRouter()
  const { items, removeItem, updateQty, total, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name:'', email:'', phone:'', address:'', city:'', country:'Pakistan', notes:'',
  })

  // Calculate totals in PKR
  const subtotalUSD  = total()
  const subtotalPKR  = toPKR(subtotalUSD)
  const shippingFree = subtotalPKR >= FREE_SHIPPING_PKR
  const shippingPKR  = shippingFree ? 0 : SHIPPING_PKR
  const grandTotalPKR = subtotalPKR + shippingPKR

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const inp: React.CSSProperties = { width:'100%', background:'white', border:'1px solid #e8e0d4', color:'#1a1510', padding:'11px 12px', fontSize:13, outline:'none', fontFamily:'Jost,sans-serif', transition:'border-color .2s', borderRadius:2 }
  const lbl: React.CSSProperties = { fontSize:9, letterSpacing:2, textTransform:'uppercase' as const, color:'#8a7d6e', display:'block', marginBottom:5 }

  async function handleOrder() {
    if (!form.email) { toast.error('Email zaroori hai'); return }
    if (!form.phone) { toast.error('Phone number zaroori hai'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method:'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          items,
          customerName:  form.name || form.email.split('@')[0],
          customerEmail: form.email,
          customerPhone: form.phone,
          address: { line1: form.address||'—', city: form.city||'—', country: form.country },
          notes:    form.notes,
          shipping: shippingPKR,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      clearCart()
      toast.success('Order place ho gaya! Email check karein ✅')
      router.push(`/checkout/success?order=${data.data.orderNumber}`)
    } catch (err: any) {
      toast.error(err.message ?? 'Order failed')
    } finally { setLoading(false) }
  }

  if (!items.length) {
    return (
      <div style={{ maxWidth:600, margin:'0 auto', padding:'5rem 2rem', textAlign:'center' }}>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'2.2rem', fontWeight:300, color:'#1a1510', marginBottom:12 }}>Cart Empty Hai</h1>
        <p style={{ color:'#8a7d6e', marginBottom:24 }}>Koi fragrance choose karein.</p>
        <a href="/collection" className="btn-gold">Shop Now</a>
      </div>
    )
  }

  return (
    <div style={{ maxWidth:960, margin:'0 auto', padding:'2rem 1.5rem' }}>
      <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'2rem', fontWeight:300, color:'#1a1510', marginBottom:4 }}>Your Cart</h1>
      <p style={{ color:'#8a7d6e', fontSize:11, letterSpacing:2, textTransform:'uppercase', marginBottom:'2rem' }}>
        Cash on Delivery · {shippingFree ? 'Free Shipping' : `Rs.${SHIPPING_PKR} Shipping`}
      </p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px,1fr))', gap:'2.5rem' }}>

        {/* Items + Summary */}
        <div>
          {items.map(item => {
            const salePrice = (item.product as any).sale_price as number | undefined
            const unitUSD   = salePrice ?? item.product.price
            return (
              <div key={`${item.product.id}-${item.size}`} style={{ display:'flex', gap:14, padding:'16px 0', borderBottom:'1px solid #e8e0d4', alignItems:'center' }}>
                <div style={{ width:66, height:66, flexShrink:0, border:'1px solid #e8e0d4', background:item.product.bg_color, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {(item.product as any).image_url
                    ? <img src={(item.product as any).image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <BottleSVG color={item.product.bottle_color??'#333'} neck={item.product.neck_color??item.product.bottle_color??'#333'} h={50} />
                  }
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.05rem', color:'#1a1510', marginBottom:2 }}>{item.product.name}</p>
                  <p style={{ fontSize:11, color:'#8a7d6e' }}>{item.size}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:8 }}>
                    <button onClick={()=>updateQty(item.product.id,item.size,item.quantity-1)} style={{ width:24, height:24, border:'1px solid #e8e0d4', background:'none', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                    <span style={{ fontSize:13, minWidth:18, textAlign:'center' }}>{item.quantity}</span>
                    <button onClick={()=>updateQty(item.product.id,item.size,item.quantity+1)} style={{ width:24, height:24, border:'1px solid #e8e0d4', background:'none', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                    <button onClick={()=>removeItem(item.product.id,item.size)} style={{ marginLeft:'auto', fontSize:10, color:'#8a7d6e', background:'none', border:'none', cursor:'pointer', textTransform:'uppercase', letterSpacing:1 }}>Remove</button>
                  </div>
                </div>
                <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.05rem', color:'#3d3328', flexShrink:0 }}>
                  {price(unitUSD * item.quantity)}
                </span>
              </div>
            )
          })}

          {/* Summary */}
          <div style={{ background:'#f2ede4', border:'1px solid #e8e0d4', padding:'1.25rem', marginTop:'1.25rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#8a7d6e', marginBottom:8 }}>
              <span>Subtotal</span><span>Rs.{subtotalPKR.toLocaleString()}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:8, alignItems:'center' }}>
              <span style={{ color:'#8a7d6e' }}>Shipping</span>
              {shippingFree
                ? <span style={{ color:'#b8956a', fontSize:11 }}>FREE ✨</span>
                : <span style={{ color:'#3d3328' }}>Rs.{SHIPPING_PKR}</span>
              }
            </div>
            {!shippingFree && (
              <div style={{ fontSize:10, color:'#b8956a', marginBottom:8, background:'rgba(184,149,106,.08)', padding:'6px 10px', border:'1px solid rgba(184,149,106,.2)' }}>
                Rs.{(FREE_SHIPPING_PKR - subtotalPKR).toLocaleString()} aur khareedein — Free Shipping milegi!
              </div>
            )}
            <div style={{ display:'flex', justifyContent:'space-between', paddingTop:10, borderTop:'1px solid #e8e0d4', marginTop:4 }}>
              <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.2rem', color:'#1a1510' }}>Total</span>
              <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.2rem', color:'#1a1510' }}>
                Rs.{grandTotalPKR.toLocaleString()}
              </span>
            </div>
            <div style={{ marginTop:12, textAlign:'center' }}>
              <span style={{ display:'inline-block', background:'#1a1510', color:'#d4b896', padding:'7px 20px', fontSize:10, letterSpacing:3, textTransform:'uppercase' }}>
                💵 Cash on Delivery
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Form */}
        <div>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'1.4rem', fontWeight:300, color:'#1a1510', marginBottom:6 }}>Delivery Details</h2>
          <p style={{ fontSize:11, color:'#8a7d6e', marginBottom:16 }}>* Email aur Phone zaroori hain</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <label style={lbl}>Email <span style={{ color:'#f87171' }}>*</span></label>
              <input type="email" value={form.email} onChange={e=>setF('email',e.target.value)} placeholder="sara@example.com"
                style={{ ...inp, borderColor:!form.email?'#fca5a5':'#e8e0d4' }}
                onFocus={e=>e.target.style.borderColor='#b8956a'} onBlur={e=>e.target.style.borderColor=!form.email?'#fca5a5':'#e8e0d4'} />
            </div>
            <div>
              <label style={lbl}>Phone <span style={{ color:'#f87171' }}>*</span></label>
              <input value={form.phone} onChange={e=>setF('phone',e.target.value)} placeholder="+92 300 0000000"
                style={{ ...inp, borderColor:!form.phone?'#fca5a5':'#e8e0d4' }}
                onFocus={e=>e.target.style.borderColor='#b8956a'} onBlur={e=>e.target.style.borderColor=!form.phone?'#fca5a5':'#e8e0d4'} />
            </div>
            <div>
              <label style={lbl}>Full Name <span style={{ color:'#aaa', fontSize:9 }}>(optional)</span></label>
              <input value={form.name} onChange={e=>setF('name',e.target.value)} placeholder="Sara Ahmed" style={inp}
                onFocus={e=>e.target.style.borderColor='#b8956a'} onBlur={e=>e.target.style.borderColor='#e8e0d4'} />
            </div>
            <div>
              <label style={lbl}>Address <span style={{ color:'#aaa', fontSize:9 }}>(optional)</span></label>
              <input value={form.address} onChange={e=>setF('address',e.target.value)} placeholder="House #, Street, Area" style={inp}
                onFocus={e=>e.target.style.borderColor='#b8956a'} onBlur={e=>e.target.style.borderColor='#e8e0d4'} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>
                <label style={lbl}>City</label>
                <input value={form.city} onChange={e=>setF('city',e.target.value)} placeholder="Karachi" style={inp}
                  onFocus={e=>e.target.style.borderColor='#b8956a'} onBlur={e=>e.target.style.borderColor='#e8e0d4'} />
              </div>
              <div>
                <label style={lbl}>Country</label>
                <select value={form.country} onChange={e=>setF('country',e.target.value)} style={{ ...inp, cursor:'pointer' }}>
                  {['Pakistan','UAE','Saudi Arabia','UK','USA','Other'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={lbl}>Notes <span style={{ color:'#aaa', fontSize:9 }}>(optional)</span></label>
              <textarea value={form.notes} onChange={e=>setF('notes',e.target.value)} rows={2} placeholder="Koi khas instructions..."
                style={{ ...inp, resize:'none' }}
                onFocus={e=>e.target.style.borderColor='#b8956a'} onBlur={e=>e.target.style.borderColor='#e8e0d4'} />
            </div>
          </div>
          <button onClick={handleOrder} disabled={loading||!form.email||!form.phone}
            style={{ width:'100%', background:(!form.email||!form.phone)?'#888':loading?'#8a6a42':'#1a1510', color:'#d4b896', padding:15, fontFamily:'Jost,sans-serif', fontSize:11, letterSpacing:3, textTransform:'uppercase', border:'none', cursor:(!form.email||!form.phone||loading)?'not-allowed':'pointer', marginTop:16, transition:'background .3s' }}>
            {loading ? 'Order Ho Raha Hai...' : `Order Karein — Rs.${grandTotalPKR.toLocaleString()}`}
          </button>
          <p style={{ fontSize:10, color:'#8a7d6e', textAlign:'center', marginTop:8 }}>
            📧 Confirmation email aayegi · 💵 Delivery pe payment
          </p>
        </div>
      </div>
    </div>
  )
}
