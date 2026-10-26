@echo off
cd /d "%~dp0motor"
start "" http://localhost:8095
node editor\server.cjs
