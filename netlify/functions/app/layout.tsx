import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ChatWidget from '@/components/ChatWidget'

export const metadata: Metadata = {
  title: 'Guests Valencia · Reserva directa',
  description: 'Alojamientos turísticos en Valencia, Altea y Montanejos con llegada autónoma y asistencia 24/7 por IA.',
  manifest: '/manifest.webmanifest',
  themeColor: '#ff6b00',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Navbar/>
        {children}
        <Footer/>
        <ChatWidget/>
      </body>
    </html>
  )
}
