# ZeroSmoke Grafana Deployment Script
# Run as Administrator to copy provisioning files

$GrafanaHome = "C:\Program Files\GrafanaLabs\grafana"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== ZeroSmoke Grafana Deployment ===" -ForegroundColor Cyan

# 1. Stop Grafana service
Write-Host "Stopping Grafana service..." -ForegroundColor Yellow
Stop-Service -Name Grafana -ErrorAction Stop

# 2. Copy datasource provisioning
$dsTarget = "$GrafanaHome\conf\provisioning\datasources\zerosmoke-infinity.yaml"
Copy-Item -Path "$ScriptDir\grafana-datasource.yaml" -Destination $dsTarget -Force
Write-Host "  Datasource: $dsTarget" -ForegroundColor Green

# 3. Copy dashboard provisioner config
$dpTarget = "$GrafanaHome\conf\provisioning\dashboards\zerosmoke.yaml"
Copy-Item -Path "$ScriptDir\grafana-dashboard-provisioner.yaml" -Destination $dpTarget -Force
Write-Host "  Dashboard provisioner: $dpTarget" -ForegroundColor Green

# 4. Create dashboard directory and copy dashboard JSON
$dashboardDir = "$GrafanaHome\conf\provisioning\dashboards\zerosmoke"
New-Item -ItemType Directory -Path $dashboardDir -Force | Out-Null
Copy-Item -Path "$ScriptDir\zerosmoke-dashboard.json" -Destination "$dashboardDir\zerosmoke-dashboard.json" -Force
Write-Host "  Dashboard JSON: $dashboardDir\zerosmoke-dashboard.json" -ForegroundColor Green

# 5. Start Grafana service
Write-Host "Starting Grafana service..." -ForegroundColor Yellow
Start-Service -Name Grafana -ErrorAction Stop

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Open http://localhost:3002" -ForegroundColor Gray
Write-Host "  2. Log in with your Grafana admin credentials" -ForegroundColor Gray
Write-Host "  3. Update the bearerToken in datasource: " -ForegroundColor Gray
Write-Host "     Configuration > Data Sources > ZeroSmoke API > Bearer Token" -ForegroundColor Gray
Write-Host "  4. Use this JWT (from backend login):" -ForegroundColor Gray
Start-Sleep -Seconds 1
try {
    $login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post `
        -ContentType "application/json" `
        -Body '{"email":"admin@zerosmoke.com","password":"admin123"}' `
        -ErrorAction SilentlyContinue
    if ($login.token) {
        Write-Host "     $($login.token.Substring(0, 50))..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "     (run backend login to get token)" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "  5. Go to Dashboards > ZeroSmoke — Clinical Research & Health Analytics" -ForegroundColor Gray
