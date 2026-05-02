@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.3.2
@REM
@REM Required ENV vars:
@REM   JAVA_HOME - location of a JDK home dir (optional, will use java on PATH)
@REM
@REM Optional ENV vars:
@REM   MVNW_VERBOSE - true: enable verbose log; others: silence the output
@REM ----------------------------------------------------------------------------

@echo off
setlocal

set "MVNW_DIR=%~dp0"
set "MVNW_PROPERTIES=%MVNW_DIR%.mvn\wrapper\maven-wrapper.properties"
set "MVNW_DIST_DIR=%MVNW_DIR%.mvn\wrapper\dists"
set "WRAPPER_JAR=%MVNW_DIR%.mvn\wrapper\maven-wrapper.jar"

@REM Parse distribution URL from properties file
set "MVNW_DISTRO_URL="
for /f "usebackq tokens=1,* delims==" %%a in ("%MVNW_PROPERTIES%") do (
    if "%%a"=="distributionUrl" set "MVNW_DISTRO_URL=%%b"
)

if "%MVNW_DISTRO_URL%"=="" (
    echo ERROR: distributionUrl is not set in %MVNW_PROPERTIES% >&2
    exit /b 1
)

@REM Find java.exe
set "JAVA_EXE=java.exe"
if defined JAVA_HOME (
    set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
    if not exist "%JAVA_HOME%\bin\java.exe" (
        echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME% >&2
        exit /b 1
    )
)

@REM Use wrapper JAR if available
if exist "%WRAPPER_JAR%" (
    "%JAVA_EXE%" %MVNW_JAVA_OPTIONS% %MAVEN_OPTS% "-Dmaven.multiModuleProjectDirectory=%MVNW_DIR%." -jar "%WRAPPER_JAR%" %*
    goto :EOF
)

@REM Otherwise download Maven distribution directly
if not exist "%MVNW_DIST_DIR%" mkdir "%MVNW_DIST_DIR%"

@REM Check if Maven is already downloaded
set "MAVEN_HOME="
for /d %%G in ("%MVNW_DIST_DIR%\apache-maven-*") do set "MAVEN_HOME=%%G"

if defined MAVEN_HOME (
    if exist "%MAVEN_HOME%\bin\mvn.cmd" (
        goto :runMaven
    )
)

@REM Download Maven
echo Downloading Maven from %MVNW_DISTRO_URL%...
set "MVNW_DIST_ZIP=%MVNW_DIST_DIR%\maven-dist.zip"

powershell -noprofile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%MVNW_DISTRO_URL%' -OutFile '%MVNW_DIST_ZIP%'"

if not exist "%MVNW_DIST_ZIP%" (
    echo ERROR: Failed to download Maven distribution. >&2
    exit /b 1
)

@REM Extract
echo Extracting Maven...
powershell -noprofile -ExecutionPolicy Bypass -Command "Expand-Archive -Path '%MVNW_DIST_ZIP%' -DestinationPath '%MVNW_DIST_DIR%' -Force"

del "%MVNW_DIST_ZIP%" 2>nul

@REM Find extracted Maven directory
set "MAVEN_HOME="
for /d %%G in ("%MVNW_DIST_DIR%\apache-maven-*") do set "MAVEN_HOME=%%G"

if not defined MAVEN_HOME (
    echo ERROR: Could not find extracted Maven distribution. >&2
    exit /b 1
)

:runMaven
"%MAVEN_HOME%\bin\mvn.cmd" %MVNW_JAVA_OPTIONS% %MAVEN_OPTS% "-Dmaven.multiModuleProjectDirectory=%MVNW_DIR%." %*
