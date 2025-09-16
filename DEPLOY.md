# 🚀 Despliegue Sandra IA 7.0

## Cómo usarlo (pasos rápidos)

### 1. Subir a Netlify

1. Sube el repo a Netlify (o descomprime y haz "Import from Git")
2. Ve a **Site settings** → **Environment variables**

### 2. Configurar Variables de Entorno

Copia las siguientes variables desde `.env.example`:

```bash
TRAINING_ENABLED=true
TRAINING_API_KEY=gv_train_s7_S4ndraValencia_8k9ZrT2pQ6
UPSTREAM_API_URL=https://api.guestsvalencia.es/sandra/v7
UPSTREAM_API_KEY=<tu token si aplica>
ELEVENLABS_API_KEY=sk_972694e47b2a8ace6912f6689b8527b746cdf4bec9bae242
ELEVENLABS_VOICE_ID=06H5cbUvetCmVYi9HUXk
ALLOW_ORIGIN=https://sandra-s7-reborn.netlify.app,http://localhost:3000,http://127.0.0.1:5500
```

### 3. Deploy

Una vez configuradas las variables, Netlify desplegará automáticamente.

### 4. Verificar

✅ Sandra Dev Lab PRO funcionando
✅ APIs conectadas
✅ Voz de Sandra activa
✅ Entrenamiento habilitado

---

**ClayTom Systems - Sandra IA 7.0**
*Tecnología Cubana Independiente*