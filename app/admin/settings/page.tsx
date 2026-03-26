'use client'
// app/admin/settings/page.tsx
import AdminShell from '@/components/admin/AdminShell'
import AdminSettingsClient from '@/components/admin/AdminSettingsClient'

export default function AdminSettingsPage() {
  return (
    <AdminShell active="settings">
      <AdminSettingsClient />
    </AdminShell>
  )
}
