@echo off
setlocal
cd /d "%~dp0"

rem Prefer the tools already available in this checkout.
for /d %%D in ("%~dp0.tools\node-*-win-x64") do if exist "%%~fD\node.exe" set "PATH=%%~fD;%PATH%"
if exist "%~dp0.tools\pnpm\node_modules\.bin\pnpm.cmd" set "PATH=%~dp0.tools\pnpm\node_modules\.bin;%PATH%"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 24 is required. Install it and run start.cmd again.
  exit /b 1
)

set "PNPM_COMMAND=pnpm.cmd"
where pnpm.cmd >nul 2>nul
if errorlevel 1 (
  where corepack.cmd >nul 2>nul
  if errorlevel 1 (
    echo pnpm is required. Install it with: npm install -g pnpm@10.32.1
    exit /b 1
  )
  set "PNPM_COMMAND=corepack.cmd pnpm"
)

cd /d "%~dp0frontend"
if not exist "node_modules\.bin\nuxt.cmd" (
  call %PNPM_COMMAND% install --frozen-lockfile
  if errorlevel 1 exit /b 1
)

call %PNPM_COMMAND% dev %*
exit /b %ERRORLEVEL%
