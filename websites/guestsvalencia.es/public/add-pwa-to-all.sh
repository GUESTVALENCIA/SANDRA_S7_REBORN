#!/bin/bash
# Script para agregar meta tags PWA a todas las páginas HTML

PAGES=(
  "./acceso.html"
  "./alojamientos.html"
  "./alojamientos/artes-loft.html"
  "./alojamientos/cabanal-atico.html"
  "./alojamientos/ruzafa-suite.html"
  "./blog.html"
  "./cancel.html"
  "./contacto.html"
  "./faq.html"
  "./legal.html"
  "./propietarios.html"
  "./reservar.html"
  "./success.html"
)

for page in "${PAGES[@]}"; do
  echo "Procesando: $page"

  # Backup
  cp "$page" "${page}.backup"

  # Agregar meta tags PWA si no existen
  if ! grep -q "manifest.webmanifest" "$page"; then
    sed -i '/apple-touch-icon/a\\n    <!-- PWA Meta Tags -->\n    <link rel="manifest" href="/manifest.webmanifest">\n    <meta name="theme-color" content="#0b1020">' "$page"
  fi

  # Agregar scripts PWA si no existen
  if ! grep -q "serviceWorker" "$page"; then
    sed -i '/<\/body>/i\\n    <!-- PWA Scripts -->\n    <script>\n      if("serviceWorker" in navigator){ navigator.serviceWorker.register("/sw.js"); }\n    </script>\n    <script src="/assets/pwa-install.js"></script>' "$page"
  fi

  # Limpiar formato
  sed -i 's/^n    /    /' "$page"

  echo "✅ Completado: $page"
done

echo "🎉 PWA implementado en todas las páginas"