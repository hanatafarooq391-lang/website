'use client'
// components/admin/AdminSettingsClient.tsx
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const defaultFeatures = [
  { title: 'Aged to Perfection', text: 'Raw materials matured 12–36 months' },
  { title: 'Natural Extracts',   text: '100% ethically harvested botanicals' },
  { title: 'Free Shipping',      text: 'Complimentary worldwide delivery'     },
  { title: 'Luxury Packaging',   text: 'Gilded ribbon & sealing wax'         },
]

export default function AdminSettingsClient() {
  const [loading, setLoading] = useState(false)
  const [hero,    setHero]    = useState({ headline: '', subtext: '', cta: '', tagline: '' })
  const [brand,   setBrand]   = useState({ name: 'VIAURA', email: '', shipping_notice: '', featured_label: '' })
  const [features, setFeats]  = useState(defaultFeatures)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(({ data }) => {
      if (data?.hero)     setHero(data.hero)
      if (data?.brand)    setBrand(data.brand)
      if (data?.features) setFeats(data.features)
    })
  }, [])

  async function save(section: string, value: any) {
    setLoading(true)
    try {
      const res = await fetch('/api/settings', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [section]: value }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Settings saved!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const Input = ({ label, value, onChange, placeholder, textarea }: any) => (
    <div>
      <label className="text-[9px] tracking-[2px] uppercase text-[#555e82] block mb-1">{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className="ainput resize-none" />
        : <input    value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}           className="ainput" />
      }
    </div>
  )

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Hero */}
      <div className="acard">
        <h3 className="font-display text-sm font-medium text-[#e8ecf8] mb-4">Hero Section</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input label="Brand Name"   value={brand.name}    onChange={(v: string) => setBrand(b => ({ ...b, name: v }))}    placeholder="VIAURA" />
          <Input label="CTA Button"   value={hero.cta}      onChange={(v: string) => setHero(h => ({ ...h, cta: v }))}      placeholder="Explore Collection" />
          <Input label="Tagline"      value={hero.tagline}  onChange={(v: string) => setHero(h => ({ ...h, tagline: v }))}  placeholder="Haute Parfumerie · Est. 2024" />
          <Input label="Hero Headline" value={hero.headline} onChange={(v: string) => setHero(h => ({ ...h, headline: v }))} placeholder="The Art of Invisible Luxury" />
          <div className="col-span-2">
            <Input label="Hero Subtext" value={hero.subtext} onChange={(v: string) => setHero(h => ({ ...h, subtext: v }))} placeholder="Each fragrance is a manuscript..." textarea />
          </div>
        </div>
        <button onClick={() => save('hero', hero)} disabled={loading} className="abtn-gold disabled:opacity-60">
          Save Hero Settings
        </button>
      </div>

      {/* Brand */}
      <div className="acard">
        <h3 className="font-display text-sm font-medium text-[#e8ecf8] mb-4">Brand Info</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input label="Featured Label"   value={brand.featured_label}  onChange={(v: string) => setBrand(b => ({ ...b, featured_label: v }))}  placeholder="Signature Picks" />
          <Input label="Contact Email"    value={brand.email}           onChange={(v: string) => setBrand(b => ({ ...b, email: v }))}            placeholder="hello@viaura.com" />
          <div className="col-span-2">
            <Input label="Shipping Notice" value={brand.shipping_notice} onChange={(v: string) => setBrand(b => ({ ...b, shipping_notice: v }))} placeholder="Complimentary worldwide delivery..." />
          </div>
        </div>
        <button onClick={() => save('brand', brand)} disabled={loading} className="abtn-gold disabled:opacity-60">
          Save Brand Info
        </button>
      </div>

      {/* Features strip */}
      <div className="acard">
        <h3 className="font-display text-sm font-medium text-[#e8ecf8] mb-4">Feature Strip</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {features.map((f, i) => (
            <div key={i} className="bg-[#1c2030] rounded-lg p-3 border border-[#2a3050]">
              <label className="text-[9px] tracking-[2px] uppercase text-[#555e82] block mb-1">Feature {i + 1} Title</label>
              <input value={f.title} onChange={e => setFeats(fs => fs.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} className="ainput mb-2 text-[12px]" />
              <label className="text-[9px] tracking-[2px] uppercase text-[#555e82] block mb-1">Description</label>
              <input value={f.text}  onChange={e => setFeats(fs => fs.map((x, j) => j === i ? { ...x, text:  e.target.value } : x))} className="ainput text-[12px]" />
            </div>
          ))}
        </div>
        <button onClick={() => save('features', features)} disabled={loading} className="abtn-gold disabled:opacity-60">
          Save Features
        </button>
      </div>
    </div>
  )
}
