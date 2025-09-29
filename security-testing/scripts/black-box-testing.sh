#!/bin/bash
echo "=== TESTING DE CAJA NEGRA - ZeroSmoke ==="

# Detectar comando curl apropiado
if command -v curl.exe &> /dev/null; then
    CURL_CMD="curl.exe"
else
    CURL_CMD="curl"
fi

# Verificar que la aplicación esté corriendo
echo "1. Verificando servicios..."
$CURL_CMD -f http://localhost:3000 >/dev/null 2>&1 || echo "❌ Frontend no disponible en puerto 3000"
$CURL_CMD -f http://localhost:5000/api/health >/dev/null 2>&1 || echo "❌ Backend no disponible en puerto 5000"

echo "2. Testing SQL Injection en login..."
echo "Request: POST /api/auth/login"
$CURL_CMD -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"'\'' OR '\''1'\''='\''1'\'' --","password":"test"}' \
  -w "\nStatus: %{http_code}\n" \
  -s

echo -e "\n3. Testing acceso directo a endpoints protegidos..."
echo "Request: GET /api/admin/users (sin autenticación)"
$CURL_CMD -X GET http://localhost:5000/api/admin/users \
  -w "\nStatus: %{http_code}\n" \
  -s

echo -e "\n4. Testing XSS en formularios..."
echo "Request: POST /api/contact (con payload XSS)"
$CURL_CMD -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(\"XSS\")</script>","email":"test@test.com","message":"test"}' \
  -w "\nStatus: %{http_code}\n" \
  -s

echo -e "\n=== Testing de Caja Negra Completado ==="
