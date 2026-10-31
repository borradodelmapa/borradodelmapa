@echo off
cd /d "%~dp0motor"
start "Editor Benares" /min node editor\server.cjs
start "Editor Monos" /min node editor\server.cjs monos
start "Editor Cap3" /min node editor\server.cjs cap3
timeout /t 3 /nobreak >nul
start "" http://localhost:8095/inicio
