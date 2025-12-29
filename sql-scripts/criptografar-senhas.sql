-- Script para criptografar senhas existentes na tabela Usuarios
-- Execute este script no SQL Server Management Studio

USE ImpressorasDB;
GO

-- Atualizar senha do usuário lucas@email.com (1234 -> hash bcrypt)
UPDATE Usuarios 
SET Senha = '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZJcOmWpfPkqq/ZuNqSV6Gle2B50.'
WHERE Email = 'lucas@email.com';

-- Verificar se a atualização foi feita
SELECT NomeCompleto, Usuario, Email, Senha FROM Usuarios WHERE Email = 'lucas@email.com';