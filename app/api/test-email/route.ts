import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const key    = process.env.RESEND_API_KEY ?? ''
  const from   = process.env.EMAIL_FROM ?? ''
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  // Check what's configured
  const config = {
    RESEND_API_KEY:  key   ? `✅ Set (${key.substring(0,8)}...)` : '❌ NOT SET',
    EMAIL_FROM:      from  ? `✅ ${from}` : '❌ NOT SET',
    APP_URL:         appUrl ? `✅ ${appUrl}` : '❌ NOT SET',
    isDev: !key || key === 're_your-resend-api-key',
  }

  // Try to send a test email if key is set
  if (!config.isDev) {
    const { searchParams } = new URL(req.url)
    const testEmail = searchParams.get('to')
    if (testEmail) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: from || 'onboarding@resend.dev',
          to:   [testEmail],
          subject: '✅ VIAURA Email Test',
          html: '<h1>VIAURA Email Test</h1><p>Agar yeh email aa gayi tou email system kaam kar raha hai! ✅</p>',
        }),
      })
      const result = await res.json()
      return NextResponse.json({ config, testResult: result, sent: res.ok })
    }
  }

  return NextResponse.json({ config, message: config.isDev ? 'Dev mode — emails not sent. Add RESEND_API_KEY to .env.local' : 'Add ?to=your@email.com to send a test email' })
}
