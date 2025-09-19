#!/bin/bash
# Smoke Tests Post-Deploy - GuestsValencia PWA

set -e

DOMAIN=${1:-https://guestsvalencia.es}
echo "🔍 Iniciando smoke tests para: $DOMAIN"

# Función para verificar endpoint
check_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    local description=$3

    echo -n "Verificando $description... "

    status=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")

    if [ "$status" = "$expected_status" ]; then
        echo "✅ OK ($status)"
        return 0
    else
        echo "❌ FAIL ($status, esperado $expected_status)"
        return 1
    fi
}

# Tests críticos
FAILED=0

# 1. Página principal
check_endpoint "$DOMAIN" 200 "Página principal" || FAILED=1

# 2. PWA Manifest
check_endpoint "$DOMAIN/manifest.webmanifest" 200 "PWA Manifest" || FAILED=1

# 3. Service Worker
check_endpoint "$DOMAIN/sw.js" 200 "Service Worker" || FAILED=1

# 4. Páginas clave
check_endpoint "$DOMAIN/alojamientos.html" 200 "Página alojamientos" || FAILED=1
check_endpoint "$DOMAIN/contacto.html" 200 "Página contacto" || FAILED=1

# 5. API endpoints (si están activos)
if curl -s "$DOMAIN/api/chat" &>/dev/null; then
    check_endpoint "$DOMAIN/api/chat" 200 "API Chat" || FAILED=1
fi

# 6. Assets críticos
check_endpoint "$DOMAIN/assets/pwa-install.js" 200 "PWA Install Script" || FAILED=1
check_endpoint "$DOMAIN/assets/img/pwa-192.png" 200 "PWA Icon 192" || FAILED=1

# 7. Verificar headers PWA
echo -n "Verificando headers PWA... "
if curl -s -I "$DOMAIN" | grep -q "Content-Security-Policy"; then
    echo "✅ OK (CSP presente)"
else
    echo "⚠️ WARNING (CSP no detectado)"
fi

# 8. Test de performance básico
echo -n "Test de velocidad básico... "
load_time=$(curl -s -w "%{time_total}" -o /dev/null "$DOMAIN")
if (( $(echo "$load_time < 2.0" | bc -l) )); then
    echo "✅ OK (${load_time}s)"
else
    echo "⚠️ SLOW (${load_time}s)"
fi

# Resultado final
if [ $FAILED -eq 0 ]; then
    echo "🎉 Todos los smoke tests PASARON"
    exit 0
else
    echo "💥 FALLÓ $FAILED tests críticos"
    echo "🚨 ROLLBACK REQUERIDO"
    exit 1
fi