@echo off
echo Iniciando servidor local para o sistema web...
echo Acesse: http://localhost:3001
echo Pressione Ctrl+C para parar o servidor
cd sistema-web
npx http-server -p 3001