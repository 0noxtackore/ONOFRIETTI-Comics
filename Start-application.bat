@echo off
setlocal
title Onofrietti Comics - Servidor de desarrollo

echo.
echo  ====================================================
echo   ONOFRIETTI COMICS - Iniciando servidor
echo  ====================================================
echo.

cd /d "%~dp0"

if not exist node_modules (
    echo  [..] No se encontraron dependencias. Instalando...
    call npm.cmd install
    if errorlevel 1 (
        echo  [ERROR] No se pudo instalar. Ejecuta install.bat para mas detalles.
        pause
        exit /b 1
    )
)

echo  [OK] Servidor listo. Abre la URL que aparece abajo en tu navegador.
echo  [..] Presiona Ctrl+C para detener el servidor.
echo.

call npm.cmd run dev

pause
