@echo off
cd /d "%~dp0motor"
start "" http://localhost:8096
node editor\server.cjs monos
