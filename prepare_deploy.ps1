$ErrorActionPreference = "Stop"

Write-Host "Starting deployment preparation..." -ForegroundColor Green

$deployDir = "deploy_package"

# 1. Clean up old package
if (Test-Path $deployDir) {
  Write-Host "Cleaning old package..."
  Remove-Item $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

# 2. Copy Standalone build
Write-Host "Copying standalone build..."
Copy-Item -Path ".next/standalone/*" -Destination $deployDir -Recurse

# 3. Copy Static files (Targeting the nested project folder)
Write-Host "Copying static files..."
$projectDir = "$deployDir/talent-iq"
# Ensure the project directory exists first (it should, but just in case)
if (-not (Test-Path $projectDir)) { New-Item -ItemType Directory -Path $projectDir -Force | Out-Null }

$staticDest = "$projectDir/.next/static"
# Ensure the destination directory exists
New-Item -ItemType Directory -Path $staticDest -Force | Out-Null
Copy-Item -Path ".next/static/*" -Destination $staticDest -Recurse -Force

# 4. Copy Public files
Write-Host "Copying public files..."
$publicDest = "$projectDir/public"
New-Item -ItemType Directory -Path $publicDest -Force | Out-Null
Copy-Item -Path "public/*" -Destination $publicDest -Recurse -Force

# 4a. Copy app/icon.webp (Next.js file-based metadata)
Write-Host "Copying app/icon.webp..."
if (Test-Path "app\icon.webp") {
  $appDest = "$projectDir/app"
  New-Item -ItemType Directory -Path $appDest -Force | Out-Null
  Copy-Item -Path "app\icon.webp" -Destination "$appDest\icon.webp" -Force
}

# 4b. Copy Environment Files
Write-Host "Copying .env.local..."
if (Test-Path ".env.local") {
  Copy-Item -Path ".env.local" -Destination "$deployDir" -Force
  # Also copy to the nested project dir to be safe
  Copy-Item -Path ".env.local" -Destination "$projectDir" -Force
}

# 5. Create ecosystem.config.js for PM2
Write-Host "Creating PM2 config..."
$pm2Config = @"
module.exports = {
  apps: [{
    name: "talent-iq",
    script: "./talent-iq/server.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}
"@
Set-Content -Path "$deployDir/ecosystem.config.js" -Value $pm2Config

Write-Host "Build ready in '$deployDir' folder!" -ForegroundColor Green
Write-Host "Content ready to upload:"
Get-ChildItem $deployDir
