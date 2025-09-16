import Image from 'next/image'
import Link from 'next/link'

type Item = {
  slug: string; title: string; short: string; city: string;
  guests: number; beds: number; baths: number; price: number;
  images: string[]; amenities: string[]; highlights: string[];
}

export default function ListingCard({item}:{item: Item}){
  const img = item.images[0] ?? '/images/hero.jpg'
  return (
    <Link href={`/listings/${item.slug}`} className="card block hover:scale-[1.01] transition">
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl mb-4 bg-white/5">
        <Image src={img} alt={item.title} fill className="object-cover"/>
      </div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">{item.title}</h3>
        <span className="badge">desde €{item.price}/noche</span>
      </div>
      <p className="text-slate-300 mt-2">{item.short}</p>
      <div className="mt-3 text-sm text-slate-400">{item.city} · {item.guests} huéspedes · {item.beds} camas · {item.baths} baños</div>
    </Link>
  )
}
