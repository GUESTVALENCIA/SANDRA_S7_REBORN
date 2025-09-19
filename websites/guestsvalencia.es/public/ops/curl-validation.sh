#!/bin/bash
# CURL VALIDATION - INDEX MODERNO
# Snippets para validar funcionamiento del index

echo "🌐 VALIDACIÓN CURL - INDEX MODERNO"
echo "=================================="

# Función para validar respuesta HTTP
validate_http() {
    local url=$1
    local expected_code=${2:-200}

    echo "🔍 Validando: $url"

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    if [ "$response" = "$expected_code" ]; then
        echo "  ✅ HTTP $response - OK"
    else
        echo "  ❌ HTTP $response - Expected $expected_code"
    fi
}

# Función para validar contenido específico
validate_content() {
    local url=$1
    local pattern=$2
    local description=$3

    echo "🔍 Validando contenido: $description"

    if curl -s "$url" | grep -q "$pattern"; then
        echo "  ✅ $description - Encontrado"
    else
        echo "  ❌ $description - NO encontrado"
    fi
}

# URLs a validar
BASE_URL="https://guestsvalencia.es"
LOCAL_URL="http://localhost:8080"

echo "🚀 VALIDANDO PRODUCCIÓN"
echo "----------------------"

# Validar página principal
validate_http "$BASE_URL/"
validate_content "$BASE_URL/" "ModernIndexController" "JavaScript Controller"
validate_content "$BASE_URL/" "ai-slot" "Slot IA"
validate_content "$BASE_URL/" "search-input" "Barra de búsqueda"
validate_content "$BASE_URL/" "sandra-chat-btn" "Botón Chat Sandra"
validate_content "$BASE_URL/" "fixed top-0" "Navbar fija"
validate_content "$BASE_URL/" "animate-shimmer" "Efecto shimmer"

echo ""
echo "📱 VALIDANDO ASSETS CRÍTICOS"
echo "----------------------------"

# Validar assets importantes
validate_http "$BASE_URL/gv-app.js"
validate_http "$BASE_URL/assets/sandra-widget-hybrid.js"
validate_http "$BASE_URL/navbar-script.js"
validate_http "$BASE_URL/manifest.webmanifest"
validate_http "$BASE_URL/sw.js"

echo ""
echo "🎨 VALIDANDO RECURSOS CSS/FONTS"
echo "-------------------------------"

# Validar CDN recursos
validate_http "https://cdn.tailwindcss.com/3.4.1" 200
validate_http "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"

echo ""
echo "🔧 SNIPPETS DE VALIDACIÓN MANUAL"
echo "================================"

cat << 'EOF'

# 1. Validar index completo y extraer métricas
curl -s https://guestsvalencia.es/ | grep -o 'class="[^"]*"' | sort | uniq -c | sort -nr

# 2. Verificar tiempo de carga
time curl -s -o /dev/null https://guestsvalencia.es/

# 3. Validar headers HTTP
curl -I https://guestsvalencia.es/

# 4. Verificar elementos clave en una línea
curl -s https://guestsvalencia.es/ | grep -E "(ai-slot|search-input|sandra-chat-btn|ModernIndexController|animate-shimmer)" | wc -l

# 5. Validar scripts cargan correctamente
curl -s https://guestsvalencia.es/ | grep -o 'src="[^"]*\.js"' | sed 's/src="//;s/"//'

# 6. Verificar meta tags SEO
curl -s https://guestsvalencia.es/ | grep -E '(meta name=|meta property=)' | head -10

# 7. Validar estructura JSON-LD
curl -s https://guestsvalencia.es/ | grep -A 20 'application/ld+json'

# 8. Test mobile viewport
curl -s -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" https://guestsvalencia.es/ | grep viewport

EOF

echo ""
echo "✅ VALIDACIÓN COMPLETADA"
echo "Para tests adicionales ejecutar los snippets de arriba"