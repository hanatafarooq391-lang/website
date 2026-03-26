'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function LoginPage() {
  const router  = useRouter()
  const [mode,    setMode]    = useState<'login'|'register'>('login')
  const [loading, setLoading] = useState(false)
  const [form,    setForm]    = useState({ email:'', password:'', fullName:'' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email:    form.email,
          password: form.password,
          options:  { data: { full_name: form.fullName } },
        })
        if (error) throw error
        if (data.session) {
          toast.success('Account ban gaya!')
          router.push('/')
          router.refresh()
        } else {
          toast.success('Email confirm karein phir login karein')
          setMode('login')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email:    form.email,
          password: form.password,
        })
        if (error) throw error

        // Check role
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', data.user.id).single()

        toast.success('Login ho gaya!')

        const redirect = new URLSearchParams(window.location.search).get('redirect')
        if (redirect) {
          router.push(redirect)
        } else if (profile?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
        router.refresh()
      }
    } catch (err: any) {
      const m = err.message
      if (m.includes('Invalid login'))  toast.error('Email ya password galat hai')
      else if (m.includes('already'))   toast.error('Email already registered hai')
      else toast.error(m)
    } finally { setLoading(false) }
  }

  const inp: React.CSSProperties = {
    width:'100%', background:'#1c2030', border:'1px solid #2a3050',
    color:'#e8ecf8', padding:'11px 12px', fontSize:13, outline:'none',
    fontFamily:'DM Sans,sans-serif', borderRadius:4,
  }

  return (
    <div style={{ minHeight:'100vh', background:'#1a1510', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1rem' }}>
      <div style={{ width:'100%', maxWidth:360 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <Link href="/" style={{ fontFamily:'Cormorant Garamond,serif', fontSize:24, fontWeight:300, color:'#d4b896', letterSpacing:5, textTransform:'uppercase', textDecoration:'none' }}>
            VIAURA
          </Link>
          <p style={{ fontSize:11, color:'#8a7d6e', letterSpacing:3, textTransform:'uppercase', marginTop:6 }}>
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </p>
        </div>

        <div style={{ display:'flex', border:'1px solid #3a4268', marginBottom:24 }}>
          {(['login','register'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ flex:1, padding:'10px', fontSize:11, letterSpacing:2, textTransform:'uppercase', cursor:'pointer', border:'none', fontFamily:'Jost,sans-serif', transition:'all .2s', background:mode===m?'#b8956a':'transparent', color:mode===m?'#1a1510':'#8b93b8' }}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {mode === 'register' && (
            <div>
              <label style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'#555e82', display:'block', marginBottom:4 }}>Full Name</label>
              <input value={form.fullName} onChange={e=>setForm(f=>({...f,fullName:e.target.value}))}
                placeholder="Sara Ahmed" style={inp}
                onFocus={e=>e.target.style.borderColor='#b8956a'} onBlur={e=>e.target.style.borderColor='#2a3050'} />
            </div>
          )}
          <div>
            <label style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'#555e82', display:'block', marginBottom:4 }}>Email</label>
            <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}
              placeholder="sara@example.com" required style={inp}
              onFocus={e=>e.target.style.borderColor='#b8956a'} onBlur={e=>e.target.style.borderColor='#2a3050'} />
          </div>
          <div>
            <label style={{ fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'#555e82', display:'block', marginBottom:4 }}>Password</label>
            <input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}
              placeholder="••••••••" required minLength={6} style={inp}
              onFocus={e=>e.target.style.borderColor='#b8956a'} onBlur={e=>e.target.style.borderColor='#2a3050'} />
          </div>
          <button type="submit" disabled={loading}
            style={{ background:loading?'#8a6a42':'#b8956a', color:'#1a1510', padding:'13px', fontSize:11, letterSpacing:3, textTransform:'uppercase', border:'none', cursor:loading?'not-allowed':'pointer', fontFamily:'Jost,sans-serif', fontWeight:500, transition:'background .3s', marginTop:4 }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:11, color:'#555e82', marginTop:20 }}>
          <Link href="/" style={{ color:'#555e82', textDecoration:'none' }}>← Back to Store</Link>
        </p>
      </div>
    </div>
  )
}
