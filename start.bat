@echo off
setlocal

cd /d "%~dp0"

if not exist "node_modules" (
  echo [start] node_modules not found, running npm install...
  call npm install
  if errorlevel 1 (
    echo [start] npm install failed.
    exit /b 1
  )
)

echo [start] launching dev server...
call npm run dev

