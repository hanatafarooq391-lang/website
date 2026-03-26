import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TrackClient from '@/components/TrackClient'

export default function TrackPage({ searchParams }: { searchParams: { order?: string } }) {
  return (
    <>
      <Navbar />
      <div style={{ background:'#1a1510', padding:'3.5rem 1.5rem', textAlign:'center' }}>
        <p style={{ fontSize:10, letterSpacing:5, textTransform:'uppercase', color:'#b8956a', marginBottom:10 }}>VIAURA</p>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(2rem,5vw,3rem)', fontWeight:300, color:'#f5ede0', fontStyle:'italic', margin:0 }}>
          Order Track Karein
        </h1>
        <p style={{ fontSize:12, color:'#8a7d6e', letterSpacing:1, marginTop:10 }}>
          Order number ya email se apna order track karein
        </p>
      </div>
      <TrackClient initialOrder={searchParams.order} />
      <Footer />
    </>
  )
}
