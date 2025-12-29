@echo off
echo Gerando certificado SSL para Elgisa...

REM Criar keystore com certificado auto-assinado
keytool -genkeypair -alias elgisa -keyalg RSA -keysize 2048 -storetype PKCS12 -keystore src/main/resources/keystore.p12 -validity 365 -dname "CN=localhost, OU=Elgisa, O=Elgisa, L=Sao Paulo, ST=SP, C=BR" -storepass elgisa2024 -keypass elgisa2024

echo.
echo Certificado SSL gerado com sucesso!
echo Arquivo: src/main/resources/keystore.p12
echo Senha: elgisa2024
echo.
echo Para produção, substitua por certificado válido de uma CA confiável.
pause