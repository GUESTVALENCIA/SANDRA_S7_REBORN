#!/bin/bash
# validate-qa-guard.sh
# SCRIPT DE VALIDACIÓN RÁPIDA QA_GUARD

echo "🚀 QA_GUARD - Validación Rápida Post-Restauración"
echo "================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para checks
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1${NC}"
        return 0
    else
        echo -e "${RED}❌ $1${NC}"
        return 1
    fi
}

check_url() {
    if curl -s --head "$1" | head -n 1 | grep -q "200 OK"; then
        echo -e "${GREEN}✅ $1 (200 OK)${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 (No disponible)${NC}"
        return 1
    fi
}

# Variables
BASE_URL="https://guestsvalencia.es"
SCORE=0
TOTAL=0

echo -e "\n${BLUE}📁 1. VERIFICACIÓN DE ARCHIVOS DE TESTING${NC}"
echo "=========================================="

((TOTAL++))
if check_file "tests/e2e/smoke-tests.spec.ts"; then ((SCORE++)); fi

((TOTAL++))
if check_file "tests/contract/api-contracts.spec.ts"; then ((SCORE++)); fi

((TOTAL++))
if check_file "tests/security/security-validation.spec.ts"; then ((SCORE++)); fi

((TOTAL++))
if check_file "tests/e2e/performance.spec.ts"; then ((SCORE++)); fi

((TOTAL++))
if check_file "lighthouse-ci.config.js"; then ((SCORE++)); fi

((TOTAL++))
if check_file "playwright.config.ts"; then ((SCORE++)); fi

echo -e "\n${BLUE}🌐 2. VERIFICACIÓN DE ENDPOINTS${NC}"
echo "================================"

((TOTAL++))
if check_url "$BASE_URL"; then ((SCORE++)); fi

((TOTAL++))
if check_url "$BASE_URL/alojamientos.html"; then ((SCORE++)); fi

((TOTAL++))
if check_url "$BASE_URL/manifest.webmanifest"; then ((SCORE++)); fi

echo -e "\n${BLUE}🔍 3. VERIFICACIÓN DE ELEMENTOS UI CRÍTICOS${NC}"
echo "=========================================="

# Verificar navbar en HTML
((TOTAL++))
if grep -q "site-navbar" index.html; then
    echo -e "${GREEN}✅ Navbar class found${NC}"
    ((SCORE++))
else
    echo -e "${RED}❌ Navbar class not found${NC}"
fi

# Verificar Sandra FAB
((TOTAL++))
if grep -q "sandra-widget-hybrid.js" index.html; then
    echo -e "${GREEN}✅ Sandra FAB found${NC}"
    ((SCORE++))
else
    echo -e "${RED}❌ Sandra FAB not found${NC}"
fi

# Verificar PWA manifest
((TOTAL++))
if grep -q 'rel="manifest"' index.html; then
    echo -e "${GREEN}✅ PWA manifest link found${NC}"
    ((SCORE++))
else
    echo -e "${RED}❌ PWA manifest link not found${NC}"
fi

echo -e "\n${BLUE}🔒 4. VERIFICACIÓN DE SEGURIDAD BÁSICA${NC}"
echo "====================================="

# Verificar que no hay claves expuestas en archivos públicos
((TOTAL++))
if grep -r "sk-[a-zA-Z0-9]\{40,\}" --include="*.html" --include="*.js" . > /dev/null 2>&1; then
    echo -e "${RED}❌ Posibles claves API expuestas${NC}"
else
    echo -e "${GREEN}✅ No claves API visibles${NC}"
    ((SCORE++))
fi

# Verificar HTTPS en links
((TOTAL++))
if grep -q "https://" index.html; then
    echo -e "${GREEN}✅ Links HTTPS encontrados${NC}"
    ((SCORE++))
else
    echo -e "${YELLOW}⚠️ Verificar links HTTPS${NC}"
fi

echo -e "\n${BLUE}📦 5. VERIFICACIÓN DE DEPENDENCIAS${NC}"
echo "=================================="

# Verificar si Node.js está disponible
((TOTAL++))
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js disponible: $(node --version)${NC}"
    ((SCORE++))
else
    echo -e "${RED}❌ Node.js no encontrado${NC}"
fi

# Verificar NPM
((TOTAL++))
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✅ NPM disponible: $(npm --version)${NC}"
    ((SCORE++))
else
    echo -e "${RED}❌ NPM no encontrado${NC}"
fi

echo -e "\n${BLUE}🎯 6. VALIDACIÓN DE FUNCIONALIDADES SANDRA${NC}"
echo "========================================="

# Verificar archivos Sandra
((TOTAL++))
if check_file "assets/sandra-widget-hybrid.js"; then ((SCORE++)); fi

# Verificar funciones Netlify
((TOTAL++))
if check_file "netlify/functions/sandra-chat.js"; then ((SCORE++)); fi

((TOTAL++))
if check_file "netlify/functions/sandra-tts.js"; then ((SCORE++)); fi

echo -e "\n${BLUE}📊 RESUMEN DE VALIDACIÓN${NC}"
echo "========================"

PERCENTAGE=$((SCORE * 100 / TOTAL))

echo -e "Tests pasados: ${GREEN}$SCORE${NC}/$TOTAL"
echo -e "Porcentaje: ${GREEN}$PERCENTAGE%${NC}"

if [ $PERCENTAGE -ge 90 ]; then
    echo -e "\n${GREEN}🎉 EXCELENTE! Calidad ≥90% - Listo para testing completo${NC}"
    echo -e "${GREEN}👍 Ejecutar: npm run qa:guard${NC}"
elif [ $PERCENTAGE -ge 70 ]; then
    echo -e "\n${YELLOW}⚠️ BUENO. Calidad 70-89% - Resolver issues pendientes${NC}"
    echo -e "${YELLOW}🔧 Revisar elementos faltantes arriba${NC}"
else
    echo -e "\n${RED}❌ CRÍTICO. Calidad <70% - Requiere atención inmediata${NC}"
    echo -e "${RED}🚨 Implementar elementos básicos antes de continuar${NC}"
fi

echo -e "\n${BLUE}📋 PRÓXIMOS PASOS${NC}"
echo "=================="

if [ ! -f "package-lock.json" ]; then
    echo -e "${YELLOW}1. Instalar dependencias:${NC}"
    echo "   cp package-updated.json package.json"
    echo "   npm install"
    echo "   npx playwright install"
fi

echo -e "${YELLOW}2. Ejecutar tests completos:${NC}"
echo "   npm run qa:guard"

echo -e "${YELLOW}3. Generar reporte Lighthouse:${NC}"
echo "   npm run lighthouse"

echo -e "${YELLOW}4. Revisar reporte completo:${NC}"
echo "   cat qa/report.md"

echo -e "\n${BLUE}🤖 QA_GUARD Validation Complete - Claude Code${NC}"
echo "=============================================="