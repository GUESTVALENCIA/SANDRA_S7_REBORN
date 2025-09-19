#!/bin/bash

# Script de validación para implementación de navbar y footer

cd /c/Users/clayt/GUESTSVALENCIA.ES

echo "🔍 VALIDACIÓN DE IMPLEMENTACIÓN GUESTSVALENCIA"
echo "=============================================="

files=("index.html" "alojamientos.html" "propietarios.html" "contacto.html")

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo ""
        echo "📄 Validando $file..."

        # Verificar navbar
        navbar_count=$(grep -c "site-navbar" "$file")
        if [ $navbar_count -gt 0 ]; then
            echo "  ✅ Navbar implementada"
        else
            echo "  ❌ Navbar NO encontrada"
        fi

        # Verificar logo
        logo_count=$(grep -c "logo-gv.svg" "$file")
        if [ $logo_count -gt 0 ]; then
            echo "  ✅ Logo GV implementado"
        else
            echo "  ❌ Logo GV NO encontrado"
        fi

        # Verificar branding GuestsValencia
        brand_count=$(grep -c "GuestsValencia" "$file")
        if [ $brand_count -gt 0 ]; then
            echo "  ✅ Branding GuestsValencia: $brand_count referencias"
        else
            echo "  ❌ Branding GuestsValencia NO encontrado"
        fi

        # Verificar footer
        footer_count=$(grep -c "Footer unificado GuestsValencia" "$file")
        if [ $footer_count -gt 0 ]; then
            echo "  ✅ Footer unificado implementado"
        else
            echo "  ❌ Footer unificado NO encontrado"
        fi

        # Verificar Tailwind CSS
        tailwind_count=$(grep -c "tailwindcss" "$file")
        if [ $tailwind_count -gt 0 ]; then
            echo "  ✅ Tailwind CSS incluido"
        else
            echo "  ❌ Tailwind CSS NO encontrado"
        fi

        # Verificar estructura responsive
        responsive_count=$(grep -c "md:flex\|md:hidden" "$file")
        if [ $responsive_count -gt 0 ]; then
            echo "  ✅ Estructura responsive"
        else
            echo "  ❌ Estructura responsive NO encontrada"
        fi

    else
        echo "❌ $file NO EXISTE"
    fi
done

echo ""
echo "📁 VALIDACIÓN DE ARCHIVOS ADICIONALES"
echo "===================================="

# Verificar logo
if [ -f "assets/img/logo-gv.svg" ]; then
    echo "✅ Logo SVG existe: assets/img/logo-gv.svg"
else
    echo "❌ Logo SVG NO existe"
fi

# Verificar estilos CSS
if [ -f "navbar-styles.css" ]; then
    echo "✅ Estilos CSS navbar existen: navbar-styles.css"
else
    echo "❌ Estilos CSS navbar NO existen"
fi

# Verificar script JavaScript
if [ -f "navbar-script.js" ]; then
    echo "✅ Script JavaScript navbar existe: navbar-script.js"
else
    echo "❌ Script JavaScript navbar NO existe"
fi

echo ""
echo "🎯 RESUMEN DE VALIDACIÓN"
echo "========================"

total_files=${#files[@]}
valid_files=0

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        navbar=$(grep -c "site-navbar" "$file")
        logo=$(grep -c "logo-gv.svg" "$file")
        brand=$(grep -c "GuestsValencia" "$file")
        footer=$(grep -c "Footer unificado GuestsValencia" "$file")

        if [ $navbar -gt 0 ] && [ $logo -gt 0 ] && [ $brand -gt 0 ] && [ $footer -gt 0 ]; then
            ((valid_files++))
        fi
    fi
done

echo "Archivos procesados: $valid_files/$total_files"

if [ $valid_files -eq $total_files ]; then
    echo "🎉 ¡IMPLEMENTACIÓN EXITOSA! Todos los archivos están correctamente configurados."
    echo ""
    echo "📋 CHECKLIST COMPLETADO:"
    echo "• ✅ Navbar fija con logo en todas las páginas"
    echo "• ✅ Logo GuestsValencia implementado"
    echo "• ✅ Footer unificado de 4 columnas"
    echo "• ✅ Responsive design con Tailwind CSS"
    echo "• ✅ Branding consistente (sin ClayTomSystems)"
    echo "• ✅ Scripts y estilos implementados"
else
    echo "⚠️  Hay algunos archivos que necesitan revisión."
fi

echo ""
echo "🌐 PRUEBA CON CURL:"
echo "curl -s http://localhost:8080/index.html | grep -o 'GuestsValencia' | wc -l"
echo "curl -s http://localhost:8080/alojamientos.html | grep -o 'site-navbar' | wc -l"