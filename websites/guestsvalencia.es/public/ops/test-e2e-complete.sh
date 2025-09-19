#!/bin/bash
# Testing E2E Completo - Guests Valencia
# CEO: Clayton Thomas - ClayTom Systems
# Generado por Claude Code Elite

set -e

echo "🚀 TESTING E2E COMPLETO - GUESTS VALENCIA"
echo "========================================"
echo ""

# Configuración
BASE_URL="https://guestsvalencia.es"
TIMEOUT=30
FAILURES=0

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Función para logging
log_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
    FAILURES=$((FAILURES + 1))
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

# Test de conectividad básica
test_basic_connectivity() {
    log_test "Conectividad básica al sitio web"

    if curl -s --max-time $TIMEOUT -I "$BASE_URL" | grep -q "200 OK"; then
        log_success "Sitio web accesible (200 OK)"
    else
        log_error "Sitio web no accesible"
        return 1
    fi

    # Verificar headers de seguridad
    HEADERS=$(curl -s --max-time $TIMEOUT -I "$BASE_URL")

    if echo "$HEADERS" | grep -q "Content-Security-Policy"; then
        log_success "CSP configurado"
    else
        log_error "CSP no configurado"
    fi

    if echo "$HEADERS" | grep -q "Strict-Transport-Security"; then
        log_success "HSTS configurado"
    else
        log_error "HSTS no configurado"
    fi
}

# Test de functions backend
test_backend_functions() {
    log_test "Functions del backend"

    # Health endpoint
    if curl -s --max-time $TIMEOUT "$BASE_URL/api/health" | grep -q '"ok":true'; then
        log_success "Health endpoint funcionando"
    else
        log_error "Health endpoint no funcionando"
    fi

    # Sandra chat endpoint (método OPTIONS para CORS)
    if curl -s --max-time $TIMEOUT -X OPTIONS "$BASE_URL/api/sandra-chat" | grep -q "204"; then
        log_success "Sandra Chat CORS configurado"
    else
        log_warning "Sandra Chat CORS puede no estar configurado"
    fi
}

# Test de páginas principales
test_main_pages() {
    log_test "Páginas principales del sitio"

    PAGES=("/" "/alojamientos.html" "/owners.html" "/servicios.html" "/contacto.html" "/auth.html")

    for page in "${PAGES[@]}"; do
        if curl -s --max-time $TIMEOUT "$BASE_URL$page" | grep -q "<title>"; then
            log_success "Página $page cargando correctamente"
        else
            log_error "Página $page no carga correctamente"
        fi
    done
}

# Test de recursos estáticos
test_static_resources() {
    log_test "Recursos estáticos (CSS, JS)"

    # CSS principal
    if curl -s --max-time $TIMEOUT "$BASE_URL/assets/css/styles.css" | grep -q "body\|html"; then
        log_success "CSS principal disponible"
    else
        log_error "CSS principal no disponible"
    fi

    # JavaScript principal
    if curl -s --max-time $TIMEOUT "$BASE_URL/assets/js/site.js" | grep -q "function\|const\|var"; then
        log_success "JavaScript principal disponible"
    else
        log_error "JavaScript principal no disponible"
    fi

    # Sandra Widget
    if curl -s --max-time $TIMEOUT "$BASE_URL/assets/js/sandra-widget.js" | grep -q "Sandra Widget"; then
        log_success "Sandra Widget disponible"
    else
        log_error "Sandra Widget no disponible"
    fi
}

# Test de datos JSON
test_data_endpoints() {
    log_test "Endpoints de datos JSON"

    # Listings
    if curl -s --max-time $TIMEOUT "$BASE_URL/data/listings.json" | grep -q '"id"'; then
        log_success "Listings JSON disponible"
    else
        log_error "Listings JSON no disponible"
    fi

    # Manifest PWA
    if curl -s --max-time $TIMEOUT "$BASE_URL/manifest.json" | grep -q '"name"'; then
        log_success "PWA Manifest disponible"
    else
        log_error "PWA Manifest no disponible"
    fi
}

# Test de performance básico
test_performance() {
    log_test "Performance básico"

    START_TIME=$(date +%s%N)
    curl -s --max-time $TIMEOUT "$BASE_URL" > /dev/null
    END_TIME=$(date +%s%N)

    RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))

    if [ $RESPONSE_TIME -lt 2000 ]; then
        log_success "Tiempo de respuesta: ${RESPONSE_TIME}ms (bueno)"
    elif [ $RESPONSE_TIME -lt 5000 ]; then
        log_warning "Tiempo de respuesta: ${RESPONSE_TIME}ms (aceptable)"
    else
        log_error "Tiempo de respuesta: ${RESPONSE_TIME}ms (lento)"
    fi
}

# Test de Sandra IA Integration
test_sandra_integration() {
    log_test "Integración Sandra IA"

    # Verificar configuración Sandra
    if curl -s --max-time $TIMEOUT "$BASE_URL" | grep -q "sandra-widget"; then
        log_success "Sandra Widget incluido en página principal"
    else
        log_error "Sandra Widget no incluido"
    fi

    # Verificar WebSocket configuration (en el HTML)
    if curl -s --max-time $TIMEOUT "$BASE_URL" | grep -q "WSS_URL"; then
        log_success "WebSocket URL configurado"
    else
        log_error "WebSocket URL no configurado"
    fi
}

# Ejecutar todos los tests
echo "Iniciando tests E2E en: $BASE_URL"
echo "Timeout por test: ${TIMEOUT}s"
echo ""

test_basic_connectivity
echo ""

test_backend_functions
echo ""

test_main_pages
echo ""

test_static_resources
echo ""

test_data_endpoints
echo ""

test_performance
echo ""

test_sandra_integration
echo ""

# Resumen final
echo "========================================"
echo "🏁 RESUMEN FINAL"
echo "========================================"

if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✅ TODOS LOS TESTS PASARON${NC}"
    echo "Estado: PRODUCCIÓN LISTA"
    exit 0
else
    echo -e "${RED}❌ $FAILURES TESTS FALLARON${NC}"
    echo "Estado: REQUIERE ATENCIÓN"
    exit 1
fi