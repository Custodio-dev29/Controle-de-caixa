@echo off
REM Inicia o backend localmente sem precisar digitar comandos toda vez.
cd /d "%~dp0"
start "Gestao Backend" /min cmd /c "node server.js"
start "" "http://localhost:3000"
