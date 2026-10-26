@echo off
cd /d "%~dp0motor"
start "Editor Benares" /min node editor\server.cjs
start "Editor Monos" /min node editor\server.cjs monos
timeout /t 3 /nobreak >nul
start "" http://localhost:8095/inicio
