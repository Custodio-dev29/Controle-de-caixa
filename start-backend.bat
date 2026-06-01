@echo off
REM Inicia o backend localmente sem precisar digitar comandos toda vez.
cd /d "%~dp0"
start "Gestao Backend" /min node server.js
