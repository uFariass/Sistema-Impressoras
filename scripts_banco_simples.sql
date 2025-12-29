-- Scripts para implementar no banco de dados

-- 1. Tabela de Logs de Auditoria
CREATE TABLE audit_logs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT,
    usuario_nome NVARCHAR(150),
    acao NVARCHAR(20), -- CREATE, UPDATE, DELETE
    tabela NVARCHAR(50),
    registro_id BIGINT,
    dados_anteriores NVARCHAR(MAX),
    dados_novos NVARCHAR(MAX),
    data_hora DATETIME2 DEFAULT GETDATE(),
    ip_address NVARCHAR(50)
);
GO

-- 2. Tabela de Log de Backups
CREATE TABLE backup_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    backup_date DATETIME DEFAULT GETDATE(),
    backup_file NVARCHAR(500),
    backup_size_mb DECIMAL(10,2),
    status NVARCHAR(50),
    error_message NVARCHAR(MAX)
);
GO

PRINT 'Tabelas criadas com sucesso!'
GO

-- 3. Script de Backup Manual (descomente para usar)
/*
DECLARE @BackupPath NVARCHAR(500) = 'C:\Backups\Elgisa\'
DECLARE @FileName NVARCHAR(500)
DECLARE @Date NVARCHAR(20) = CONVERT(NVARCHAR(20), GETDATE(), 112)

SET @FileName = @BackupPath + 'Elgisa_' + @Date + '.bak'

BACKUP DATABASE [elgisa] 
TO DISK = @FileName
WITH FORMAT, INIT, COMPRESSION, CHECKSUM;

PRINT 'Backup realizado com sucesso!'
*/