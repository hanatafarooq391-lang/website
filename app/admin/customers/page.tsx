import { createAdminSupabase } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'

export default async function AdminCustomersPage() {
  const supabase = createAdminSupabase()
  const { data: profiles } = await supabase.from('profiles').select('*').eq('role','customer').order('created_at',{ascending:false})
  const { data: orders }   = await supabase.from('orders').select('user_id,total,status,is_first_order,created_at,order_number')

  const customers = (profiles ?? []).map((p: any) => {
    const custOrders = (orders ?? []).filter((o: any) => o.user_id === p.id)
    const ltv  = custOrders.reduce((s: number, o: any) => s + Number(o.total), 0)
    const count = custOrders.length
    return { ...p, order_count: count, ltv, segment: count <= 1 ? 'new' : count < 5 ? 'repeat' : 'vip', lastOrder: custOrders[0]?.created_at ?? null }
  }).sort((a: any, b: any) => b.order_count - a.order_count)

  return (
    <AdminShell active="customers">
      <div className="acard">
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 500, color: '#e8ecf8', marginBottom: 16 }}>
          All Customers <span style={{ fontSize: 12, color: '#555e82', fontWeight: 400 }}>({customers.length})</span>
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Customer','Email','Segment','Orders','LTV','Last Order'].map(h => (
              <th key={h} style={{ textAlign: 'left', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#555e82', paddingBottom: 12, borderBottom: '1px solid #2a3050', fontWeight: 400, paddingRight: 16, whiteSpace: 'nowrap' }}>{h}</th>
            ))}</tr></thead>
            <tbody>{customers.map((c: any) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #2a3050' }}>
                <td style={{ padding: '12px 16px 12px 0', fontSize: 13, fontWeight: 500, color: '#e8ecf8' }}>{c.full_name || '—'}</td>
                <td style={{ padding: '12px 16px 12px 0', fontSize: 12, color: '#8b93b8' }}>{c.email}</td>
                <td style={{ padding: '12px 16px 12px 0' }}><span className={`badge badge-${c.segment}`}>{c.segment}</span></td>
                <td style={{ padding: '12px 16px 12px 0', fontFamily: 'DM Mono, monospace', fontSize: 14, fontWeight: 600, color: '#d4b896' }}>{c.order_count}</td>
                <td style={{ padding: '12px 16px 12px 0', fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#8b93b8' }}>${c.ltv.toFixed(0)}</td>
                <td style={{ padding: '12px 0', fontSize: 12, color: '#555e82' }}>{c.lastOrder ? new Date(c.lastOrder).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
