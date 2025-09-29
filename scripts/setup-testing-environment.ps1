# Script de configuración del entorno de testing de seguridad
# Para el proyecto ZeroSmoke - Versión PowerShell

Write-Host "=== Configurando Entorno de Testing de Seguridad ===" -ForegroundColor Green
Write-Host "Proyecto: ZeroSmoke"
Write-Host "Fecha: $(Get-Date)"
Write-Host ""

# Ir al directorio raíz del proyecto (un nivel arriba de scripts)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

# Crear estructura de directorios
Write-Host "Creando estructura de directorios..." -ForegroundColor Yellow
$securityTestingPath = Join-Path $projectRoot "security-testing"

if (!(Test-Path $securityTestingPath)) {
    New-Item -ItemType Directory -Path $securityTestingPath -Force | Out-Null
}

$subDirs = @("reports", "tools", "evidence", "scripts")
foreach ($dir in $subDirs) {
    $dirPath = Join-Path $securityTestingPath $dir
    if (!(Test-Path $dirPath)) {
        New-Item -ItemType Directory -Path $dirPath -Force | Out-Null
    }
}

Write-Host "Directorios creados en: $securityTestingPath" -ForegroundColor Green

# Verificar herramientas necesarias
Write-Host "=== Verificando herramientas necesarias ===" -ForegroundColor Yellow

# Verificar curl
$curlAvailable = $false
try {
    $curlVersion = & curl.exe --version 2>$null
    if ($curlVersion) {
        Write-Host "curl disponible" -ForegroundColor Green
        $curlAvailable = $true
    }
} catch {
    Write-Host "curl no encontrado" -ForegroundColor Red
}

# Verificar Node.js
$nodeAvailable = $false
try {
    $nodeVersion = & node --version 2>$null
    if ($nodeVersion) {
        Write-Host "Node.js disponible: $nodeVersion" -ForegroundColor Green
        $nodeAvailable = $true
    }
} catch {
    Write-Host "Node.js no encontrado" -ForegroundColor Red
}

# Crear scripts de testing en PowerShell
Write-Host "=== Creando scripts de testing ===" -ForegroundColor Yellow

# Script para verificar servicios
$checkServicesScript = @'
Write-Host "=== Verificando Servicios ZeroSmoke ===" -ForegroundColor Green

$frontendUrl = "http://localhost:3000"
$backendUrl = "http://localhost:5000"

Write-Host "Verificando Frontend en $frontendUrl..."
try {
    $frontendResponse = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 5 -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "Frontend disponible (Status: $($frontendResponse.StatusCode))" -ForegroundColor Green
    }
} catch {
    Write-Host "Frontend NO disponible en puerto 3000" -ForegroundColor Red
    Write-Host "Ejecuta en otra terminal: cd frontend; npm start" -ForegroundColor Yellow
}

Write-Host "Verificando Backend en $backendUrl..."
try {
    $backendResponse = Invoke-WebRequest -Uri "$backendUrl/api/health" -Method GET -TimeoutSec 5 -UseBasicParsing
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "Backend disponible (Status: $($backendResponse.StatusCode))" -ForegroundColor Green
    }
} catch {
    Write-Host "Backend NO disponible en puerto 5000" -ForegroundColor Red
    Write-Host "Ejecuta en otra terminal: cd backend; npm start" -ForegroundColor Yellow
}
'@

$checkServicesScript | Out-File -FilePath (Join-Path $securityTestingPath "scripts\check-services.ps1") -Encoding UTF8

# Script para testing de caja negra
$blackBoxScript = @'
Write-Host "=== TESTING DE CAJA NEGRA - ZeroSmoke ===" -ForegroundColor Green

$reportPath = ".\reports\black-box-results.txt"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

"=== Testing de Caja Negra - ZeroSmoke ===" | Out-File -FilePath $reportPath -Encoding UTF8
"Fecha: $timestamp" | Out-File -FilePath $reportPath -Append -Encoding UTF8
"" | Out-File -FilePath $reportPath -Append -Encoding UTF8

Write-Host "1. Testing SQL Injection en login..." -ForegroundColor Yellow
"1. Testing SQL Injection en login..." | Out-File -FilePath $reportPath -Append -Encoding UTF8

$sqlInjectionPayload = @{
    email = "' OR '1'='1' --"
    password = "test"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $sqlInjectionPayload -ContentType "application/json" -UseBasicParsing
    "Response Status: $($response.StatusCode)" | Out-File -FilePath $reportPath -Append -Encoding UTF8
    "Response Body: $($response.Content)" | Out-File -FilePath $reportPath -Append -Encoding UTF8
    Write-Host "SQL Injection test completado (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    $errorMsg = "Error: $($_.Exception.Message)"
    $errorMsg | Out-File -FilePath $reportPath -Append -Encoding UTF8
    Write-Host "Error en SQL Injection test: $($_.Exception.Message)" -ForegroundColor Red
}

"" | Out-File -FilePath $reportPath -Append -Encoding UTF8

Write-Host "2. Testing acceso directo a endpoints protegidos..." -ForegroundColor Yellow
"2. Testing acceso directo a endpoints protegidos..." | Out-File -FilePath $reportPath -Append -Encoding UTF8

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/admin/users" -Method GET -UseBasicParsing
    "Admin endpoint Status: $($response.StatusCode)" | Out-File -FilePath $reportPath -Append -Encoding UTF8
    Write-Host "Admin endpoint test completado (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    $errorMsg = "Admin endpoint Error: $($_.Exception.Message)"
    $errorMsg | Out-File -FilePath $reportPath -Append -Encoding UTF8
    Write-Host "Admin endpoint protegido correctamente" -ForegroundColor Green
}

Write-Host "=== Testing de Caja Negra Completado ===" -ForegroundColor Green
Write-Host "Resultados guardados en: $reportPath" -ForegroundColor Cyan
'@

$blackBoxScript | Out-File -FilePath (Join-Path $securityTestingPath "scripts\black-box-testing.ps1") -Encoding UTF8

# Script para testing de caja blanca
$whiteBoxScript = @'
Write-Host "=== TESTING DE CAJA BLANCA - ZeroSmoke ===" -ForegroundColor Green

$reportPath = ".\reports\white-box-results.txt"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

"=== Testing de Caja Blanca - ZeroSmoke ===" | Out-File -FilePath $reportPath -Encoding UTF8
"Fecha: $timestamp" | Out-File -FilePath $reportPath -Append -Encoding UTF8
"" | Out-File -FilePath $reportPath -Append -Encoding UTF8

Write-Host "1. Analizando dependencias del backend..." -ForegroundColor Yellow
"1. Análisis de dependencias - Backend" | Out-File -FilePath $reportPath -Append -Encoding UTF8

if (Test-Path "..\backend\package.json") {
    Set-Location "..\backend"
    Write-Host "Ejecutando npm audit en backend..." -ForegroundColor Yellow
    try {
        $auditResult = & npm audit 2>&1
        $auditResult | Out-File -FilePath "..\security-testing\reports\npm-audit-backend.txt" -Encoding UTF8
        "npm audit ejecutado - ver npm-audit-backend.txt" | Out-File -FilePath "..\security-testing\reports\white-box-results.txt" -Append -Encoding UTF8
        Write-Host "npm audit completado para backend" -ForegroundColor Green
    } catch {
        "Error ejecutando npm audit: $($_.Exception.Message)" | Out-File -FilePath "..\security-testing\reports\white-box-results.txt" -Append -Encoding UTF8
    }
    Set-Location "..\security-testing"
} else {
    "No se encontró package.json en backend" | Out-File -FilePath $reportPath -Append -Encoding UTF8
    Write-Host "No se encontró package.json en backend" -ForegroundColor Red
}

Write-Host "2. Analizando dependencias del frontend..." -ForegroundColor Yellow
"2. Análisis de dependencias - Frontend" | Out-File -FilePath $reportPath -Append -Encoding UTF8

if (Test-Path "..\frontend\package.json") {
    Set-Location "..\frontend"
    Write-Host "Ejecutando npm audit en frontend..." -ForegroundColor Yellow
    try {
        $auditResult = & npm audit 2>&1
        $auditResult | Out-File -FilePath "..\security-testing\reports\npm-audit-frontend.txt" -Encoding UTF8
        "npm audit ejecutado - ver npm-audit-frontend.txt" | Out-File -FilePath "..\security-testing\reports\white-box-results.txt" -Append -Encoding UTF8
        Write-Host "npm audit completado para frontend" -ForegroundColor Green
    } catch {
        "Error ejecutando npm audit: $($_.Exception.Message)" | Out-File -FilePath "..\security-testing\reports\white-box-results.txt" -Append -Encoding UTF8
    }
    Set-Location "..\security-testing"
} else {
    "No se encontró package.json en frontend" | Out-File -FilePath $reportPath -Append -Encoding UTF8
    Write-Host "No se encontró package.json en frontend" -ForegroundColor Red
}

Write-Host "=== Testing de Caja Blanca Completado ===" -ForegroundColor Green
Write-Host "Resultados guardados en: $reportPath" -ForegroundColor Cyan
'@

$whiteBoxScript | Out-File -FilePath (Join-Path $securityTestingPath "scripts\white-box-testing.ps1") -Encoding UTF8

# Script para testing de caja gris
$grayBoxScript = @'
Write-Host "=== TESTING DE CAJA GRIS - ZeroSmoke ===" -ForegroundColor Green

$reportPath = ".\reports\gray-box-results.txt"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

"=== Testing de Caja Gris - ZeroSmoke ===" | Out-File -FilePath $reportPath -Encoding UTF8
"Fecha: $timestamp" | Out-File -FilePath $reportPath -Append -Encoding UTF8
"" | Out-File -FilePath $reportPath -Append -Encoding UTF8

Write-Host "1. Obteniendo token de usuario normal..." -ForegroundColor Yellow
"1. Obteniendo token de usuario normal..." | Out-File -FilePath $reportPath -Append -Encoding UTF8

$registerPayload = @{
    name = "Test User"
    email = "testuser@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $registerPayload -ContentType "application/json" -UseBasicParsing
    "Usuario creado - Status: $($registerResponse.StatusCode)" | Out-File -FilePath $reportPath -Append -Encoding UTF8
} catch {
    "Usuario ya existe o error: $($_.Exception.Message)" | Out-File -FilePath $reportPath -Append -Encoding UTF8
}

$loginPayload = @{
    email = "testuser@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginPayload -ContentType "application/json" -UseBasicParsing
    $loginData = $loginResponse.Content | ConvertFrom-Json
    
    if ($loginData.token) {
        $token = $loginData.token
        "Token obtenido exitosamente" | Out-File -FilePath $reportPath -Append -Encoding UTF8
        Write-Host "Token obtenido exitosamente" -ForegroundColor Green
        
        Write-Host "2. Testing escalación de privilegios..." -ForegroundColor Yellow
        "2. Testing escalación de privilegios..." | Out-File -FilePath $reportPath -Append -Encoding UTF8
        
        try {
            $headers = @{ Authorization = "Bearer $token" }
            $adminResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/admin/users" -Method GET -Headers $headers -UseBasicParsing
            "VULNERABILIDAD: Usuario normal accedió a endpoint admin (Status: $($adminResponse.StatusCode))" | Out-File -FilePath $reportPath -Append -Encoding UTF8
            Write-Host "VULNERABILIDAD ENCONTRADA: Escalación de privilegios" -ForegroundColor Red
        } catch {
            "Endpoint admin protegido correctamente" | Out-File -FilePath $reportPath -Append -Encoding UTF8
            Write-Host "Endpoint admin protegido correctamente" -ForegroundColor Green
        }
        
    } else {
        "No se pudo obtener token del login" | Out-File -FilePath $reportPath -Append -Encoding UTF8
        Write-Host "No se pudo obtener token" -ForegroundColor Red
    }
} catch {
    "Error en login: $($_.Exception.Message)" | Out-File -FilePath $reportPath -Append -Encoding UTF8
    Write-Host "Error en login: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=== Testing de Caja Gris Completado ===" -ForegroundColor Green
Write-Host "Resultados guardados en: $reportPath" -ForegroundColor Cyan
'@

$grayBoxScript | Out-File -FilePath (Join-Path $securityTestingPath "scripts\gray-box-testing.ps1") -Encoding UTF8

# Script maestro para ejecutar todos los tests
$runAllScript = @'
Write-Host "=== EJECUTANDO TODOS LOS TESTS DE SEGURIDAD ===" -ForegroundColor Green
Write-Host "Proyecto: ZeroSmoke"
Write-Host "Fecha: $(Get-Date)"
Write-Host ""

Write-Host "Verificando servicios..." -ForegroundColor Yellow
& ".\scripts\check-services.ps1"

Write-Host ""
Write-Host "1. Ejecutando Testing de Caja Negra..." -ForegroundColor Yellow
& ".\scripts\black-box-testing.ps1"

Write-Host ""
Write-Host "2. Ejecutando Testing de Caja Blanca..." -ForegroundColor Yellow
& ".\scripts\white-box-testing.ps1"

Write-Host ""
Write-Host "3. Ejecutando Testing de Caja Gris..." -ForegroundColor Yellow
& ".\scripts\gray-box-testing.ps1"

Write-Host ""
Write-Host "=== TODOS LOS TESTS COMPLETADOS ===" -ForegroundColor Green
Write-Host "Revisa los archivos en la carpeta reports para ver los resultados:" -ForegroundColor Cyan
Write-Host "- reports\black-box-results.txt" -ForegroundColor White
Write-Host "- reports\white-box-results.txt" -ForegroundColor White
Write-Host "- reports\gray-box-results.txt" -ForegroundColor White
Write-Host "- reports\npm-audit-backend.txt" -ForegroundColor White
Write-Host "- reports\npm-audit-frontend.txt" -ForegroundColor White
'@

$runAllScript | Out-File -FilePath (Join-Path $securityTestingPath "run-all-tests.ps1") -Encoding UTF8

# Crear guía de capturas manual
$captureGuideScript = @'
Write-Host "=== GUÍA PARA CAPTURAS MANUALES ===" -ForegroundColor Green
Write-Host "Las capturas son SCREENSHOTS que debes tomar manualmente" -ForegroundColor Yellow
Write-Host ""

function Wait-ForScreenshot {
    param([string]$description)
    Write-Host ""
    Write-Host "📸 CAPTURA REQUERIDA: $description" -ForegroundColor Yellow
    Write-Host "Presiona ENTER cuando hayas tomado la captura..." -ForegroundColor Cyan
    Read-Host
}

Write-Host "🎯 PREPARACIÓN" -ForegroundColor Cyan
Write-Host "1. Asegúrate de que ZeroSmoke esté corriendo:"
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   Backend: http://localhost:5000"
Write-Host ""

Write-Host "📸 CAPTURA 1: SQL Injection en Login" -ForegroundColor Yellow
Write-Host "1. Abre http://localhost:3000/login"
Write-Host "2. Email: ' OR '1'='1' --"
Write-Host "3. Password: cualquier_cosa"
Write-Host "4. Haz clic en Iniciar Sesión"
Write-Host "5. Toma screenshot del formulario y resultado"
Wait-ForScreenshot "SQL Injection en formulario de login"

Write-Host "📸 CAPTURA 2: Postman SQL Injection" -ForegroundColor Yellow
Write-Host "1. Abre Postman"
Write-Host "2. POST http://localhost:5000/api/auth/login"
Write-Host "3. Body: {`"email`":`"' OR '1'='1' --`",`"password`":`"test`"}"
Write-Host "4. Envía y toma screenshot"
Wait-ForScreenshot "Request SQL Injection en Postman"

Write-Host "📸 CAPTURA 3: Código con Vulnerabilidades" -ForegroundColor Yellow
Write-Host "1. Abre backend/src/controllers/auth.controller.ts"
Write-Host "2. Busca líneas con secrets hardcodeados"
Write-Host "3. Toma screenshot del código vulnerable"
Wait-ForScreenshot "Código fuente con vulnerabilidades"

Write-Host "📸 CAPTURA 4: npm audit" -ForegroundColor Yellow
Write-Host "1. Abre terminal en backend/"
Write-Host "2. Ejecuta: npm audit"
Write-Host "3. Toma screenshot de las vulnerabilidades"
Wait-ForScreenshot "Resultado de npm audit"

Write-Host "📸 CAPTURA 5: Acceso no autorizado" -ForegroundColor Yellow
Write-Host "1. En Postman, usa token de usuario normal"
Write-Host "2. GET http://localhost:5000/api/admin/users"
Write-Host "3. Toma screenshot del resultado"
Wait-ForScreenshot "Intento de acceso no autorizado"

Write-Host ""
Write-Host "✅ CAPTURAS COMPLETADAS" -ForegroundColor Green
Write-Host "Guarda todas las imágenes en: .\evidence\" -ForegroundColor Cyan
Write-Host "Nombres sugeridos:" -ForegroundColor Yellow
Write-Host "- captura-1-sql-injection-login.png"
Write-Host "- captura-2-postman-sql-injection.png"
Write-Host "- captura-3-codigo-vulnerabilidades.png"
Write-Host "- captura-4-npm-audit.png"
Write-Host "- captura-5-acceso-no-autorizado.png"
'@

$captureGuideScript | Out-File -FilePath (Join-Path $securityTestingPath "capture-guide.ps1") -Encoding UTF8

# Crear archivo de configuración
$configContent = @"
# Configuración del Entorno de Testing - ZeroSmoke

TARGET_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000/api

TEST_EMAIL=testuser@example.com
TEST_PASSWORD=password123
ADMIN_EMAIL=admin@zerosmoke.com

PROJECT_DIR=../
REPORTS_DIR=./reports
EVIDENCE_DIR=./evidence
TOOLS_DIR=./tools
"@

$configContent | Out-File -FilePath (Join-Path $securityTestingPath "config.txt") -Encoding UTF8

Write-Host "Scripts de PowerShell creados" -ForegroundColor Green

Write-Host ""
Write-Host "=== Entorno de Testing Configurado ===" -ForegroundColor Green
Write-Host "Estructura creada en: $securityTestingPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Scripts disponibles:" -ForegroundColor Yellow
Write-Host "- run-all-tests.ps1 (Ejecutar todos los tests)"
Write-Host "- capture-guide.ps1 (Guía para capturas manuales)"
Write-Host "- scripts\check-services.ps1 (Verificar servicios)"
Write-Host "- scripts\black-box-testing.ps1 (Solo caja negra)"
Write-Host "- scripts\white-box-testing.ps1 (Solo caja blanca)"
Write-Host "- scripts\gray-box-testing.ps1 (Solo caja gris)"
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. IMPORTANTE: Inicia el backend: cd backend && npm start"
Write-Host "2. Ejecuta: cd security-testing"
Write-Host "3. Ejecuta: .\run-all-tests.ps1"
Write-Host "4. Para capturas: .\capture-guide.ps1"
Write-Host "5. Revisa resultados en reports\"
Write-Host ""
Write-Host "Entorno PowerShell listo para testing!" -ForegroundColor Green
