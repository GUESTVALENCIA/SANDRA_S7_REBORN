import listings from '@/data/listings.json'
import Image from 'next/image'
import Link from 'next/link'

export async function generateStaticParams(){
  return (listings as any[]).map(x => ({ slug: x.slug }))
}

export default function Listing({ params }: { params: { slug: string }}){
  const item = (listings as any[]).find(x => x.slug === params.slug)
  if(!item) return <div className="container mt-10">No encontrado</div>
  const img = (item.images?.[0]) || '/images/hero.jpg'
  const wa = `https://wa.me/34600000000?text=Hola%20GuestsValencia%2C%20quiero%20reservar%20${encodeURIComponent(item.title)}%20(fecha%20de%20entrada%20-%20salida%2C%20nº%20huéspedes)`

  return (
    <main className="container mt-10">
      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3 card">
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-4">
            <Image src={img} alt={item.title} fill className="object-cover"/>
          </div>
          <h1 className="text-2xl font-bold">{item.title}</h1>
          <p className="text-slate-300 mt-2">{item.short}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {item.amenities.map((a:string)=>(<li key={a} className="badge">{a}</li>))}
          </ul>
        </div>
        <aside className="md:col-span-2 card h-fit">
          <div className="flex items-baseline justify-between">
            <strong className="text-2xl">€{item.price}</strong>
            <span className="text-sm text-slate-400">/ noche</span>
          </div>
          <div className="text-sm text-slate-300 mt-2">{item.city} · {item.guests} huéspedes · {item.beds} camas · {item.baths} baños</div>
          <div className="mt-4 flex gap-2">
            <a className="btn-primary flex-1 text-center" href={wa} target="_blank">Reservar por WhatsApp</a>
            <Link className="btn-ghost" href="mailto:reservas@guestsvalencia.es?subject=Reserva&body=Hola%2C%20quiero%20reservar">Email</Link>
          </div>
          <p className="text-xs text-slate-400 mt-3">Llegada autónoma y asistencia 24/7 por Sandra IA.</p>
        </aside>
      </div>
    </main>
  )
}
