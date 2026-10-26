@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在啟動「四年級英語期中考 300 題」...
start "english-midterm-exam-scope" /min cmd /c "node server.mjs 8124"
timeout /t 2 >nul
start "" "http://127.0.0.1:8124/"
