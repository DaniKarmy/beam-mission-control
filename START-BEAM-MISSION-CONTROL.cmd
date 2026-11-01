@echo off
setlocal EnableExtensions

title BEAM MISSION CONTROL - Local Reviewer Launcher

rem Always anchor every path to the folder that contains this launcher.
set "ROOT=%~dp0"
set "LOG=%ROOT%BEAM-LAUNCHER-LOG.txt"

> "%LOG%" echo BEAM MISSION CONTROL launcher log
>> "%LOG%" echo Launcher: %~f0
>> "%LOG%" echo Root: %ROOT%
>> "%LOG%" echo Date/time: %DATE% %TIME%

pushd "%ROOT%" >nul 2>&1
if errorlevel 1 goto ROOT_FAILED

echo.
echo ==============================================================
echo   BEAM MISSION CONTROL - Save the Satellite
echo   Local reviewer launcher
echo ==============================================================
echo.
echo Root folder:
echo   %ROOT%
echo.

where node >nul 2>&1
if errorlevel 1 goto NODE_MISSING
for /f "delims=" %%V in ('node --version 2^>^&1') do set "NODEVER=%%V"
echo Node: %NODEVER%
>> "%LOG%" echo Node: %NODEVER%

where npm >nul 2>&1
if errorlevel 1 goto NPM_MISSING
for /f "delims=" %%V in ('npm --version 2^>^&1') do set "NPMVER=%%V"
echo npm:  %NPMVER%
>> "%LOG%" echo npm: %NPMVER%
echo.

if not exist "%ROOT%package.json" goto PACKAGE_MISSING
if not exist "%ROOT%package-lock.json" goto LOCK_MISSING

echo package.json:      FOUND
echo package-lock.json: FOUND
>> "%LOG%" echo package.json FOUND
>> "%LOG%" echo package-lock.json FOUND
echo.

rem Avoid percent-expansion / ERRORLEVEL traps inside parenthesized blocks.
if exist "%ROOT%node_modules\.bin\vite.cmd" goto DEPS_READY

echo First local run: installing locked dependencies with npm ci...
echo This requires internet access to the npm registry.
echo.
>> "%LOG%" echo Running npm ci
call npm ci
if errorlevel 1 goto INSTALL_FAILED
>> "%LOG%" echo npm ci exit code: 0

if not exist "%ROOT%node_modules\.bin\vite.cmd" goto INSTALL_INCOMPLETE

echo.

:DEPS_READY
echo Starting BEAM MISSION CONTROL...
echo Preferred local URL: http://127.0.0.1:4173
echo If that port is busy, Vite will use the next available port.
echo.
echo Keep this window open while using the application.
echo Press Ctrl+C when you want to stop the local server.
echo.
>> "%LOG%" echo Starting Vite with preferred port 4173 and automatic browser open

call npm run dev -- --host 127.0.0.1 --port 4173 --open
set "RC=%ERRORLEVEL%"
>> "%LOG%" echo Vite exit code: %RC%
echo.
echo Local server stopped with exit code %RC%.
goto END

:ROOT_FAILED
echo ERROR: The launcher could not enter its own folder.
>> "%LOG%" echo ERROR: pushd ROOT failed.
goto END

:NODE_MISSING
echo ERROR: Node.js was not found on this computer.
echo Install a current Node.js release and run this launcher again.
>> "%LOG%" echo ERROR: Node.js not found.
goto END

:NPM_MISSING
echo ERROR: npm was not found on this computer.
echo Reinstall Node.js with npm and run this launcher again.
>> "%LOG%" echo ERROR: npm not found.
goto END

:PACKAGE_MISSING
echo ERROR: package.json was not found at:
echo   %ROOT%package.json
echo.
echo This launcher must stay in the same folder as package.json.
>> "%LOG%" echo ERROR: package.json missing at %ROOT%package.json
goto END

:LOCK_MISSING
echo ERROR: package-lock.json was not found at:
echo   %ROOT%package-lock.json
echo.
echo The public release package is incomplete.
>> "%LOG%" echo ERROR: package-lock.json missing at %ROOT%package-lock.json
goto END

:INSTALL_FAILED
echo.
echo ERROR: npm ci returned a non-zero exit code. The application server was not started.
echo See the npm messages above and BEAM-LAUNCHER-LOG.txt.
>> "%LOG%" echo ERROR: npm ci returned non-zero.
goto END

:INSTALL_INCOMPLETE
echo.
echo ERROR: npm ci returned success, but the Vite launcher was not created.
echo The dependency installation is incomplete or incompatible with this environment.
>> "%LOG%" echo ERROR: npm ci success but node_modules\.bin\vite.cmd is missing.
goto END

:END
echo.
echo --------------------------------------------------------------
echo Launcher finished or stopped.
echo Log: "%LOG%"
echo --------------------------------------------------------------
echo.
popd >nul 2>&1
pause
endlocal
