#!/bin/bash

echo "=== GUÍA PARA OBTENER CAPTURAS ESPECÍFICAS ==="
echo "Proyecto: ZeroSmoke"
echo "Materia: Seguridad Informática"
echo ""

# Detectar comando curl apropiado para Windows
if command -v curl.exe &> /dev/null; then
    CURL_CMD="curl.exe"
    echo "✓ Entorno Windows detectado"
elif command -v curl &> /dev/null; then
    CURL_CMD="curl"
    echo "✓ Entorno Unix/Linux detectado"
else
    echo "❌ curl no encontrado"
    exit 1
fi

# Función para pausar y esperar confirmación
wait_for_confirmation() {
    echo ""
    echo "📸 Presiona ENTER cuando hayas tomado la captura..."
    read
}

echo ""
echo "🎯 PREPARACIÓN INICIAL"
echo "1. Asegúrate de que ZeroSmoke esté corriendo:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend: http://localhost:5000"
echo ""

# Verificar servicios
if $CURL_CMD -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Frontend disponible"
else
    echo "❌ Frontend NO disponible - Inicia el frontend primero"
    echo "   Ejecuta: cd frontend && npm start"
    exit 1
fi

if $CURL_CMD -f http://localhost:5000 >/dev/null 2>&1; then
    echo "✅ Backend disponible"
else
    echo "❌ Backend NO disponible - Inicia el backend primero"
    echo "   Ejecuta: cd backend && npm start"
    exit 1
fi

echo ""
echo "🔒 SECCIÓN 2: CAJA NEGRA - CAPTURAS REQUERIDAS"
echo ""

echo "📸 CAPTURA 1: Login con SQL Injection"
echo "Pasos:"
echo "1. Abre http://localhost:3000/login en tu navegador"
echo "2. En el campo Email, escribe: ' OR '1'='1' --"
echo "3. En el campo Password, escribe: cualquier_cosa"
echo "4. Haz clic en 'Iniciar Sesión'"
echo "5. Toma captura mostrando:"
echo "   - El formulario con los valores maliciosos"
echo "   - El mensaje de error"
echo "   - La URL en la barra de direcciones"
echo ""
wait_for_confirmation

echo "📸 CAPTURA 2: Testing con Postman - SQL Injection"
echo "Pasos:"
echo "1. Abre Postman"
echo "2. Crea un nuevo request POST"
echo "3. URL: http://localhost:5000/api/auth/login"
echo "4. Headers: Content-Type: application/json"
echo "5. Body (raw JSON):"
echo '   {"email":"'\'' OR '\''1'\''='\''1'\'' --","password":"test"}'
echo "6. Envía el request"
echo "7. Toma captura mostrando el request completo y la respuesta"
echo ""

# Ejecutar el request automáticamente para mostrar resultado
echo "Ejecutando request automáticamente para referencia:"
$CURL_CMD -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"'\'' OR '\''1'\''='\''1'\'' --","password":"test"}' \
  -w "\nStatus Code: %{http_code}\n"

wait_for_confirmation

echo ""
echo "🔍 SECCIÓN 3: CAJA BLANCA - CAPTURAS REQUERIDAS"
echo ""

echo "📸 CAPTURA 3: Código con Vulnerabilidades"
echo "Pasos:"
echo "1. Abre el archivo: backend/src/controllers/auth.controller.ts"
echo "2. Busca la línea con JWT secret:"
echo '   const jwtSecret: string = process.env.JWT_SECRET || "your_jwt_secret"'
echo "3. También busca mensajes de error que revelan información:"
echo '   res.status(401).json({ message: "Usuario no encontrado" })'
echo "4. Toma captura del código mostrando estas vulnerabilidades"
echo ""
wait_for_confirmation

echo "📸 CAPTURA 4: npm audit - Vulnerabilidades de Dependencias"
echo "Pasos:"
echo "1. Abre terminal en el directorio backend"
echo "2. Ejecuta: npm audit"
echo "3. Toma captura de la salida completa"
echo ""

echo "Ejecutando npm audit automáticamente:"
cd ../backend 2>/dev/null || cd ../../backend 2>/dev/null || echo "❌ No se encontró directorio backend"

if [ -f package.json ]; then
    npm audit
else
    echo "❌ No se encontró package.json"
fi

wait_for_confirmation

echo ""
echo "⚖️ SECCIÓN 4: CAJA GRIS - CAPTURAS REQUERIDAS"
echo ""

echo "📸 CAPTURA 5: Usuario Normal Accediendo a Endpoint Admin"
echo "Pasos:"
echo "1. Abre Postman"
echo "2. Primero, haz login como usuario normal:"
echo "   POST http://localhost:5000/api/auth/login"
echo '   Body: {"email":"testuser@example.com","password":"password123"}'
echo "3. Copia el token JWT de la respuesta"
echo "4. Crea nuevo request GET:"
echo "   URL: http://localhost:5000/api/admin/users"
echo "   Header: Authorization: Bearer [TOKEN_COPIADO]"
echo "5. Envía el request"
echo "6. Toma captura mostrando:"
echo "   - El request con el token"
echo "   - La respuesta (debería ser 403, si es 200 es vulnerabilidad)"
echo ""

# Intentar obtener token automáticamente
echo "Intentando obtener token automáticamente..."
TOKEN_RESPONSE=$($CURL_CMD -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"password123"}' \
  -s)

echo "Respuesta del login:"
echo $TOKEN_RESPONSE

# Extraer token si existe
TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$TOKEN" ]; then
    echo ""
    echo "Token obtenido: ${TOKEN:0:50}..."
    echo ""
    echo "Probando acceso a endpoint admin:"
    $CURL_CMD -X GET http://localhost:5000/api/admin/users \
      -H "Authorization: Bearer $TOKEN" \
      -w "\nStatus Code: %{http_code}\n"
else
    echo "❌ No se pudo obtener token. Puede que necesites crear el usuario primero."
    echo "Intenta registrar el usuario:"
    $CURL_CMD -X POST http://localhost:5000/api/auth/register \
      -H "Content-Type: application/json" \
      -d '{"name":"Test User","email":"testuser@example.com","password":"password123"}'
fi

wait_for_confirmation

echo "📸 CAPTURA 6: Manipulación de Datos de Otro Usuario"
echo "Pasos:"
echo "1. Con el mismo token de usuario normal, intenta:"
echo "   GET http://localhost:5000/api/users/123/progress"
echo "   (donde 123 es ID de otro usuario)"
echo "2. O intenta modificar datos:"
echo "   PUT http://localhost:5000/api/users/123/progress"
echo '   Body: {"smokingDays": 0, "lastCigarette": "2024-01-01"}'
echo "3. Toma captura mostrando:"
echo "   - Request intentando acceder a datos ajenos"
echo "   - Respuesta del servidor"
echo "   - Evidencia de si la vulnerabilidad existe"
echo ""

if [ ! -z "$TOKEN" ]; then
    echo "Probando acceso a datos de otro usuario:"
    $CURL_CMD -X GET http://localhost:5000/api/users/123/progress \
      -H "Authorization: Bearer $TOKEN" \
      -w "\nStatus Code: %{http_code}\n"
fi

wait_for_confirmation

echo ""
echo "✅ GUÍA DE CAPTURAS COMPLETADA"
echo ""
echo "📋 RESUMEN DE CAPTURAS OBTENIDAS:"
echo "1. ✅ Login con SQL injection (Caja Negra)"
echo "2. ✅ Postman con parámetros maliciosos (Caja Negra)"
echo "3. ✅ Código con vulnerabilidades (Caja Blanca)"
echo "4. ✅ npm audit con dependencias (Caja Blanca)"
echo "5. ✅ Usuario normal en endpoint admin (Caja Gris)"
echo "6. ✅ Manipulación de datos ajenos (Caja Gris)"
echo ""
echo "📍 UBICACIONES EN EL DOCUMENTO:"
echo "- Capturas 1-2: Sección 2, después de 'Hallazgos Típicos en ZeroSmoke'"
echo "- Capturas 3-4: Sección 3, después de 'Ejemplos hallados en ZeroSmoke'"
echo "- Capturas 5-6: Sección 4, después de 'Vulnerabilidades encontradas en ZeroSmoke'"
echo ""
echo "🎯 PRÓXIMOS PASOS:"
echo "1. Organiza las capturas en la carpeta evidence/"
echo "2. Inserta las capturas en el documento según las ubicaciones indicadas"
echo "3. Documenta los hallazgos usando las plantillas en reports/"
echo "4. Crea el reporte final consolidado"
echo ""
echo "¡Testing de seguridad completado exitosamente!"
