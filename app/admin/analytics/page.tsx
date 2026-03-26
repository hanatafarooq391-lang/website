import { createAdminSupabase } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import { toPKR } from '@/lib/currency'

export default async function AdminAnalyticsPage() {
  const supabase = createAdminSupabase()
  const { data: orders }     = await supabase.from('orders').select('total,status,is_first_order,customer_email,created_at')
  const { data: orderItems } = await supabase.from('order_items').select('product_name,total_price')

  const confirmed  = (orders??[]).filter((o:any)=>['confirmed','shipped','delivered'].includes(o.status))
  const totalUSD   = confirmed.reduce((s:number,o:any)=>s+Number(o.total),0)
  const totalPKR   = toPKR(totalUSD)
  const avgUSD     = confirmed.length ? totalUSD/confirmed.length : 0
  const avgPKR     = toPKR(avgUSD)

  const allEmails  = [...new Set((orders??[]).map((o:any)=>o.customer_email))]
  const firstTimers= (orders??[]).filter((o:any)=>o.is_first_order).length
  const returning  = allEmails.filter(e=>(orders??[]).filter((o:any)=>o.customer_email===e).length>1)
  const vips       = returning.filter(e=>(orders??[]).filter((o:any)=>o.customer_email===e).length>=5)

  const prodMap: Record<string,number> = {}
  ;(orderItems??[]).forEach((i:any)=>{ prodMap[i.product_name]=(prodMap[i.product_name]||0)+Number(i.total_price) })
  const topProds = Object.entries(prodMap).sort(([,a],[,b])=>b-a).slice(0,5)
  const maxRev   = topProds[0]?.[1]??1

  const days = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i))
    const ds=d.toISOString().split('T')[0]
    const rev=confirmed.filter((o:any)=>o.created_at?.startsWith(ds)).reduce((s:number,o:any)=>s+Number(o.total),0)
    return { label:d.toLocaleDateString('en-US',{weekday:'short'}), rev, pkr:toPKR(rev) }
  })
  const maxDay = Math.max(...days.map(d=>d.pkr),1)
  const colors = ['#b8956a','#60a5fa','#a78bfa','#3ecf8e','#fbbf24']

  return (
    <AdminShell active="analytics">
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12 }}>
          {[
            { label:'Total Revenue',   value:`Rs.${totalPKR.toLocaleString()}`, accent:'#b8956a' },
            { label:'Avg Order Value', value:`Rs.${avgPKR.toLocaleString()}`,   accent:'#b8956a' },
            { label:'New Buyers',      value:String(firstTimers),               accent:'#3ecf8e' },
            { label:'Repeat Buyers',   value:String(returning.length),          accent:'#60a5fa' },
            { label:'VIP (5+ orders)', value:String(vips.length),               accent:'#a78bfa' },
          ].map(s=>(
            <div key={s.label} className="acard" style={{ position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:s.accent }} />
              <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'#555e82', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:600, color:'#e8ecf8' }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div className="acard">
            <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:500, color:'#e8ecf8', marginBottom:14 }}>Revenue — Last 7 Days (PKR)</h3>
            <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:90 }}>
              {days.map((d,i)=>(
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, height:'100%' }}>
                  <div style={{ flex:1, width:'100%', display:'flex', alignItems:'flex-end' }}>
                    <div style={{ width:'100%', background:'#b8956a', borderRadius:'2px 2px 0 0', opacity:.4+(d.pkr/maxDay)*.6, minHeight:3, height:`${Math.max(d.pkr/maxDay*100,3)}%` }} />
                  </div>
                  <div style={{ fontSize:9, color:'#555e82' }}>{d.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="acard">
            <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:500, color:'#e8ecf8', marginBottom:14 }}>Top Products</h3>
            {topProds.map(([name,rev],i)=>(
              <div key={name} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <div style={{ fontSize:11, color:'#555e82', width:90, textAlign:'right', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</div>
                <div style={{ flex:1, background:'#1c2030', borderRadius:2, height:13, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:colors[i], width:`${Math.round(rev/maxRev*100)}%`, borderRadius:2 }} />
                </div>
                <div style={{ fontSize:11, fontFamily:'DM Mono,monospace', color:'#8b93b8', width:52 }}>Rs.{toPKR(rev/1000).toLocaleString()}k</div>
              </div>
            ))}
          </div>
        </div>

        <div className="acard">
          <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:13, fontWeight:500, color:'#e8ecf8', marginBottom:14 }}>Segments</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:10 }}>
            {[
              { label:'New Buyers',    count:firstTimers,      desc:'1 order',    cls:'badge-new'    },
              { label:'Repeat Buyers', count:returning.length, desc:'2–4 orders', cls:'badge-repeat' },
              { label:'VIP',           count:vips.length,      desc:'5+ orders',  cls:'badge-vip'    },
            ].map(seg=>(
              <div key={seg.label} style={{ background:'#1c2030', borderRadius:8, padding:'12px 16px', border:'1px solid #2a3050', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:'#e8ecf8' }}>{seg.label}</div>
                  <div style={{ fontSize:11, color:'#555e82' }}>{seg.desc}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700, color:'#d4b896' }}>{seg.count}</div>
                  <span className={`badge ${seg.cls}`}>{seg.cls.replace('badge-','')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
