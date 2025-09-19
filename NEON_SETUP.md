# 🧠 CONFIGURACIÓN MEMORIA SANDRA IA 7.0 CON NEON

## SETUP COMPLETO PARA CEO - INSTRUCCIONES PASO A PASO

### ✅ 1. CREAR BASE DE DATOS NEON

1. **Ir a [Neon Console](https://console.neon.tech/)**
2. **Crear nuevo proyecto:** "Sandra IA 7.0 Memory"
3. **Copiar connection string:** `postgres://user:pass@host.neon.tech/db?sslmode=require`

### ✅ 2. CONFIGURAR VARIABLES EN NETLIFY

**Ir a tu sitio Netlify → Site Configuration → Environment Variables:**

```bash
# REQUERIDAS PARA MEMORIA COMPLETA
NEON_DATABASE_URL=postgres://user:pass@host.neon.tech/db?sslmode=require
TRAINING_ENABLED=true
TRAINING_API_KEY=tu-clave-secreta-aqui

# APIs YA CONFIGURADAS
OPENAI_API_KEY=tu-openai-key
ELEVENLABS_API_KEY=tu-elevenlabs-key
ELEVENLABS_VOICE_ID=Rachel

# CORS CONFIGURADO
ALLOW_ORIGIN=https://guestsvalencia.es,https://*.guestsvalencia.es,https://claytomsystems.com,https://*.claytomsystems.com,https://*.netlify.app,http://localhost:8888
```

### ✅ 3. INICIALIZAR BASE DE DATOS

**Primer deploy → Llamar endpoint de inicialización:**

```bash
GET https://tu-sitio.netlify.app/api/init-database
```

Esto crea todas las tablas:
- `sandra_examples` - Ejemplos de entrenamiento
- `sandra_conversations` - Todas las conversaciones
- `sandra_memory` - Memoria a largo plazo
- `sandra_personas` - Configuraciones por persona

### ✅ 4. ENDPOINTS DISPONIBLES

#### 🎯 **ENTRENAMIENTO AUTOMÁTICO**
```bash
POST /api/train
Headers: X-Sandra-Key: tu-clave, X-Persona: developer
Body: {
  "input": "¿Cómo estás?",
  "output": "¡Excelente! Soy Sandra IA 7.0",
  "persona": "developer",
  "loras": [],
  "context": {},
  "save_to_memory": true
}
```

#### 💬 **CHAT CON MEMORIA**
```bash
POST /api/chat
Headers: X-Session-Id: session-123, X-Persona: developer
Body: {
  "message": "Hola Sandra",
  "returnAudio": true
}
```

#### 🧠 **CONSULTAR MEMORIA**
```bash
GET /api/memory-query?type=recent&limit=10
Headers: X-Persona: developer, X-Session-Id: session-123

# Tipos disponibles: recent, memory, training, context
```

#### 📦 **EXPORTAR MEMORIA**
```bash
GET /api/export-jsonl?format=training&persona=developer&limit=1000
Headers: X-Sandra-Key: tu-clave

# Formatos: training, conversations, memory
# Descarga archivo JSONL listo para usar
```

#### 🔄 **RESPALDO COMPLETO**
```bash
# Crear respaldo
GET /api/backup-restore?operation=backup
Headers: X-Sandra-Key: tu-clave

# Restaurar respaldo
POST /api/backup-restore?operation=restore
Headers: X-Sandra-Key: tu-clave
Body: [backup-json-data]

# Ver estadísticas
GET /api/backup-restore?operation=stats
Headers: X-Sandra-Key: tu-clave
```

### ✅ 5. INTEGRACIÓN CON FRONTEND

**Tu frontend debe incluir estos headers:**

```javascript
// Para entrenamientos
fetch('/api/train', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Sandra-Key': 'tu-clave-de-entrenamiento',
    'X-Persona': 'developer' // o reception, sales, support
  },
  body: JSON.stringify({
    input: userInput,
    output: sandraOutput,
    context: { source: 'frontend_training' }
  })
});

// Para chat con memoria
fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Session-Id': sessionId,
    'X-Persona': currentPersona
  },
  body: JSON.stringify({
    message: userMessage,
    returnAudio: true
  })
});
```

### ✅ 6. PERSONAS CONFIGURADAS

El sistema incluye 4 personas pre-configuradas:

1. **developer** - Asistente técnico especializado
2. **reception** - Recepcionista virtual para hoteles
3. **sales** - Especialista en ventas
4. **support** - Soporte técnico y atención

Cada persona tiene:
- Configuración de comportamiento
- Settings de voz específicos
- Memoria separada

### ✅ 7. FUNCIONALIDADES AUTOMÁTICAS

✅ **Todo entrenamiento se guarda automáticamente**
✅ **Todas las conversaciones se almacenan**
✅ **Memoria inteligente por persona**
✅ **Exportación en formatos estándar**
✅ **Respaldo y recuperación completa**
✅ **Estadísticas de uso**
✅ **Búsqueda y consulta de memoria**

### 🚨 IMPORTANTE: SEGURIDAD

- **TRAINING_API_KEY** protege endpoints de entrenamiento
- **Solo dominios autorizados** pueden acceder
- **Datos encriptados** en tránsito (HTTPS)
- **Respaldos automáticos** recomendados semanalmente

---

**🎯 RESULTADO: SANDRA IA 7.0 CON MEMORIA PERSISTENTE COMPLETA**

Cada interacción, entrenamiento y conversación queda guardada permanentemente en Neon, accesible desde cualquier frontend autorizado.