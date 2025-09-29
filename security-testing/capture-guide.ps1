Write-Host "=== GUÃA PARA CAPTURAS MANUALES ===" -ForegroundColor Green
Write-Host "Las capturas son SCREENSHOTS que debes tomar manualmente" -ForegroundColor Yellow
Write-Host ""

function Wait-ForScreenshot {
    param([string]$description)
    Write-Host ""
    Write-Host "ðŸ“¸ CAPTURA REQUERIDA: $description" -ForegroundColor Yellow
    Write-Host "Presiona ENTER cuando hayas tomado la captura..." -ForegroundColor Cyan
    Read-Host
}

Write-Host "ðŸŽ¯ PREPARACIÃ“N" -ForegroundColor Cyan
Write-Host "1. AsegÃºrate de que ZeroSmoke estÃ© corriendo:"
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   Backend: http://localhost:5000"
Write-Host ""

Write-Host "ðŸ“¸ CAPTURA 1: SQL Injection en Login" -ForegroundColor Yellow
Write-Host "1. Abre http://localhost:3000/login"
Write-Host "2. Email: ' OR '1'='1' --"
Write-Host "3. Password: cualquier_cosa"
Write-Host "4. Haz clic en Iniciar SesiÃ³n"
Write-Host "5. Toma screenshot del formulario y resultado"
Wait-ForScreenshot "SQL Injection en formulario de login"

Write-Host "ðŸ“¸ CAPTURA 2: Postman SQL Injection" -ForegroundColor Yellow
Write-Host "1. Abre Postman"
Write-Host "2. POST http://localhost:5000/api/auth/login"
Write-Host "3. Body: {`"email`":`"' OR '1'='1' --`",`"password`":`"test`"}"
Write-Host "4. EnvÃ­a y toma screenshot"
Wait-ForScreenshot "Request SQL Injection en Postman"

Write-Host "ðŸ“¸ CAPTURA 3: CÃ³digo con Vulnerabilidades" -ForegroundColor Yellow
Write-Host "1. Abre backend/src/controllers/auth.controller.ts"
Write-Host "2. Busca lÃ­neas con secrets hardcodeados"
Write-Host "3. Toma screenshot del cÃ³digo vulnerable"
Wait-ForScreenshot "CÃ³digo fuente con vulnerabilidades"

Write-Host "ðŸ“¸ CAPTURA 4: npm audit" -ForegroundColor Yellow
Write-Host "1. Abre terminal en backend/"
Write-Host "2. Ejecuta: npm audit"
Write-Host "3. Toma screenshot de las vulnerabilidades"
Wait-ForScreenshot "Resultado de npm audit"

Write-Host "ðŸ“¸ CAPTURA 5: Acceso no autorizado" -ForegroundColor Yellow
Write-Host "1. En Postman, usa token de usuario normal"
Write-Host "2. GET http://localhost:5000/api/admin/users"
Write-Host "3. Toma screenshot del resultado"
Wait-ForScreenshot "Intento de acceso no autorizado"

Write-Host ""
Write-Host "âœ… CAPTURAS COMPLETADAS" -ForegroundColor Green
Write-Host "Guarda todas las imÃ¡genes en: .\evidence\" -ForegroundColor Cyan
Write-Host "Nombres sugeridos:" -ForegroundColor Yellow
Write-Host "- captura-1-sql-injection-login.png"
Write-Host "- captura-2-postman-sql-injection.png"
Write-Host "- captura-3-codigo-vulnerabilidades.png"
Write-Host "- captura-4-npm-audit.png"
Write-Host "- captura-5-acceso-no-autorizado.png"
