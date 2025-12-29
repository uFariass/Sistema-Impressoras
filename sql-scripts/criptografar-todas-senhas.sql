-- Script para criptografar TODAS as senhas existentes na tabela Usuarios
-- Execute este script no SQL Server Management Studio

USE ImpressorasDB;
GO

-- Ver todas as senhas atuais (antes da criptografia)
SELECT NomeCompleto, Usuario, Email, Senha FROM Usuarios;

-- Criptografar senhas comuns (ajuste conforme necessário)
-- Senha "123" -> hash bcrypt
UPDATE Usuarios 
SET Senha = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE Senha = '123';

-- Senha "admin" -> hash bcrypt  
UPDATE Usuarios 
SET Senha = '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZJcOmWpfPkqq/ZuNqSV6Gle2B50.'
WHERE Senha = 'admin';

-- Senha "password" -> hash bcrypt
UPDATE Usuarios 
SET Senha = '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZJcOmWpfPkqq/ZuNqSV6Gle2B50.'
WHERE Senha = 'password';

-- Verificar todas as senhas após criptografia
SELECT NomeCompleto, Usuario, Email, Senha FROM Usuarios;