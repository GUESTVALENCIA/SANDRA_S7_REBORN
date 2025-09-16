import Image from 'next/image'
import Link from 'next/link'

export default function Hero(){
  return (
    <section className="container mt-10">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div className="card">
          <h1 className="text-3xl md:text-4xl font-bold">Alojamientos con llegada autónoma en Valencia, Altea y Montanejos</h1>
          <p className="text-slate-300 mt-3">Reserva directo sin comisiones. Asistencia 24/7 con nuestra IA recepcionista: <strong>Sandra</strong>.</p>
          <div className="mt-5 flex gap-3">
            <Link href="/listings" className="btn-primary">Ver alojamientos</Link>
            <a className="btn-ghost" href="https://wa.me/34600000000?text=Hola%20GuestsValencia%2C%20quiero%20reservar">WhatsApp</a>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-2 text-sm text-slate-300">
            <li className="badge">Autocheck-in</li>
            <li className="badge">Descuentos directos</li>
            <li className="badge">WiFi y plataformas</li>
            <li className="badge">Atención en español</li>
          </ul>
        </div>
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
          <Image src="/images/hero.jpg" alt="GuestsValencia" fill className="object-cover opacity-90"/>
        </div>
      </div>
    </section>
  )
}
