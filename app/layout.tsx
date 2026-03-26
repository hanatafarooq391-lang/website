import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'VIAURA — Haute Parfumerie',
  description: 'Rare fragrances crafted from the finest botanicals on earth.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a1510',
              color: '#d4b896',
              border: '1px solid #8a6a42',
              fontFamily: 'Jost, sans-serif',
              fontSize: '13px',
            },
          }}
        />
      </body>
    </html>
  )
}
