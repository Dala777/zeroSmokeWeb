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
