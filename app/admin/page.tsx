import { createAdminSupabase } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import { toPKR } from '@/lib/currency'

export default async function AdminDashboardPage() {
  const supabase = createAdminSupabase()
  const [
    { count: totalOrders },
    { count: totalCustomers },
    { count: totalProducts },
    { data: recentOrders },
    { data: orderTotals },
  ] = await Promise.all([
    supabase.from('orders').select('id', { count:'exact', head:true }),
    supabase.from('profiles').select('id', { count:'exact', head:true }).eq('role','customer'),
    supabase.from('products').select('id', { count:'exact', head:true }).eq('status','active'),
    supabase.from('orders').select('*, order_items(product_name,quantity)').order('created_at',{ascending:false}).limit(8),
    supabase.from('orders').select('total,status').in('status',['confirmed','shipped','delivered']),
  ])

  const totalRevUSD = (orderTotals??[]).reduce((s:number,o:any)=>s+Number(o.total),0)
  const totalRevPKR = toPKR(totalRevUSD)

  return (
    <AdminShell active="dashboard">
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

        {/* Stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
          {[
            { label:'Total Revenue',    value:`Rs.${totalRevPKR.toLocaleString()}`, accent:'#b8956a' },
            { label:'Total Orders',     value:String(totalOrders??0),               accent:'#3ecf8e' },
            { label:'Customers',        value:String(totalCustomers??0),            accent:'#60a5fa' },
            { label:'Active Products',  value:String(totalProducts??0),             accent:'#a78bfa' },
          ].map(s => (
            <div key={s.label} className="acard" style={{ position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:s.accent }} />
              <div style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'#555e82', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:600, color:'#e8ecf8' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="acard">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:14, fontWeight:500, color:'#e8ecf8', margin:0 }}>Recent Orders</h2>
            <a href="/admin/orders" style={{ fontSize:11, color:'#8b93b8', textDecoration:'none' }}>View all →</a>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>
                {['Order','Customer','Items','Total (PKR)','Status','Date'].map(h=>(
                  <th key={h} style={{ textAlign:'left', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'#555e82', paddingBottom:10, borderBottom:'1px solid #2a3050', fontWeight:400, paddingRight:14, whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(recentOrders??[]).map((o:any)=>(
                  <tr key={o.id} style={{ borderBottom:'1px solid #2a3050' }}>
                    <td style={{ padding:'10px 14px 10px 0' }}><span style={{ fontFamily:'DM Mono,monospace', fontSize:11, color:'#d4b896' }}>{o.order_number}</span></td>
                    <td style={{ padding:'10px 14px 10px 0', fontSize:13, fontWeight:500, color:'#e8ecf8' }}>{o.customer_name}</td>
                    <td style={{ padding:'10px 14px 10px 0', fontSize:12, color:'#8b93b8', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {o.order_items?.map((i:any)=>i.product_name).join(', ')}
                    </td>
                    <td style={{ padding:'10px 14px 10px 0', fontFamily:'DM Mono,monospace', fontSize:13, color:'#3ecf8e' }}>
                      Rs.{toPKR(Number(o.total)).toLocaleString()}
                    </td>
                    <td style={{ padding:'10px 14px 10px 0' }}><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                    <td style={{ padding:'10px 0', fontSize:12, color:'#555e82' }}>
                      {new Date(o.created_at).toLocaleDateString('en-PK',{month:'short',day:'numeric'})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
