// app/admin/layout.tsx — Admin layout wrapper
// All admin pages share this layout — sets dark background
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VIAURA Admin',
  description: 'VIAURA Admin Panel',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#0d0f12', minHeight: '100vh', color: '#e8ecf8' }}>
      {children}
    </div>
  )
}
