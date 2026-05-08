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
