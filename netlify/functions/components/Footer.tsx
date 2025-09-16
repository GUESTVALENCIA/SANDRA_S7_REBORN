export default function Footer(){
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="container py-8 text-sm text-slate-300 flex flex-col md:flex-row gap-2 justify-between">
        <p>© {new Date().getFullYear()} GuestsValencia · Todos los derechos reservados</p>
        <p className="opacity-80">Llegada autónoma · Atención 24/7 con Sandra IA</p>
      </div>
    </footer>
  )
}
