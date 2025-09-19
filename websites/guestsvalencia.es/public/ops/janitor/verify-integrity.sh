#!/bin/bash
# JANITOR VERIFICACIÓN DE INTEGRIDAD - GuestsValencia.es
# CEO: Clayton Thomas
# Fecha: 2024-09-17

echo "🔍 JANITOR - VERIFICACIÓN DE INTEGRIDAD"
echo "======================================="
echo ""

# Verificar proyecto principal
MAIN_PROJECT="/c/Users/clayt/OneDrive/Documentos/PROYECTOS/CLAYTOMSYSTEMS_GITHUB/websites/guestsvalencia.es"
echo "📁 Verificando proyecto principal..."
if [ -f "$MAIN_PROJECT/index.html" ]; then
    echo "   ✅ index.html existe"
    if grep -q "Sandra IA" "$MAIN_PROJECT/index.html"; then
        echo "   ✅ Contenido correcto detectado"
    else
        echo "   ❌ Contenido index.html incorrecto"
    fi
else
    echo "   ❌ index.html FALTANTE - CRÍTICO"
fi

if [ -f "$MAIN_PROJECT/manifest.json" ]; then
    echo "   ✅ manifest.json existe"
else
    echo "   ❌ manifest.json FALTANTE"
fi

if [ -f "$MAIN_PROJECT/netlify.toml" ]; then
    echo "   ✅ netlify.toml existe"
else
    echo "   ❌ netlify.toml FALTANTE"
fi

if [ -f "$MAIN_PROJECT/sw.js" ]; then
    echo "   ✅ sw.js existe"
else
    echo "   ❌ sw.js FALTANTE"
fi

echo ""

# Verificar proyecto activo
ACTIVE_PROJECT="/c/Users/clayt/OneDrive/Documentos/PROYECTOS/SANDRA-IA-7.0/web/guestsvalencia"
echo "📁 Verificando proyecto activo web/guestsvalencia..."
if [ -d "$ACTIVE_PROJECT" ]; then
    echo "   ✅ Directorio existe"
    if [ -f "$ACTIVE_PROJECT/index.html" ]; then
        echo "   ✅ index.html existe"
    else
        echo "   ⚠️  index.html no encontrado"
    fi
else
    echo "   ❌ Directorio FALTANTE - CRÍTICO"
fi

echo ""

# Verificar proyectos obsoletos
echo "📁 Verificando proyectos obsoletos (deberían existir antes de limpieza)..."
OBSOLETE_BASE="/c/Users/clayt/OneDrive/Documentos/PROYECTOS/SANDRA-IA-7.0"
OBSOLETE_PROJECTS=(
    "guestsvalencia-9listings-with-fakephotos"
    "guestsvalencia-admin-ready (1)"
    "guestsvalencia-comms-pack-v2"
    "guestsvalencia-comms-pack-v2-complete"
)

for project in "${OBSOLETE_PROJECTS[@]}"; do
    if [ -d "$OBSOLETE_BASE/$project" ]; then
        echo "   📁 $project: EXISTE (listo para limpieza)"
    else
        echo "   🗑️  $project: YA ELIMINADO"
    fi
done

echo ""

# Verificar herramientas janitor
echo "🛠️  Verificando herramientas JANITOR..."
JANITOR_DIR="/c/Users/clayt/OneDrive/Documentos/PROYECTOS/CLAYTOMSYSTEMS_GITHUB/websites/guestsvalencia.es/ops/janitor"

if [ -f "$JANITOR_DIR/cleanup-script.sh" ]; then
    echo "   ✅ Script de limpieza existe"
    if [ -x "$JANITOR_DIR/cleanup-script.sh" ]; then
        echo "   ✅ Script es ejecutable"
    else
        echo "   ⚠️  Script no es ejecutable"
    fi
else
    echo "   ❌ Script de limpieza FALTANTE"
fi

if [ -d "$JANITOR_DIR/backup" ]; then
    echo "   ✅ Directorio backup existe"
    backup_count=$(ls -1 "$JANITOR_DIR/backup" 2>/dev/null | wc -l)
    echo "   📦 Backups disponibles: $backup_count"
else
    echo "   ❌ Directorio backup FALTANTE"
fi

echo ""

# Resumen final
echo "📊 RESUMEN VERIFICACIÓN"
echo "======================="
echo "Proyecto principal: $([ -f "$MAIN_PROJECT/index.html" ] && echo "✅ OK" || echo "❌ FALLO")"
echo "Proyecto activo: $([ -d "$ACTIVE_PROJECT" ] && echo "✅ OK" || echo "❌ FALLO")"
echo "Herramientas JANITOR: $([ -f "$JANITOR_DIR/cleanup-script.sh" ] && echo "✅ OK" || echo "❌ FALLO")"

# Calcular espacio total obsoleto
total_size=0
obsolete_count=0
for project in "${OBSOLETE_PROJECTS[@]}"; do
    if [ -d "$OBSOLETE_BASE/$project" ]; then
        obsolete_count=$((obsolete_count + 1))
    fi
done

echo "Proyectos obsoletos detectados: $obsolete_count/4"
echo ""

if [ -f "$MAIN_PROJECT/index.html" ] && [ -d "$ACTIVE_PROJECT" ] && [ -f "$JANITOR_DIR/cleanup-script.sh" ]; then
    echo "🎯 ESTADO: LISTO PARA LIMPIEZA"
    echo "✅ Todos los componentes críticos verificados"
    echo "🚀 Ejecutar: cd '$JANITOR_DIR' && DRY_RUN=false ./cleanup-script.sh"
else
    echo "⚠️  ESTADO: VERIFICACIÓN REQUERIDA"
    echo "❌ Faltan componentes críticos"
fi