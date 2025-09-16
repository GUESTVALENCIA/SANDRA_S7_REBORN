# Guests Valencia · Blitz Site (Next.js + TS + Tailwind)

Entrega funcional lista para ejecutar localmente o en Docker. Incluye:
- 🔹 **Alojamientos** (listings en `/data/listings.json`)
- 🔹 **Páginas de detalle** con CTA WhatsApp y Email
- 🔹 **Chat "Sandra IA"** en la esquina (usa OpenAI si defines `OPENAI_API_KEY`; si no, responde con un **stub offline**)
- 🔹 **PWA** (manifest)
- 🔹 **Tailwind** + diseño elegante
- 🔹 **Dockerfile** y `docker-compose.yml`

## 1) Ejecutar en local
```bash
npm i
npm run dev
# abre http://localhost:3000
```

## 2) Habilitar IA real (opcional)
Crea `.env.local` en la raíz con:
```
OPENAI_API_KEY=sk-...tu_clave...
```
Reinicia `npm run dev`. El chat llamará al endpoint de OpenAI.

> Si no pones la clave, el chat responde con respuestas **offline** útiles (stub), sin costo.

## 3) Editar alojamientos
Abre `data/listings.json`. Añade/edita propiedades (slug, título, fotos, etc.). Las imágenes de ejemplo están en `public/images/`.

## 4) Docker (producción local)
```bash
docker build -t guestsvalencia .
docker run -p 3000:3000 --env OPENAI_API_KEY=$OPENAI_API_KEY guestsvalencia
```

O bien:
```bash
docker compose up --build
```

## 5) Estructura mínima
```
app/
  api/chat/route.ts      # Chat (Sandra) con OpenAI o stub
  api/book/route.ts      # Stub de reservas (eco)
  listings/[slug]/page.tsx
  listings/page.tsx
  layout.tsx, page.tsx, globals.css
components/
  Navbar, Footer, ListingCard, ChatWidget, Hero
data/listings.json
public/images/
```

## 6) Personalización rápida
- Reemplaza el logo en `public/images/logo.svg`
- Cambia el número de WhatsApp en `components/Navbar.tsx` y en cada alojamiento
- Cambia colores Tailwind en `tailwind.config.ts`

## 7) Notas
- Esta entrega **no necesita** cuentas ni pagos para funcionar en modo offline.
- Para email real, añade un proveedor SMTP y crea una ruta `/api/mail` (por ejemplo con nodemailer).
- Para reservas, conecta tu PMS/Channel Manager o Google Calendar en otra ruta API.

---

Hecho con cariño para GuestsValencia.
