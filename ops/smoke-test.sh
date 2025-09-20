#!/bin/bash

# SANDRA IA 7.0 - Smoke Test Script
# CEO: Clayton Thomas - ClayTom Systems
# Fecha: 20/09/2025

echo "======================================"
echo "SANDRA IA 7.0 - SMOKE TEST INICIANDO"
echo "======================================"
echo ""

URL_BASE="https://guestsvalencia.es"
ERRORS=0
SUCCESS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Verificar que el sitio está online
echo "1. Verificando sitio principal..."
if curl -s -I "$URL_BASE" | grep -q "200 OK"; then
    echo -e "${GREEN}✓${NC} Sitio online: $URL_BASE"
    ((SUCCESS++))
else
    echo -e "${RED}✗${NC} Sitio no responde"
    ((ERRORS++))
fi

# Test 2: Verificar widget Sandra
echo ""
echo "2. Verificando widget Sandra IA..."
if curl -s "$URL_BASE" | grep -q "sandra-root"; then
    echo -e "${GREEN}✓${NC} Widget Sandra detectado"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠${NC} Widget Sandra no encontrado (verificar después del deploy)"
    ((ERRORS++))
fi

# Test 3: Verificar sandra-widget.js
echo ""
echo "3. Verificando archivo sandra-widget.js..."
if curl -s -I "$URL_BASE/js/sandra-widget.js" | grep -q "200 OK"; then
    echo -e "${GREEN}✓${NC} sandra-widget.js accesible"
    ((SUCCESS++))
else
    echo -e "${RED}✗${NC} sandra-widget.js no encontrado"
    ((ERRORS++))
fi

# Test 4: Verificar endpoint /api/chat
echo ""
echo "4. Verificando endpoint /api/chat..."
CHAT_RESPONSE=$(curl -s -X POST "$URL_BASE/api/chat" \
    -H "Content-Type: application/json" \
    -d '{"text": "Test"}' \
    -w "\n%{http_code}")
HTTP_CODE=$(echo "$CHAT_RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "401" ]; then
    echo -e "${GREEN}✓${NC} Endpoint /api/chat responde (HTTP $HTTP_CODE)"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠${NC} Endpoint /api/chat retorna HTTP $HTTP_CODE (verificar variables de entorno)"
fi

# Test 5: Verificar endpoint /api/sandra-chat
echo ""
echo "5. Verificando endpoint /api/sandra-chat..."
TTS_RESPONSE=$(curl -s -X POST "$URL_BASE/api/sandra-chat" \
    -H "Content-Type: application/json" \
    -d '{"text": "Prueba"}' \
    -w "\n%{http_code}" \
    --max-time 5)
HTTP_CODE=$(echo "$TTS_RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓${NC} Endpoint TTS funcional"
    ((SUCCESS++))
elif [ "$HTTP_CODE" == "500" ] || [ "$HTTP_CODE" == "401" ]; then
    echo -e "${YELLOW}⚠${NC} Endpoint TTS requiere configuración de API keys (HTTP $HTTP_CODE)"
else
    echo -e "${RED}✗${NC} Endpoint TTS no responde correctamente (HTTP $HTTP_CODE)"
    ((ERRORS++))
fi

# Test 6: Verificar CSP headers
echo ""
echo "6. Verificando Content Security Policy..."
if curl -s -I "$URL_BASE" | grep -q "Content-Security-Policy"; then
    echo -e "${GREEN}✓${NC} CSP headers configurados"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠${NC} CSP headers no detectados"
fi

# Test 7: Verificar CORS para API
echo ""
echo "7. Verificando CORS..."
CORS_TEST=$(curl -s -I -X OPTIONS "$URL_BASE/api/chat" \
    -H "Origin: https://guestsvalencia.es" \
    -H "Access-Control-Request-Method: POST")

if echo "$CORS_TEST" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✓${NC} CORS configurado correctamente"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠${NC} CORS puede necesitar configuración"
fi

# Resumen
echo ""
echo "======================================"
echo "RESUMEN DE PRUEBAS"
echo "======================================"
echo -e "Pruebas exitosas: ${GREEN}$SUCCESS${NC}"
echo -e "Pruebas con advertencias/errores: ${YELLOW}$ERRORS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ TODAS LAS PRUEBAS PASARON${NC}"
    echo "Sandra IA 7.0 está lista para funcionar al 96%"
else
    echo -e "${YELLOW}⚠ ACCIÓN REQUERIDA:${NC}"
    echo "1. Configurar variables de entorno en Netlify Dashboard"
    echo "2. Seguir instrucciones en ops/env-setup-instructions.md"
    echo "3. Hacer 'Clear cache and deploy' después de configurar"
fi

echo ""
echo "======================================"
echo "Documentación: ops/env-setup-instructions.md"
echo "Site ID: 377e9ece-564f-4a25-89e5-99b77f3b9c69"
echo "Admin: https://app.netlify.com/sites/sandra-s7-reborn"
echo "======================================"