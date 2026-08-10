@echo off
setlocal
title Onofrietti Comics - Instalacion

echo.
echo  ====================================================
echo   ONOFRIETTI COMICS - Instalando dependencias
echo  ====================================================
echo.

cd /d "%~dp0"

if exist node_modules (
    echo  [OK] node_modules ya existe. Verificando actualizaciones...
) else (
    echo  [..] Instalando dependencias por primera vez, puede tardar...
)

call npm install
if errorlevel 1 (
    echo.
    echo  [ERROR] No se pudo instalar. Revisa que Node.js este instalado.
    pause
    exit /b 1
)

echo.
echo  [OK] Dependencias instaladas correctamente.
echo       Ahora ejecuta Start-application.bat para iniciar el servidor.
echo.
pause
