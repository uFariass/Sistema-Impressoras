@echo off
echo Iniciando servidor local para o sistema web...
echo Acesse: http://localhost:8000
echo Pressione Ctrl+C para parar o servidor
cd sistema-web
python -m http.server 8000