@echo off
chcp 65001 >nul
cd /d "%~dp0"

where pnpm >nul 2>nul
if errorlevel 1 (
  echo 未检测到 pnpm，请先安装 Node.js 和 pnpm。
  pause
  exit /b 1
)

if not exist node_modules (
  echo 首次运行，正在安装网站依赖...
  call pnpm install
  if errorlevel 1 (
    echo 依赖安装失败，请检查网络后重试。
    pause
    exit /b 1
  )
)

start "郭佳鑫作品集本地服务器" cmd /k "cd /d ""%~dp0"" && pnpm dev -- --host 127.0.0.1 --port 5175"
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:5175/"

