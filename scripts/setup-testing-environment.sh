#!/bin/bash

# Script de configuración del entorno de testing de seguridad
# Para el proyecto ZeroSmoke

echo "=== Configurando Entorno de Testing de Seguridad ==="
echo "Proyecto: ZeroSmoke"
echo "Fecha: $(date)"
echo ""

# Ir al directorio raíz del proyecto (un nivel arriba de scripts)
cd "$(dirname "$0")/.."

# Crear estructura de directorios
echo "Creando estructura de directorios..."
mkdir -p security-testing/{reports,tools,evidence,scripts}

echo "✓ Directorios creados en: $(pwd)/security-testing"

# Configurar herramientas para caja negra
echo "=== Configurando herramientas de Caja Negra ==="

# Verificar herramientas necesarias
echo "Verificando herramientas necesarias..."

# Verificar curl
if command -v curl &> /dev/null; then
    echo "✓ curl disponible"
else
    echo "❌ curl no encontrado - instalar manualmente"
fi

# Verificar si estamos en Windows (PowerShell)
if command -v powershell.exe &> /dev/null || [[ "$OS" == "Windows_NT" ]]; then
    echo "✓ Entorno Windows detectado"
    CURL_CMD="curl.exe"
else
    CURL_CMD="curl"
fi

# Crear scripts de testing
echo "=== Creando scripts de testing ==="

# Script para reconocimiento básico
cat > security-testing/scripts/reconnaissance.sh << 'EOF'
#!/bin/bash
TARGET_URL="http://localhost:3000"
REPORT_DIR="../reports"

echo "=== Reconocimiento de $TARGET_URL ==="
echo "Fecha: $(date)" > $REPORT_DIR/reconnaissance.txt

# Verificar si la aplicación está corriendo
echo "Verificando disponibilidad..." | tee -a $REPORT_DIR/reconnaissance.txt

# Usar curl apropiado para el sistema
if command -v curl.exe &> /dev/null; then
    CURL_CMD="curl.exe"
else
    CURL_CMD="curl"
fi

$CURL_CMD -s -o /dev/null -w "HTTP Status: %{http_code}\n" $TARGET_URL | tee -a $REPORT_DIR/reconnaissance.txt

# Obtener headers
echo -e "\n=== Headers del servidor ===" | tee -a $REPORT_DIR/reconnaissance.txt
$CURL_CMD -I $TARGET_URL 2>/dev/null | tee -a $REPORT_DIR/reconnaissance.txt

# Verificar robots.txt
echo -e "\n=== Verificando robots.txt ===" | tee -a $REPORT_DIR/reconnaissance.txt
$CURL_CMD -s $TARGET_URL/robots.txt | tee -a $REPORT_DIR/reconnaissance.txt

# Verificar sitemap.xml
echo -e "\n=== Verificando sitemap.xml ===" | tee -a $REPORT_DIR/reconnaissance.txt
$CURL_CMD -s $TARGET_URL/sitemap.xml | tee -a $REPORT_DIR/reconnaissance.txt

echo "Reconocimiento completado. Ver: $REPORT_DIR/reconnaissance.txt"
EOF

chmod +x security-testing/scripts/reconnaissance.sh

# Script para testing de formularios
cat > security-testing/scripts/form-testing.sh << 'EOF'
#!/bin/bash
TARGET_URL="http://localhost:3000"
API_URL="http://localhost:5000"
REPORT_DIR="../reports"

echo "=== Testing de Formularios ==="
echo "Fecha: $(date)" > $REPORT_DIR/form-testing.txt

# Detectar comando curl apropiado
if command -v curl.exe &> /dev/null; then
    CURL_CMD="curl.exe"
else
    CURL_CMD="curl"
fi

# Testing básico de login
echo "=== Testing de Login ===" | tee -a $REPORT_DIR/form-testing.txt

# Intento de login con credenciales inválidas
echo "Probando credenciales inválidas..." | tee -a $REPORT_DIR/form-testing.txt
$CURL_CMD -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrongpassword"}' \
  -s | tee -a $REPORT_DIR/form-testing.txt

# Testing básico de registro
echo -e "\n=== Testing de Registro ===" | tee -a $REPORT_DIR/form-testing.txt

# Intento de registro con datos de prueba
echo "Probando registro con datos de prueba..." | tee -a $REPORT_DIR/form-testing.txt
$CURL_CMD -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"testuser@example.com","password":"testpass123"}' \
  -s | tee -a $REPORT_DIR/form-testing.txt

echo "Testing de formularios completado. Ver: $REPORT_DIR/form-testing.txt"
EOF

chmod +x security-testing/scripts/form-testing.sh

# Script para análisis de código (caja blanca)
cat > security-testing/scripts/code-analysis.sh << 'EOF'
#!/bin/bash
PROJECT_DIR="../"  # Directorio raíz del proyecto
REPORT_DIR="../reports"

echo "=== Análisis de Código (Caja Blanca) ==="
echo "Fecha: $(date)" > $REPORT_DIR/code-analysis.txt

# Buscar patrones inseguros en el código
echo "=== Buscando patrones inseguros ===" | tee -a $REPORT_DIR/code-analysis.txt

# Buscar console.log (información sensible en logs)
echo -e "\n--- Console.log encontrados ---" | tee -a $REPORT_DIR/code-analysis.txt
find $PROJECT_DIR -name "*.js" -o -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs grep -n "console.log" 2>/dev/null | tee -a $REPORT_DIR/code-analysis.txt

# Buscar TODO/FIXME (posibles problemas pendientes)
echo -e "\n--- TODOs y FIXMEs ---" | tee -a $REPORT_DIR/code-analysis.txt
find $PROJECT_DIR -name "*.js" -o -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs grep -n -i "todo\|fixme" 2>/dev/null | tee -a $REPORT_DIR/code-analysis.txt

# Buscar hardcoded secrets
echo -e "\n--- Posibles secrets hardcodeados ---" | tee -a $REPORT_DIR/code-analysis.txt
find $PROJECT_DIR -name "*.js" -o -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs grep -n -i "password\|secret\|key\|token" 2>/dev/null | grep -v "process.env" | tee -a $REPORT_DIR/code-analysis.txt

# Analizar dependencias
echo -e "\n--- Análisis de dependencias ---" | tee -a $REPORT_DIR/code-analysis.txt
if [ -f "$PROJECT_DIR/backend/package.json" ]; then
    echo "Ejecutando npm audit en backend..." | tee -a $REPORT_DIR/code-analysis.txt
    cd $PROJECT_DIR/backend && npm audit 2>/dev/null | tee -a ../security-testing/reports/code-analysis.txt
fi

if [ -f "$PROJECT_DIR/frontend/package.json" ]; then
    echo "Ejecutando npm audit en frontend..." | tee -a $REPORT_DIR/code-analysis.txt
    cd $PROJECT_DIR/frontend && npm audit 2>/dev/null | tee -a ../security-testing/reports/code-analysis.txt
fi

echo "Análisis de código completado. Ver: $REPORT_DIR/code-analysis.txt"
EOF

chmod +x security-testing/scripts/code-analysis.sh

# Crear plantillas de reportes
echo "=== Creando plantillas de reportes ==="

cat > security-testing/reports/vulnerability-report-template.md << 'EOF'
# Reporte de Vulnerabilidad - ZeroSmoke

## Información General
- **ID**: VULN-ZS-001
- **Fecha**: [FECHA]
- **Tester**: [NOMBRE]
- **Tipo de Testing**: [Caja Negra/Blanca/Gris]

## Vulnerabilidad Encontrada
### Título
[Nombre descriptivo de la vulnerabilidad]

### Descripción
[Descripción detallada de qué es la vulnerabilidad]

### Ubicación
- **URL/Endpoint**: [URL específica]
- **Parámetro afectado**: [Parámetro específico]
- **Método HTTP**: [GET/POST/PUT/DELETE]

### Severidad
- [ ] **Crítica** - Compromete completamente la seguridad
- [ ] **Alta** - Permite acceso no autorizado significativo
- [ ] **Media** - Exposición de información sensible
- [ ] **Baja** - Problema menor de seguridad

### Pasos para Reproducir
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]
4. [Resultado esperado vs obtenido]

### Evidencia
- **Screenshot**: [Nombre del archivo]
- **Request/Response**: 
EOF

cat > security-testing/reports/testing-checklist.md << 'EOF'
# Checklist de Testing de Seguridad - ZeroSmoke

## Testing de Caja Negra ✓

### Reconocimiento
- [ ] Mapeo de aplicación completado
- [ ] Identificación de tecnologías
- [ ] Análisis de robots.txt/sitemap.xml
- [ ] Enumeración de directorios/archivos

### Autenticación y Sesiones
- [ ] Testing de bypass de autenticación
- [ ] Fuerza bruta en login
- [ ] Análisis de cookies de sesión
- [ ] Testing de logout
- [ ] Verificación de timeout de sesión

### Autorización
- [ ] Testing de escalación de privilegios
- [ ] Acceso directo a URLs protegidas
- [ ] Manipulación de parámetros de usuario
- [ ] Testing de control de acceso horizontal

### Validación de Entrada
- [ ] Inyección SQL en todos los formularios
- [ ] XSS reflejado y almacenado
- [ ] Inyección de comandos
- [ ] Path traversal
- [ ] File upload vulnerabilities

### Lógica de Negocio
- [ ] Bypass de validaciones de negocio
- [ ] Race conditions
- [ ] Manipulación de flujos de trabajo
- [ ] Testing de límites y restricciones

## Testing de Caja Blanca ✓

### Análisis de Código
- [ ] Revisión de controladores
- [ ] Análisis de middleware
- [ ] Revisión de modelos de datos
- [ ] Verificación de validaciones

### Configuración
- [ ] Análisis de variables de entorno
- [ ] Configuración de base de datos
- [ ] Configuración de servidor web
- [ ] Certificados y claves

### Dependencias
- [ ] Análisis de vulnerabilidades en dependencias
- [ ] Verificación de versiones actualizadas
- [ ] Análisis de configuración de frameworks

## Testing de Caja Gris ✓

### Acceso Parcial
- [ ] Testing como usuario autenticado
- [ ] Exploración de APIs con documentación parcial
- [ ] Intentos de escalación con conocimiento limitado
- [ ] Análisis híbrido de funcionalidades

### Documentación
- [ ] Todos los hallazgos documentados
- [ ] Evidencia recopilada
- [ ] Recomendaciones proporcionadas
- [ ] Reporte final consolidado

---
*Checklist para el proyecto ZeroSmoke*
*Actualizar estado conforme se completen las pruebas*
EOF

echo "✓ Scripts y plantillas creados"

# Crear scripts específicos para cada tipo de testing
cat > security-testing/scripts/black-box-testing.sh << 'EOF'
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
EOF

cat > security-testing/scripts/white-box-testing.sh << 'EOF'
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
EOF

cat > security-testing/scripts/gray-box-testing.sh << 'EOF'
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
EOF

# Hacer scripts ejecutables
chmod +x security-testing/scripts/*.sh

# Crear archivo de configuración
cat > security-testing/config.txt << 'EOF'
# Configuración del Entorno de Testing

## URLs de Testing
TARGET_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000/api

## Credenciales de Prueba
TEST_EMAIL=testuser@example.com
TEST_PASSWORD=password123
ADMIN_EMAIL=admin@zerosmoke.com

## Directorios
PROJECT_DIR=../
REPORTS_DIR=./reports
EVIDENCE_DIR=./evidence
TOOLS_DIR=./tools

## Configuración de Herramientas
BURP_PROXY=127.0.0.1:8080
ZAP_PROXY=127.0.0.1:8081

## Notas
- Usar solo en entorno de testing
- No usar credenciales reales
- Documentar todos los hallazgos
EOF

echo "✓ Configuración creada"

# Crear script maestro para ejecutar todos los tests
cat > security-testing/run-all-tests.sh << 'EOF'
#!/bin/bash
echo "=== EJECUTANDO TODOS LOS TESTS DE SEGURIDAD ==="
echo "Proyecto: ZeroSmoke"
echo "Fecha: $(date)"
echo ""

# Detectar comando curl apropiado
if command -v curl.exe &> /dev/null; then
    CURL_CMD="curl.exe"
else
    CURL_CMD="curl"
fi

# Verificar que ZeroSmoke esté corriendo
echo "Verificando que ZeroSmoke esté disponible..."
if ! $CURL_CMD -f http://localhost:3000 >/dev/null 2>&1; then
    echo "❌ Frontend no disponible. Asegúrate de que esté corriendo en puerto 3000"
    exit 1
fi

if ! $CURL_CMD -f http://localhost:5000/api/health >/dev/null 2>&1; then
    echo "❌ Backend no disponible. Asegúrate de que esté corriendo en puerto 5000"
    exit 1
fi

echo "✓ ZeroSmoke está disponible"
echo ""

# Ejecutar tests
echo "1. Ejecutando Testing de Caja Negra..."
./scripts/black-box-testing.sh > reports/black-box-results.txt 2>&1
echo "✓ Resultados guardados en reports/black-box-results.txt"

echo ""
echo "2. Ejecutando Testing de Caja Blanca..."
./scripts/white-box-testing.sh > reports/white-box-results.txt 2>&1
echo "✓ Resultados guardados en reports/white-box-results.txt"

echo ""
echo "3. Ejecutando Testing de Caja Gris..."
./scripts/gray-box-testing.sh > reports/gray-box-results.txt 2>&1
echo "✓ Resultados guardados en reports/gray-box-results.txt"

echo ""
echo "=== TODOS LOS TESTS COMPLETADOS ==="
echo "Revisa los archivos en la carpeta 'reports' para ver los resultados"
echo ""
echo "Próximos pasos:"
echo "1. Revisar los resultados en reports/"
echo "2. Tomar capturas de pantalla según la guía"
echo "3. Documentar vulnerabilidades encontradas"
echo "4. Crear reporte final"
EOF

chmod +x security-testing/run-all-tests.sh

echo ""
echo "=== Entorno de Testing Configurado ==="
echo "Estructura creada en: $(pwd)/security-testing/"
echo "security-testing/"
echo "├── reports/          # Reportes de vulnerabilidades"
echo "├── tools/            # Herramientas adicionales"
echo "├── evidence/         # Evidencia (screenshots, logs)"
echo "├── scripts/          # Scripts de automatización"
echo "└── config.txt        # Configuración del entorno"
echo ""
echo "Scripts disponibles:"
echo "├── run-all-tests.sh                   # Ejecutar todos los tests"
echo "├── scripts/black-box-testing.sh       # Solo caja negra"
echo "├── scripts/white-box-testing.sh       # Solo caja blanca"
echo "└── scripts/gray-box-testing.sh        # Solo caja gris"
echo ""
echo "Próximos pasos:"
echo "1. Asegúrate de que ZeroSmoke esté corriendo (frontend y backend)"
echo "2. Ejecuta: cd security-testing && ./run-all-tests.sh"
echo "3. Sigue la guía para las capturas específicas"
echo "4. Documenta hallazgos usando las plantillas en reports/"
echo ""
echo "¡Entorno listo para comenzar el testing!"
