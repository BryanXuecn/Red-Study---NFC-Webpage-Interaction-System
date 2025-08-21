@echo off
echo Starting HTTP servers for NFC web system...

REM Start server for Manifesto Hall on port 8080
start "Manifesto Hall" /D "%~dp0nfc-web-system\01-manifesto-hall" cmd /k python -m http.server 8080 --bind 0.0.0.0

REM Start server for Anthem Hall on port 8081  
start "Anthem Hall" /D "%~dp0nfc-web-system\02-anthem-hall" cmd /k python -m http.server 8081 --bind 0.0.0.0

REM Start server for Riverside Hall on port 8082
start "Riverside Hall" /D "%~dp0nfc-web-system\03-riverside-hall" cmd /k python -m http.server 8082 --bind 0.0.0.0

echo All servers started!
pause