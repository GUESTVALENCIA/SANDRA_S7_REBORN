import ListingCard from '@/components/ListingCard'
import listings from '@/data/listings.json'

export const dynamic = 'force-static'

export default function ListingsPage(){
  return (
    <main className="container mt-10">
      <h1 className="text-3xl font-bold mb-6">Alojamientos</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {listings.map((it)=> <ListingCard key={it.slug} item={it as any}/>)}
      </div>
    </main>
  )
}
