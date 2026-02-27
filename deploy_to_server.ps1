$ErrorActionPreference = "Stop"

# Server configuration
$server = "10.86.82.130"
$username = "phong.tran"
$remotePath = "/home/phong.tran/talent-iq"
$appName = "talent-iq"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy Talent IQ to Production Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if deploy_package exists
if (-not (Test-Path "deploy_package")) {
    Write-Host "ERROR: deploy_package not found!" -ForegroundColor Red
    Write-Host "Please run: .\prepare_deploy.ps1 first" -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/4] Uploading files to server..." -ForegroundColor Green
Write-Host "Target: $username@$server`:$remotePath" -ForegroundColor Gray

# Upload using SCP (you'll be prompted for password)
$scpTarget = "$username@$server`:$remotePath/"
scp -r .\deploy_package\* $scpTarget

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Upload failed!" -ForegroundColor Red
    exit 1
}

Write-Host "[2/4] Files uploaded successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "[3/4] Restarting PM2 on server..." -ForegroundColor Green

# SSH and restart PM2 (you'll be prompted for password again)
$sshTarget = "$username@$server"
$sshCommand = "cd $remotePath && pm2 restart $appName || pm2 start ecosystem.config.js"
ssh $sshTarget $sshCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: PM2 restart may have failed. Check manually." -ForegroundColor Yellow
}
else {
    Write-Host "[4/4] PM2 restarted successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access your app at: http://$server`:3000/dashboard" -ForegroundColor Cyan
Write-Host "Don't forget to hard refresh (Ctrl+Shift+R) to see the new favicon!" -ForegroundColor Yellow
