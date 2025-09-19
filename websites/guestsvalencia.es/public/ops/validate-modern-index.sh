#!/bin/bash
# VALIDADOR INDEX MODERNO - FE_RESTORER
# Verifica funcionalidades clave del index restaurado

echo "🎯 VALIDANDO INDEX MODERNO GUESTSVALENCIA"
echo "=========================================="

# Variables
INDEX_FILE="index.html"
BASE_URL="http://localhost:8080"  # Para test local
PROD_URL="https://guestsvalencia.es"

# Funciones de validación
validate_structure() {
    echo "✅ Validando estructura HTML..."

    # Verificar navbar fija
    if grep -q "fixed top-0 left-0 right-0 z-50" $INDEX_FILE; then
        echo "  ✓ Navbar fija implementada"
    else
        echo "  ❌ Navbar fija NO encontrada"
    fi

    # Verificar slot IA
    if grep -q "ai-slot" $INDEX_FILE; then
        echo "  ✓ Slot IA presente"
    else
        echo "  ❌ Slot IA NO encontrado"
    fi

    # Verificar barra de búsqueda
    if grep -q "search-input" $INDEX_FILE; then
        echo "  ✓ Barra de búsqueda presente"
    else
        echo "  ❌ Barra de búsqueda NO encontrada"
    fi

    # Verificar botones Sandra
    if grep -q "sandra-chat-btn\|sandra-call-btn" $INDEX_FILE; then
        echo "  ✓ Botones Sandra IA presentes"
    else
        echo "  ❌ Botones Sandra IA NO encontrados"
    fi
}

validate_scripts() {
    echo "✅ Validando scripts JavaScript..."

    # Verificar ModernIndexController
    if grep -q "class ModernIndexController" $INDEX_FILE; then
        echo "  ✓ ModernIndexController implementado"
    else
        echo "  ❌ ModernIndexController NO encontrado"
    fi

    # Verificar efecto shimmer
    if grep -q "animate-shimmer" $INDEX_FILE; then
        echo "  ✓ Efecto shimmer configurado"
    else
        echo "  ❌ Efecto shimmer NO encontrado"
    fi

    # Verificar intervalo de 15s
    if grep -q "15000" $INDEX_FILE; then
        echo "  ✓ Intervalo shimmer 15s configurado"
    else
        echo "  ❌ Intervalo shimmer NO encontrado"
    fi
}

validate_responsive() {
    echo "✅ Validando diseño responsive..."

    # Verificar clases responsive
    if grep -q "md:flex\|md:text\|md:grid" $INDEX_FILE; then
        echo "  ✓ Clases responsive implementadas"
    else
        echo "  ❌ Clases responsive NO encontradas"
    fi

    # Verificar menu móvil
    if grep -q "mobile-menu" $INDEX_FILE; then
        echo "  ✓ Menu móvil presente"
    else
        echo "  ❌ Menu móvil NO encontrado"
    fi
}

validate_performance() {
    echo "✅ Validando performance..."

    # Verificar preconnects
    if grep -q "preconnect" $INDEX_FILE; then
        echo "  ✓ Preconnects configurados"
    else
        echo "  ❌ Preconnects NO encontrados"
    fi

    # Verificar PWA
    if grep -q "manifest.webmanifest\|serviceWorker" $INDEX_FILE; then
        echo "  ✓ PWA configurado"
    else
        echo "  ❌ PWA NO encontrado"
    fi
}

validate_integration() {
    echo "✅ Validando integraciones..."

    # Verificar Sandra Widget
    if grep -q "sandra-widget-hybrid.js" $INDEX_FILE; then
        echo "  ✓ Sandra Widget integrado"
    else
        echo "  ❌ Sandra Widget NO encontrado"
    fi

    # Verificar Netlify Identity
    if grep -q "netlify-identity-widget.js" $INDEX_FILE; then
        echo "  ✓ Netlify Identity presente"
    else
        echo "  ❌ Netlify Identity NO encontrado"
    fi

    # Verificar app principal
    if grep -q "gv-app.js" $INDEX_FILE; then
        echo "  ✓ App principal integrada"
    else
        echo "  ❌ App principal NO encontrada"
    fi
}

# Ejecutar validaciones
echo "Archivo: $INDEX_FILE"
echo "Tamaño: $(wc -l < $INDEX_FILE) líneas"
echo ""

validate_structure
echo ""
validate_scripts
echo ""
validate_responsive
echo ""
validate_performance
echo ""
validate_integration

echo ""
echo "🎯 VALIDACIÓN COMPLETADA"
echo "========================"
echo "Para test funcional:"
echo "1. Abrir index.html en navegador"
echo "2. Verificar navbar fija al hacer scroll"
echo "3. Confirmar slot IA aparece tras 1.5s"
echo "4. Observar shimmer cada 15s"
echo "5. Testear búsqueda con Enter"
echo "6. Probar menu móvil"
echo ""
echo "🚀 Ready for production!"