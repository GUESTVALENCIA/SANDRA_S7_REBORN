#!/bin/bash
# JANITOR CLEANUP SCRIPT - GuestsValencia.es OLA 2.1
# CEO: Clayton Thomas
# Fecha: 2024-09-17
# VERSIÓN: 1.0

set -e
DRY_RUN=${DRY_RUN:-true}
BASE_DIR="/c/Users/clayt/OneDrive/Documentos/PROYECTOS/SANDRA-IA-7.0"
BACKUP_DIR="/c/Users/clayt/OneDrive/Documentos/PROYECTOS/CLAYTOMSYSTEMS_GITHUB/websites/guestsvalencia.es/ops/janitor/backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "🧹 JANITOR CLEANUP SCRIPT - INICIANDO"
echo "📅 Timestamp: $TIMESTAMP"
echo "🔍 DRY_RUN: $DRY_RUN"
echo "📂 Base Directory: $BASE_DIR"
echo "💾 Backup Directory: $BACKUP_DIR"
echo ""

# Lista de proyectos obsoletos a eliminar
OBSOLETE_PROJECTS=(
    "guestsvalencia-9listings-with-fakephotos"
    "guestsvalencia-admin-ready (1)"
    "guestsvalencia-comms-pack-v2"
    "guestsvalencia-comms-pack-v2-complete"
)

# Función para calcular tamaño
calculate_size() {
    local dir="$1"
    if [ -d "$dir" ]; then
        du -sh "$dir" | cut -f1
    else
        echo "0K"
    fi
}

# Función para backup
backup_project() {
    local project="$1"
    local source_path="$BASE_DIR/$project"
    local backup_path="$BACKUP_DIR/${project}_backup_$TIMESTAMP.tar.gz"

    if [ -d "$source_path" ]; then
        echo "💾 Backing up: $project"
        if [ "$DRY_RUN" = "true" ]; then
            echo "   [DRY RUN] Would create: $backup_path"
        else
            cd "$BASE_DIR"
            tar -czf "$backup_path" "$project"
            echo "   ✅ Backup created: $backup_path"
        fi
    else
        echo "   ⚠️  Directory not found: $source_path"
    fi
}

# Función para eliminar proyecto
remove_project() {
    local project="$1"
    local source_path="$BASE_DIR/$project"

    if [ -d "$source_path" ]; then
        local size=$(calculate_size "$source_path")
        echo "🗑️  Removing: $project ($size)"
        if [ "$DRY_RUN" = "true" ]; then
            echo "   [DRY RUN] Would remove: $source_path"
        else
            rm -rf "$source_path"
            echo "   ✅ Removed: $source_path"
        fi
    else
        echo "   ⚠️  Directory not found: $source_path"
    fi
}

# Verificación de seguridad
echo "🛡️  VERIFICACIÓN DE SEGURIDAD"
PROTECTED_PATHS=(
    "/c/Users/clayt/OneDrive/Documentos/PROYECTOS/CLAYTOMSYSTEMS_GITHUB/websites/guestsvalencia.es"
    "/c/Users/clayt/OneDrive/Documentos/PROYECTOS/SANDRA-IA-7.0/web/guestsvalencia"
)

for protected_path in "${PROTECTED_PATHS[@]}"; do
    if [ -d "$protected_path" ]; then
        echo "   ✅ Protected path verified: $protected_path"
    else
        echo "   ⚠️  Protected path missing: $protected_path"
    fi
done
echo ""

# Cálculo de espacio total a liberar
echo "📊 ANÁLISIS DE ESPACIO"
total_size=0
for project in "${OBSOLETE_PROJECTS[@]}"; do
    project_path="$BASE_DIR/$project"
    if [ -d "$project_path" ]; then
        size=$(calculate_size "$project_path")
        echo "   📁 $project: $size"
    fi
done
echo ""

# Crear directorio de backup si no existe
if [ "$DRY_RUN" = "false" ]; then
    mkdir -p "$BACKUP_DIR"
fi

# Proceso de backup
echo "💾 INICIANDO BACKUP DE SEGURIDAD"
for project in "${OBSOLETE_PROJECTS[@]}"; do
    backup_project "$project"
done
echo ""

# Proceso de eliminación
echo "🗑️  INICIANDO ELIMINACIÓN"
for project in "${OBSOLETE_PROJECTS[@]}"; do
    remove_project "$project"
done
echo ""

# Verificación post-limpieza
echo "🔍 VERIFICACIÓN POST-LIMPIEZA"
if [ "$DRY_RUN" = "false" ]; then
    for project in "${OBSOLETE_PROJECTS[@]}"; do
        project_path="$BASE_DIR/$project"
        if [ ! -d "$project_path" ]; then
            echo "   ✅ Confirmed removed: $project"
        else
            echo "   ❌ Still exists: $project"
        fi
    done
else
    echo "   [DRY RUN] Post-cleanup verification skipped"
fi
echo ""

echo "🧹 JANITOR CLEANUP COMPLETADO"
echo "📋 Para ejecutar realmente: DRY_RUN=false ./cleanup-script.sh"
echo "📊 Para verificar backups: ls -la $BACKUP_DIR"