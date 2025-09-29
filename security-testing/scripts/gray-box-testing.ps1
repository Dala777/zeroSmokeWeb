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
        
        Write-Host "2. Testing escalaciÃ³n de privilegios..." -ForegroundColor Yellow
        "2. Testing escalaciÃ³n de privilegios..." | Out-File -FilePath $reportPath -Append -Encoding UTF8
        
        try {
            $headers = @{ Authorization = "Bearer $token" }
            $adminResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/admin/users" -Method GET -Headers $headers -UseBasicParsing
            "VULNERABILIDAD: Usuario normal accediÃ³ a endpoint admin (Status: $($adminResponse.StatusCode))" | Out-File -FilePath $reportPath -Append -Encoding UTF8
            Write-Host "VULNERABILIDAD ENCONTRADA: EscalaciÃ³n de privilegios" -ForegroundColor Red
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
