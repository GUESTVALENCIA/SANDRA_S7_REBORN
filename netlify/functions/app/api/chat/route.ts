import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest){
  try{
    const body = await req.json()
    const messages = body?.messages as { role: 'user'|'assistant', content: string }[] || []
    const userLast = [...messages].reverse().find(m=>m.role==='user')?.content || ''
    const apiKey = process.env.OPENAI_API_KEY

    if(!apiKey){
      const reply = stubReply(userLast)
      return Response.json({ reply })
    }

    // Minimal call using fetch to avoid adding sdk deps
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres Sandra IA, recepcionista de GuestsValencia. Ayuda a reservar, resolver dudas, y habla amable en español.' },
          ...messages
        ],
        temperature: 0.4,
      })
    })
    if(!resp.ok){
      const txt = await resp.text()
      return Response.json({ reply: 'No pude conectar con el modelo. Revisa OPENAI_API_KEY. ' + txt.slice(0,120) })
    }
    const data = await resp.json()
    const reply = data.choices?.[0]?.message?.content || 'Listo.'
    return Response.json({ reply })
  }catch(e:any){
    return Response.json({ reply: 'Error del servidor: ' + String(e?.message ?? e) })
  }
}

function stubReply(q: string){
  const lower = (q||'').toLowerCase()
  if(lower.includes('precio') || lower.includes('coste')) return 'Nuestros precios varían por temporada. Dime fechas y alojamiento y te doy un precio orientativo.'
  if(lower.includes('llegada') || lower.includes('check-in')) return 'La llegada es autónoma. Te enviaré el código/ubicación de la caja de seguridad el día de entrada.'
  if(lower.includes('altea')) return 'La villa de Altea Hills tiene 2 habitaciones (hasta 6 pax), terraza y piscina. ¿Fechas aproximadas?'
  return 'Puedo ayudarte con disponibilidad, precios y recomendaciones. ¿Qué fechas y cuántas personas?'
}
