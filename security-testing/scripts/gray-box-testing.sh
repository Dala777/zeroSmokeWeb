#!/bin/bash
echo "=== TESTING DE CAJA GRIS - ZeroSmoke ==="

# Detectar comando curl apropiado
if command -v curl.exe &> /dev/null; then
    CURL_CMD="curl.exe"
else
    CURL_CMD="curl"
fi

echo "1. Obteniendo token de usuario normal..."
TOKEN_RESPONSE=$($CURL_CMD -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"password123"}' \
  -s)

# Intentar extraer token (funciona en bash/git bash)
TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ No se pudo obtener token. Respuesta del servidor:"
    echo $TOKEN_RESPONSE
    echo "Creando usuario de prueba..."
    $CURL_CMD -X POST http://localhost:5000/api/auth/register \
      -H "Content-Type: application/json" \
      -d '{"name":"Test User","email":"testuser@example.com","password":"password123"}' \
      -s
    
    # Intentar obtener token nuevamente
    TOKEN_RESPONSE=$($CURL_CMD -X POST http://localhost:5000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"testuser@example.com","password":"password123"}' \
      -s)
    TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4 2>/dev/null)
fi

if [ ! -z "$TOKEN" ]; then
    echo "✓ Token obtenido: ${TOKEN:0:20}..."
    
    echo -e "\n2. Testing escalación de privilegios..."
    echo "Request: GET /api/admin/users (con token de usuario normal)"
    $CURL_CMD -X GET http://localhost:5000/api/admin/users \
      -H "Authorization: Bearer $TOKEN" \
      -w "\nStatus: %{http_code}\n" \
      -s
    
    echo -e "\n3. Testing manipulación de datos de otros usuarios..."
    echo "Request: GET /api/users/123/progress (intentando acceder a datos ajenos)"
    $CURL_CMD -X GET http://localhost:5000/api/users/123/progress \
      -H "Authorization: Bearer $TOKEN" \
      -w "\nStatus: %{http_code}\n" \
      -s
    
    echo -e "\n4. Testing bypass de autorización en endpoints..."
    echo "Request: PUT /api/admin/users/123 (intentando modificar usuarios)"
    $CURL_CMD -X PUT http://localhost:5000/api/admin/users/123 \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"role":"admin"}' \
      -w "\nStatus: %{http_code}\n" \
      -s
else
    echo "❌ No se pudo obtener token para testing"
fi

echo -e "\n=== Testing de Caja Gris Completado ==="
