import { NextRequest } from 'next/server'
export const runtime = 'nodejs'
export async function POST(req: NextRequest){
  const payload = await req.json().catch(()=>({}))
  // In real deploy, send email with SMTP or store in DB; here we just echo.
  return Response.json({ ok: true, received: payload })
}
