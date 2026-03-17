@echo off
chcp 65001 >nul
echo ========================================
echo 启动 MultiLanguageManager 后端服务器
echo ========================================
echo.
echo 正在启动开发服务器...
echo 服务器地址: http://localhost:3001
echo 按 Ctrl+C 停止服务器
echo.
cd /d %~dp0backend
npm run dev
