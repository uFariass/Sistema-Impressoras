@echo off
echo ========================================
echo    DEPLOY SEGURO - SERVIDOR ELGISA
echo ========================================

echo.
echo 1. Configurando variaveis de ambiente...
set DB_USERNAME=sa
set /p DB_PASSWORD="Digite a senha do SQL Server: "
set JWT_SECRET=elgisa-producao-2024-chave-muito-segura

echo.
echo 2. Compilando projeto...
call mvn clean package -DskipTests

echo.
echo 3. Executando testes de seguranca...
cd security-tests
call node penetration-test.js
cd ..

echo.
echo 4. Criando backup antes do deploy...
mkdir C:\elgisa-backups 2>nul

echo.
echo 5. Iniciando aplicacao em modo producao...
echo Aplicacao rodara em: https://localhost:8443
echo.
java -jar target/elgisa-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

pause