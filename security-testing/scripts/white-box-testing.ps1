Write-Host "=== TESTING DE CAJA BLANCA - ZeroSmoke ===" -ForegroundColor Green

$reportPath = ".\reports\white-box-results.txt"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

"=== Testing de Caja Blanca - ZeroSmoke ===" | Out-File -FilePath $reportPath -Encoding UTF8
"Fecha: $timestamp" | Out-File -FilePath $reportPath -Append -Encoding UTF8
"" | Out-File -FilePath $reportPath -Append -Encoding UTF8

Write-Host "1. Analizando dependencias del backend..." -ForegroundColor Yellow
"1. AnÃ¡lisis de dependencias - Backend" | Out-File -FilePath $reportPath -Append -Encoding UTF8

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
    "No se encontrÃ³ package.json en backend" | Out-File -FilePath $reportPath -Append -Encoding UTF8
    Write-Host "No se encontrÃ³ package.json en backend" -ForegroundColor Red
}

Write-Host "2. Analizando dependencias del frontend..." -ForegroundColor Yellow
"2. AnÃ¡lisis de dependencias - Frontend" | Out-File -FilePath $reportPath -Append -Encoding UTF8

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
    "No se encontrÃ³ package.json en frontend" | Out-File -FilePath $reportPath -Append -Encoding UTF8
    Write-Host "No se encontrÃ³ package.json en frontend" -ForegroundColor Red
}

Write-Host "=== Testing de Caja Blanca Completado ===" -ForegroundColor Green
Write-Host "Resultados guardados en: $reportPath" -ForegroundColor Cyan
