-- Script para verificar a estrutura da tabela Usuarios
USE ImpressorasDB;
GO

-- Verificar colunas da tabela Usuarios
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Usuarios'
ORDER BY ORDINAL_POSITION;

-- Ver alguns registros para entender a estrutura
SELECT TOP 3 * FROM Usuarios;