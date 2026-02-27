@echo off
color 0B
echo ===================================================
echo   Talent-IQ 1-Click Deployment (Local to Server)
echo ===================================================
echo.

echo [1/4] Building Next.js application...
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo Error: Build failed! 
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] Preparing deployment package...
powershell -ExecutionPolicy Bypass -File .\prepare_deploy.ps1
if %errorlevel% neq 0 (
    color 0C
    echo Error: Package preparation failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Creating deployment archive (TAR format)...
if exist deploy.tar del deploy.tar
cd deploy_package
tar -cf ..\deploy.tar *
cd ..
if %errorlevel% neq 0 (
    color 0C
    echo Error: Archive creation failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [4/4] Uploading and Deploying to SSH Server...
node deploy.js
if %errorlevel% neq 0 (
    color 0C
    echo Error: Deployment SSH script failed!
    pause
    exit /b %errorlevel%
)

color 0A
echo.
echo ===================================================
echo   DEPLOYMENT COMPLETED SUCCESSFULLY!
echo ===================================================
pause
