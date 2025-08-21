@echo off
chcp 65001 >nul
cd /d "%~dp0nfc-web-system"

echo Starting Red Study Web Server...
echo.

for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr "IPv4" ^| findstr "192.168"') do (
    set "ip=%%i"
    goto :found
)
:found
set ip=%ip: =%

echo Mobile access URL: http://%ip%:8080
echo Press Ctrl+C to stop server
echo.

python -m http.server 8080 --bind 0.0.0.0