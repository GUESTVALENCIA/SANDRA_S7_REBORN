'use client'
import { useEffect, useRef, useState } from 'react'

type Msg = { role: 'user' | 'assistant', content: string }

export default function ChatWidget(){
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [input, setInput] = useState('')
  const [speak, setSpeak] = useState(true)
  const [history, setHistory] = useState<Msg[]>([
    { role: 'assistant', content: 'Hola, soy Sandra IA. ¿En qué puedo ayudarte con tu reserva?' }
  ])
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [history, open])

  async function send(){
    if(!input.trim()) return
    const next = [...history, { role: 'user' as const, content: input.trim() }]
    setHistory(next); setInput(''); setBusy(true)
    try{
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: next }) })
      const data = await res.json()
      const reply = (data.reply || 'Ahora mismo no puedo responder.')
      setHistory(h => [...h, { role: 'assistant', content: reply }])
      if(speak && typeof window !== 'undefined' && 'speechSynthesis' in window){
        const u = new SpeechSynthesisUtterance(reply); u.lang = 'es-ES'; window.speechSynthesis.speak(u)
      }
    }catch(e){
      setHistory(h => [...h, { role: 'assistant', content: 'Error de red. Inténtalo de nuevo.' }])
    }finally{
      setBusy(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="card w-80 h-96 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <strong>Sandra IA</strong>
            <label className="text-xs flex items-center gap-1">
              <input type="checkbox" checked={speak} onChange={e=>setSpeak(e.target.checked)} />
              Voz
            </label>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {history.map((m,i)=>(
              <div key={i} className={`text-sm ${m.role==='assistant'?'text-slate-100':'text-sky-200'} whitespace-pre-wrap`}>
                <span className="badge mr-2">{m.role==='assistant'?'Sandra':'Tú'}</span>{m.content}
              </div>
            ))}
            <div ref={endRef}/>
          </div>
          <div className="mt-2 flex gap-2">
            <input className="input" placeholder="Escribe tu mensaje..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}/>
            <button className="btn-primary" onClick={send} disabled={busy}>{busy?'...':'Enviar'}</button>
          </div>
        </div>
      )}
      <button className="btn-primary shadow-soft" onClick={()=>setOpen(!open)}>{open?'Cerrar chat':'Hablar con Sandra'}</button>
    </div>
  )
}
