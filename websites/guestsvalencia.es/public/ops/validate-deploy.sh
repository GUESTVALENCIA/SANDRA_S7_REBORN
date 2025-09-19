#!/bin/bash
# Deploy Validation Script - GuestsValencia PWA
# Validates complete deployment meets DoD criteria

set -e

DOMAIN=${1:-https://guestsvalencia.es}
STAGING_DOMAIN=${2:-https://preview--guestsvalencia.netlify.app}

echo "🔍 DEPLOY VALIDATION SUITE"
echo "Production: $DOMAIN"
echo "Staging: $STAGING_DOMAIN"
echo "=================================="

TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to run check and track results
run_check() {
    local description=$1
    local command=$2

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "[$TOTAL_CHECKS] $description... "

    if eval "$command" &>/dev/null; then
        echo "✅ PASS"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo "❌ FAIL"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# === CORE INFRASTRUCTURE ===
echo -e "\n🏗️  INFRASTRUCTURE CHECKS"

run_check "Site accessibility" "curl -f -s '$DOMAIN' > /dev/null"
run_check "HTTPS certificate" "curl -f -s -I '$DOMAIN' | grep -q 'HTTP/2 200'"
run_check "DNS resolution" "dig +short guestsvalencia.es | grep -q '^[0-9]'"
run_check "CDN response" "curl -s -I '$DOMAIN' | grep -q 'x-nf-request-id'"

# === SECURITY HEADERS ===
echo -e "\n🔐 SECURITY VALIDATION"

run_check "HSTS header" "curl -s -I '$DOMAIN' | grep -q 'Strict-Transport-Security'"
run_check "X-Frame-Options" "curl -s -I '$DOMAIN' | grep -q 'X-Frame-Options'"
run_check "X-Content-Type-Options" "curl -s -I '$DOMAIN' | grep -q 'X-Content-Type-Options'"
run_check "Referrer Policy" "curl -s -I '$DOMAIN' | grep -q 'Referrer-Policy'"

# === PWA REQUIREMENTS ===
echo -e "\n📱 PWA VALIDATION"

run_check "PWA Manifest accessible" "curl -f -s '$DOMAIN/manifest.webmanifest' > /dev/null"
run_check "Service Worker registration" "curl -f -s '$DOMAIN/sw.js' > /dev/null"
run_check "PWA install script" "curl -f -s '$DOMAIN/assets/pwa-install.js' > /dev/null"
run_check "PWA icons available" "curl -f -s '$DOMAIN/assets/img/pwa-192.png' > /dev/null"

# === REDIRECTS & ROUTING ===
echo -e "\n🔄 REDIRECT VALIDATION"

run_check "Legacy redirect (/legacy/*)" "[ \$(curl -s -o /dev/null -w '%{http_code}' '$DOMAIN/legacy/old-page') = '301' ]"
run_check "Demo redirect (/demo/*)" "[ \$(curl -s -o /dev/null -w '%{http_code}' '$DOMAIN/demo/test') = '301' ]"
run_check "SPA fallback works" "curl -f -s '$DOMAIN/nonexistent-page' | grep -q 'GuestsValencia'"

# === API FUNCTIONALITY ===
echo -e "\n🔌 API VALIDATION"

if curl -s "$DOMAIN/api/chat" &>/dev/null; then
    run_check "API Chat endpoint" "curl -f -s '$DOMAIN/api/chat' > /dev/null"
    run_check "API CORS headers" "curl -s -I '$DOMAIN/api/chat' | grep -q 'Access-Control-Allow-Origin'"
else
    echo "⚠️  API endpoints not deployed (skip API checks)"
fi

# === PERFORMANCE ===
echo -e "\n⚡ PERFORMANCE VALIDATION"

# Load time check
load_time=$(curl -s -w "%{time_total}" -o /dev/null "$DOMAIN")
run_check "Load time < 2s" "[ \$(echo \"$load_time < 2.0\" | bc -l) -eq 1 ]"

# Asset optimization
run_check "Asset cache headers" "curl -s -I '$DOMAIN/assets/img/pwa-192.png' | grep -q 'max-age=31536000'"

# Mobile responsiveness (basic check)
run_check "Mobile viewport meta" "curl -s '$DOMAIN' | grep -q 'viewport'"

# === CONTENT VALIDATION ===
echo -e "\n📄 CONTENT VALIDATION"

run_check "Main navigation present" "curl -s '$DOMAIN' | grep -q -i 'alojamientos'"
run_check "Contact page accessible" "curl -f -s '$DOMAIN/contacto.html' > /dev/null"
run_check "Legal page accessible" "curl -f -s '$DOMAIN/legal.html' > /dev/null"

# === ENVIRONMENT VARIABLES ===
echo -e "\n🔧 ENVIRONMENT VALIDATION"

# Check if variables are properly injected (public ones only)
if curl -s "$DOMAIN" | grep -q "NEXT_PUBLIC_"; then
    run_check "Public env vars injected" "true"
else
    echo "⚠️  No public env vars detected (may be expected)"
fi

# === STAGING CONSISTENCY ===
if [ "$STAGING_DOMAIN" != "$DOMAIN" ]; then
    echo -e "\n🎭 STAGING CONSISTENCY"

    run_check "Staging site accessible" "curl -f -s '$STAGING_DOMAIN' > /dev/null"
    run_check "Same manifest on staging" "diff <(curl -s '$DOMAIN/manifest.webmanifest') <(curl -s '$STAGING_DOMAIN/manifest.webmanifest')"
fi

# === SUMMARY ===
echo -e "\n=================================="
echo "🏁 VALIDATION COMPLETE"
echo "Total Checks: $TOTAL_CHECKS"
echo "Passed: $PASSED_CHECKS ✅"
echo "Failed: $FAILED_CHECKS ❌"

# Calculate pass rate
if [ $TOTAL_CHECKS -gt 0 ]; then
    PASS_RATE=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))
    echo "Pass Rate: $PASS_RATE%"

    # DoD requires 96% minimum
    if [ $PASS_RATE -ge 96 ]; then
        echo "🎉 DEPLOYMENT APPROVED (Pass rate ≥ 96%)"
        echo "✅ All DoD criteria met"
        exit 0
    else
        echo "🚨 DEPLOYMENT REJECTED (Pass rate < 96%)"
        echo "❌ DoD criteria not met"
        echo "🔄 Rollback recommended"
        exit 1
    fi
else
    echo "⚠️  No checks executed"
    exit 1
fi