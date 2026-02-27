$ErrorActionPreference = "Stop"

$server = "10.86.82.130"
$username = "phong.tran"
$remotePath = "/home/phong.tran/talent-iq"
$appName = "talent-iq"

Write-Host "Zipping deploy_package..."
if (Test-Path "deploy.zip") { Remove-Item "deploy.zip" -Force }
Compress-Archive -Path .\deploy_package\* -DestinationPath deploy.zip -Force

Write-Host "Uploading deploy.zip to server..."
scp deploy.zip "$username@$server`:$remotePath/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Upload failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Unzipping and restarting PM2 on server..."
$sshTarget = "$username@$server"
$sshCommand = "cd $remotePath && unzip -o deploy.zip && rm deploy.zip && (pm2 restart $appName || pm2 start ecosystem.config.js)"
ssh $sshTarget $sshCommand

Write-Host "Deployment Complete!"
