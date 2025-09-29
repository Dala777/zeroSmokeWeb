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
