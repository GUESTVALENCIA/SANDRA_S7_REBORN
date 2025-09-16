import Hero from '@/components/Hero'
import Link from 'next/link'
import listings from '@/data/listings.json'
import ListingCard from '@/components/ListingCard'

export default function Page(){
  return (
    <main className="space-y-10">
      <Hero/>
      <section className="container">
        <h2 className="text-2xl font-bold mb-4">Disponibles</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {listings.map((it)=> <ListingCard key={it.slug} item={it as any}/>)}
        </div>
        <div className="mt-6">
          <Link href="/listings" className="btn-ghost">Ver todos</Link>
        </div>
      </section>
    </main>
  )
}
