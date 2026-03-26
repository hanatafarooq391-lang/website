// lib/email.ts
const KEY     = process.env.RESEND_API_KEY ?? ''
const FROM    = process.env.EMAIL_FROM     ?? 'onboarding@resend.dev'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

async function send(to: string, subject: string, html: string) {
  // No key set — log to console
  if (!KEY || KEY.trim() === '' || KEY === 're_your-resend-api-key') {
    console.log('\n' + '═'.repeat(52))
    console.log('📧  EMAIL (DEV MODE — not sent)')
    console.log(`To:      ${to}`)
    console.log(`Subject: ${subject}`)
    console.log('Add RESEND_API_KEY to .env.local to send real emails')
    console.log('═'.repeat(52) + '\n')
    return { ok: true, dev: true }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    FROM,
        to:      [to],
        subject,
        html,
      }),
    })
    const json = await res.json()
    if (!res.ok) {
      console.error('❌ Resend error:', JSON.stringify(json))
      return { ok: false, error: json.message ?? JSON.stringify(json) }
    }
    console.log(`✅ Email sent to ${to} — id: ${json.id}`)
    return { ok: true, id: json.id }
  } catch (err: any) {
    console.error('❌ Email fetch error:', err.message)
    return { ok: false, error: err.message }
  }
}

function wrap(body: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#faf7f2;font-family:Georgia,serif;color:#3d3328}
.w{max-width:560px;margin:0 auto;padding:32px 20px}
.hd{text-align:center;padding:24px 0 18px;border-bottom:1px solid #e8e0d4;margin-bottom:22px}
.logo{font-size:24px;font-weight:300;color:#1a1510;letter-spacing:8px;text-transform:uppercase}
.sub{font-size:10px;color:#8a7d6e;letter-spacing:3px;text-transform:uppercase;margin-top:5px}
h2{font-size:20px;font-weight:300;color:#1a1510;margin:0 0 10px}
p{font-size:14px;line-height:1.8;margin:0 0 12px;color:#3d3328}
.box{background:#f2ede4;border:1px solid #e8e0d4;padding:18px 20px;margin:18px 0;border-radius:4px}
.lbl{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#8a7d6e;margin-bottom:4px}
.val{font-size:20px;color:#1a1510;letter-spacing:2px;font-weight:300}
.badge{display:inline-block;padding:5px 14px;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-top:8px;border-radius:2px}
.item{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #e8e0d4;font-size:13px;color:#3d3328}
.total{display:flex;justify-content:space-between;padding:10px 0 0;font-size:15px;font-weight:bold;color:#1a1510}
.btn{display:inline-block;background:#1a1510;color:#d4b896!important;padding:11px 28px;font-size:10px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;margin:16px 0}
.ft{text-align:center;margin-top:30px;padding-top:18px;border-top:1px solid #e8e0d4;font-size:11px;color:#8a7d6e;line-height:1.8}
</style></head><body>
<div class="w">
  <div class="hd"><div class="logo">VIAURA</div><div class="sub">Haute Parfumerie</div></div>
  ${body}
  <div class="ft"><p>VIAURA Haute Parfumerie</p><p>hello@viaura.com · +92 300 0000000</p></div>
</div></body></html>`
}

// ── 1. ORDER CONFIRMED ──────────────────────────────────────
export async function sendOrderConfirmation({ customerName, customerEmail, orderNumber, items, total, shipping = 0 }: {
  customerName:  string
  customerEmail: string
  orderNumber:   string
  items:         { name: string; size: string; quantity: number; price: number }[]
  total:         number
  shipping?:     number
}) {
  const rows = items.map(i =>
    `<div class="item">
      <span>${i.name} <span style="color:#8a7d6e;font-size:11px">(${i.size} ×${i.quantity})</span></span>
      <span>Rs.${Math.round(i.price * i.quantity * 278).toLocaleString()}</span>
    </div>`
  ).join('')

  const html = wrap(`
    <h2>Shukriya ${customerName || ''}!</h2>
    <p>Aapka order <strong>confirm</strong> ho gaya hai. Hum jald pack karke dispatch karenge.</p>
    <div class="box">
      <div class="lbl">Order Number</div>
      <div class="val">${orderNumber}</div>
      <span class="badge" style="background:#f2ede4;color:#b8956a;border:1px solid #e8e0d4;">💵 Cash on Delivery</span>
    </div>
    <div style="margin:16px 0">
      ${rows}
      <div class="item"><span style="color:#8a7d6e">Shipping</span><span>${shipping === 0 ? 'Free ✨' : 'Rs.' + shipping}</span></div>
      <div class="total"><span>Total</span><span>Rs.${Math.round(total * 278).toLocaleString()}</span></div>
    </div>
    <p style="font-size:13px;color:#8a7d6e;font-style:italic">Delivery pe cash payment karni hogi.</p>
    <a href="${APP_URL}/track?order=${orderNumber}" class="btn">🔍 Track My Order →</a>
    <p>Koi sawaal? <a href="mailto:hello@viaura.com" style="color:#b8956a">hello@viaura.com</a></p>
  `)
  return send(customerEmail, `✅ Order Confirm — ${orderNumber} | VIAURA`, html)
}

// ── 2. ORDER DISPATCHED ─────────────────────────────────────
export async function sendOrderDispatched({ customerName, customerEmail, orderNumber, items }: {
  customerName:  string
  customerEmail: string
  orderNumber:   string
  items:         { name: string }[]
}) {
  const html = wrap(`
    <h2>Aapka Order Dispatch Ho Gaya! 🚚</h2>
    <p>${customerName || 'Dear Customer'}, aapka VIAURA order raaste mein hai!</p>
    <div class="box">
      <div class="lbl">Order Number</div>
      <div class="val">${orderNumber}</div>
      <span class="badge" style="background:#e8f4fd;color:#2980b9;border:1px solid #bee3f8;">🚚 Dispatched</span>
      <div style="margin-top:10px;font-size:13px;color:#3d3328">
        ${items.map(i => `<div style="padding:2px 0">• ${i.name}</div>`).join('')}
      </div>
    </div>
    <p>Delivery ke waqt <strong>Cash on Delivery</strong> payment karni hogi.</p>
    <p>Estimated delivery: 2–5 business days.</p>
    <a href="${APP_URL}/track?order=${orderNumber}" class="btn">🔍 Track Order →</a>
    <p>Koi masla? <a href="mailto:hello@viaura.com" style="color:#b8956a">hello@viaura.com</a></p>
  `)
  return send(customerEmail, `🚚 Dispatched — ${orderNumber} | VIAURA`, html)
}

// ── 3. ORDER DELIVERED ──────────────────────────────────────
export async function sendOrderDelivered({ customerName, customerEmail, orderNumber }: {
  customerName:  string
  customerEmail: string
  orderNumber:   string
}) {
  const html = wrap(`
    <h2>Order Deliver Ho Gaya! ✨</h2>
    <p>${customerName || 'Dear Customer'}, aapka VIAURA order aap tak pahunch gaya!</p>
    <div class="box">
      <div class="lbl">Order Number</div>
      <div class="val">${orderNumber}</div>
      <span class="badge" style="background:#f0fff4;color:#276749;border:1px solid #9ae6b4;">✅ Delivered</span>
    </div>
    <p>Hum umeed karte hain aapko apni fragrance pasand aaye!</p>
    <p>Apna experience share karein:</p>
    <a href="${APP_URL}/reviews" class="btn">Review Likhein →</a>
    <p style="font-size:12px;color:#8a7d6e">Koi masla? 48 ghante mein batayein: <a href="mailto:hello@viaura.com" style="color:#b8956a">hello@viaura.com</a></p>
  `)
  return send(customerEmail, `✅ Delivered — ${orderNumber} | VIAURA`, html)
}

// ── 4. ORDER CANCELLED ──────────────────────────────────────
export async function sendOrderCancelled({ customerName, customerEmail, orderNumber, reason }: {
  customerName:  string
  customerEmail: string
  orderNumber:   string
  reason?:       string
}) {
  const html = wrap(`
    <h2>Order Cancel Ho Gaya</h2>
    <p>${customerName || 'Dear Customer'}, aapka order cancel ho gaya hai.</p>
    <div class="box">
      <div class="lbl">Order Number</div>
      <div class="val">${orderNumber}</div>
      <span class="badge" style="background:#fff5f5;color:#c53030;border:1px solid #feb2b2;">❌ Cancelled</span>
      ${reason ? `<div style="margin-top:8px;font-size:13px;color:#8a7d6e">Wajah: ${reason}</div>` : ''}
    </div>
    <p>COD order tha — koi payment nahi kati.</p>
    <a href="${APP_URL}/collection" class="btn">Dobara Shop Karein →</a>
    <p>Sawaal ho: <a href="mailto:hello@viaura.com" style="color:#b8956a">hello@viaura.com</a></p>
  `)
  return send(customerEmail, `❌ Cancelled — ${orderNumber} | VIAURA`, html)
}
