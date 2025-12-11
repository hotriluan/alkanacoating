@echo off
REM Create a deployment package (zip) for uploading to shared hosting
REM Usage: run from repo root in PowerShell/Command Prompt
setlocal enabledelayedexpansion
set BACKEND=backend
set OUT=deploy_package_temp
set ZIP=deploy_package.zip
if exist "%OUT%" rd /s /q "%OUT%"
mkdir "%OUT%"
echo Copying backend files (excluding node_modules, .git, tests)...
powershell -NoProfile -Command "Copy-Item -Path '%BACKEND%\*' -Destination '.\\%OUT%\\backend' -Recurse -Force -Exclude 'node_modules','.git','tests','.env','.env.local'"
echo Copying SQL files from backend...
powershell -NoProfile -Command "Get-ChildItem -Path '%BACKEND%' -Filter '*.sql' -File | ForEach-Object { Copy-Item $_.FullName -Destination '.\\%OUT%' -Force }"
echo Copying top-level SQL/docs if present...
powershell -NoProfile -Command "Get-ChildItem -Path '.' -Filter '*.sql' -File | ForEach-Object { Copy-Item $_.FullName -Destination '.\\%OUT%' -Force }"
echo Copying .env.example if present...
if exist "%BACKEND%\.env.example" copy "%BACKEND%\.env.example" "%OUT%\\backend\.env.example" >nul
echo Creating zip: %ZIP%
if exist "%ZIP%" del /q "%ZIP%"
powershell -NoProfile -Command "Compress-Archive -Path '.\\%OUT%\\*' -DestinationPath '%ZIP%' -Force"
if exist "%ZIP%" (
  echo Created %ZIP% successfully.
) else (
  echo ERROR: failed to create %ZIP%.
)
echo Cleaning temp folder...
rd /s /q "%OUT%"
echo Done.
endlocal
pause
