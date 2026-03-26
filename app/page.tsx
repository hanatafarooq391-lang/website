import { createAdminSupabase } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import CollectionCategories from '@/components/CollectionCategories'
import FeaturedProducts from '@/components/FeaturedProducts'
import FeaturesStrip from '@/components/FeaturesStrip'
import Footer from '@/components/Footer'

export const revalidate = 0

export default async function HomePage() {
  const sb = createAdminSupabase()
  const [{ data: products }, { data: settingsArr }] = await Promise.all([
    sb.from('products').select('*').eq('status','active').eq('featured',true).order('created_at',{ascending:false}).limit(8),
    sb.from('site_settings').select('*'),
  ])

  const settings: any = Object.fromEntries((settingsArr??[]).map((s:any)=>[s.key,s.value]))
  const hero     = settings.hero              ?? {}
  const brand    = settings.brand             ?? {}
  const features = settings.features          ?? []
  const cardSettings = settings.collection_cards ?? null

  // Count products per gender
  const { data: allProds } = await sb.from('products').select('gender,sale_price').eq('status','active')
  const counts = {
    men:   (allProds??[]).filter((p:any)=>p.gender==='men').length,
    women: (allProds??[]).filter((p:any)=>p.gender==='women').length,
    kids:  (allProds??[]).filter((p:any)=>p.gender==='kids').length,
  }

  // Build cards from settings or defaults
  const cards = ['men','women','kids'].map((g:string) => {
    const s = cardSettings?.[g]
    const defaults: any = {
      men:   { label:'Men',   tagline:'For Him',  emoji:'🖤', bg:'linear-gradient(160deg,#1a1208,#2a1f10)' },
      women: { label:'Women', tagline:'For Her',  emoji:'🌹', bg:'linear-gradient(160deg,#2a1520,#1a0d14)' },
      kids:  { label:'Kids',  tagline:'For Them', emoji:'✨', bg:'linear-gradient(160deg,#1a2a1a,#0d1a0d)'  },
    }
    return {
      slug:    g,
      label:   s?.label   ?? defaults[g].label,
      tagline: s?.tagline ?? defaults[g].tagline,
      emoji:   s?.emoji   ?? defaults[g].emoji,
      bg:      s?.bg      ?? defaults[g].bg,
      count:   counts[g as keyof typeof counts],
    }
  })

  return (
    <>
      <Navbar brandName={brand.name ?? 'VIAURA'} />
      <main>
        <HeroSection
          headline={hero.headline ?? 'The Art of\nInvisible Luxury'}
          subtext={hero.subtext   ?? 'Each fragrance is a manuscript\nwritten in scent'}
          ctaText={hero.cta       ?? 'Explore Collection'}
          tagline={hero.tagline   ?? 'Haute Parfumerie · Est. 2024'}
        />
        <CollectionCategories cards={cards} />
        <FeaturedProducts products={products ?? []} label={brand.featured_label ?? 'Signature Picks'} />
        <FeaturesStrip features={features} />
      </main>
      <Footer brandName={brand.name ?? 'VIAURA'} />
    </>
  )
}
