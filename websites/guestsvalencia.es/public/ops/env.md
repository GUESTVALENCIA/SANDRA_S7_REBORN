# Variables de Entorno - Matriz de Configuración

## Sites Netlify

### guestsvalencia.es (Production)
```
SITE_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
ENVIRONMENT=production
SANDRA_API_URL=https://api.claytomsystems.com/sandra
SANDRA_API_KEY=gv_prod_sk_xxx
SANDRA_VOICE_ID=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_API_KEY=sk_xxx_prod
HEYGEN_API_KEY=hg_prod_xxx
ANALYTICS_ID=GA4-PROD-ID
WHATSAPP_WEBHOOK_SECRET=wh_prod_secret
```

### deploy-preview (Testing)
```
SITE_ID=preview-a1b2-c3d4-e5f6
ENVIRONMENT=preview
SANDRA_API_URL=https://staging-api.claytomsystems.com/sandra
SANDRA_API_KEY=gv_test_sk_xxx
SANDRA_VOICE_ID=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_API_KEY=sk_xxx_test
HEYGEN_API_KEY=hg_test_xxx
ANALYTICS_ID=GA4-TEST-ID
WHATSAPP_WEBHOOK_SECRET=wh_test_secret
```

## Security Headers (netlify.toml)

### Content Security Policy
```
Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://identity.netlify.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.claytomsystems.com https://api.elevenlabs.io https://api.heygen.com wss:; frame-src 'self' https://identity.netlify.com;"
```

### HTTPS Enforcement
```
Strict-Transport-Security = "max-age=31536000; includeSubDomains"
X-Frame-Options = "DENY"
X-Content-Type-Options = "nosniff"
Referrer-Policy = "strict-origin-when-cross-origin"
```

## Variable Management

### Production Deploy
```bash
netlify env:set SANDRA_API_KEY "gv_prod_sk_xxx" --site guestsvalencia
netlify env:set ELEVENLABS_API_KEY "sk_xxx_prod" --site guestsvalencia
netlify env:set HEYGEN_API_KEY "hg_prod_xxx" --site guestsvalencia
```

### Preview Deploy
```bash
netlify env:set SANDRA_API_KEY "gv_test_sk_xxx" --site preview-guestsvalencia
netlify env:set ELEVENLABS_API_KEY "sk_xxx_test" --site preview-guestsvalencia
netlify env:set HEYGEN_API_KEY "hg_test_xxx" --site preview-guestsvalencia
```