#!/bin/bash
echo "=== TESTING DE CAJA BLANCA - ZeroSmoke ==="

echo "1. Analizando dependencias del backend..."
cd ../backend 2>/dev/null || cd ../../backend 2>/dev/null || echo "❌ No se encontró directorio backend"

if [ -f package.json ]; then
    echo "Ejecutando npm audit..."
    npm audit --json > ../security-testing/reports/npm-audit-backend.json 2>/dev/null
    npm audit
else
    echo "❌ No se encontró package.json en backend"
fi

echo -e "\n2. Analizando dependencias del frontend..."
cd ../frontend 2>/dev/null || cd ../frontend 2>/dev/null

if [ -f package.json ]; then
    echo "Ejecutando npm audit en frontend..."
    npm audit --json > ../security-testing/reports/npm-audit-frontend.json 2>/dev/null
    npm audit
else
    echo "❌ No se encontró package.json en frontend"
fi

echo -e "\n3. Buscando secrets hardcodeados..."
cd .. 2>/dev/null
echo "Buscando patrones de secrets en el código..."
grep -r "password.*=" backend/src/ 2>/dev/null || echo "No se encontraron passwords hardcodeados"
grep -r "secret.*=" backend/src/ 2>/dev/null || echo "No se encontraron secrets hardcodeados"
grep -r "jwt.*=" backend/src/ 2>/dev/null || echo "No se encontraron JWT secrets hardcodeados"

echo -e "\n4. Analizando configuración de seguridad..."
echo "Verificando variables de entorno..."
if [ -f backend/.env ]; then
    echo "❌ Archivo .env encontrado (no debería estar en repositorio)"
    echo "Contenido (censurado):"
    sed 's/=.*/=***CENSURADO***/' backend/.env
else
    echo "✓ No se encontró archivo .env en repositorio"
fi

echo -e "\n=== Testing de Caja Blanca Completado ==="
