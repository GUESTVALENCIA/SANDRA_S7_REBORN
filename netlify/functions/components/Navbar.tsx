'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link href={href} className={`px-3 py-2 rounded-xl ${active ? 'bg-white/10' : 'hover:bg-white/5'}`}>
      {children}
    </Link>
  )
}

export default function Navbar(){
  return (
    <header className="border-b border-white/10 sticky top-0 backdrop-blur z-40">
      <div className="container flex items-center gap-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.svg" alt="GuestsValencia" width={120} height={24}/>
        </Link>
        <nav className="ml-auto flex items-center gap-2">
          <NavLink href="/">Inicio</NavLink>
          <NavLink href="/listings">Alojamientos</NavLink>
          <a className="px-3 py-2 rounded-xl hover:bg-white/5" href="https://wa.me/34600000000?text=Hola%20GuestsValencia%2C%20quiero%20reservar">WhatsApp</a>
        </nav>
      </div>
    </header>
  )
}
