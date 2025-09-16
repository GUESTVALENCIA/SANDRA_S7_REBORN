@echo off
echo ====================================
echo    SANDRA IA 7.0 - SETUP WINDOWS
echo    ClayTom Systems Corporation
echo    CEO: Clayton Thomas George
echo ====================================
echo.

echo [INFO] Verificando permisos de administrador...
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Ejecutando como administrador
) else (
    echo [WARNING] Se recomienda ejecutar como administrador
)

echo.
echo [1/5] Creando directorio de instalacion...
mkdir "C:\Sandra_IA_7.0" 2>nul
mkdir "C:\Sandra_IA_7.0\logs" 2>nul
cd "C:\Sandra_IA_7.0"

echo [2/5] Descargando frontend desde Netlify...
powershell -Command "try { Invoke-WebRequest -Uri 'https://sandra-s7-reborn.netlify.app' -OutFile 'sandra_frontend.html'; Write-Host '[OK] Frontend descargado' } catch { Write-Host '[ERROR] No se pudo descargar frontend'; exit 1 }"

echo [3/5] Creando archivo de configuracion local...
echo # Sandra IA 7.0 - Configuracion Local > config.txt
echo # ClayTom Systems Corporation >> config.txt
echo # ================================= >> config.txt
echo. >> config.txt
echo NETLIFY_URL=https://sandra-s7-reborn.netlify.app >> config.txt
echo APIs_DESBLOQUEADAS=OpenAI,ElevenLabs,HeyGen >> config.txt
echo DOMINIOS_AUTORIZADOS=guestsvalencia.es,claytomsystems.com >> config.txt
echo SISTEMA_MEMORIA=Neon_Database >> config.txt
echo VERSION=7.0 >> config.txt
echo INSTALADO=%date% %time% >> config.txt

echo [4/5] Creando acceso directo en escritorio...
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\Sandra IA 7.0.lnk'); $Shortcut.TargetPath = 'C:\Sandra_IA_7.0\sandra_frontend.html'; $Shortcut.WorkingDirectory = 'C:\Sandra_IA_7.0'; $Shortcut.Description = 'Sandra IA 7.0 - ClayTom Systems'; $Shortcut.IconLocation = 'shell32.dll,278'; $Shortcut.Save(); Write-Host '[OK] Acceso directo creado'"

echo [5/5] Registrando instalacion en el sistema...
reg add "HKLM\SOFTWARE\ClayTom Systems\Sandra IA 7.0" /v "InstallPath" /t REG_SZ /d "C:\Sandra_IA_7.0" /f >nul 2>&1
reg add "HKLM\SOFTWARE\ClayTom Systems\Sandra IA 7.0" /v "Version" /t REG_SZ /d "7.0" /f >nul 2>&1
reg add "HKLM\SOFTWARE\ClayTom Systems\Sandra IA 7.0" /v "InstallDate" /t REG_SZ /d "%date%" /f >nul 2>&1

echo.
echo ====================================
echo   INSTALACION COMPLETADA
echo ====================================
echo.
echo [INSTALADO] C:\Sandra_IA_7.0\
echo [ACCESO]    Escritorio\Sandra IA 7.0.lnk
echo [FRONTEND]  Conectado a Netlify
echo [APIs]      OpenAI + ElevenLabs + HeyGen
echo [MEMORIA]   Neon Database integrada
echo.
echo Presiona cualquier tecla para abrir Sandra IA 7.0...
pause >nul

echo [LAUNCHING] Abriendo Sandra IA 7.0...
start "" "C:\Sandra_IA_7.0\sandra_frontend.html"

exit