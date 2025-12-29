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

-- 3. Job de Backup Automático (Execute no SQL Server Management Studio)
USE msdb;
GO

EXEC dbo.sp_add_job @job_name = N'Backup_Elgisa_Daily';
GO

EXEC sp_add_jobstep
    @job_name = N'Backup_Elgisa_Daily',
    @step_name = N'Backup Database',
    @subsystem = N'TSQL',
    @command = N'
        DECLARE @BackupPath NVARCHAR(500) = ''C:\Backups\Elgisa\''
        DECLARE @FileName NVARCHAR(500)
        DECLARE @Date NVARCHAR(20) = CONVERT(NVARCHAR(20), GETDATE(), 112)
        
        SET @FileName = @BackupPath + ''Elgisa_'' + @Date + ''.bak''
        
        BACKUP DATABASE [elgisa] 
        TO DISK = @FileName
        WITH FORMAT, INIT, COMPRESSION, CHECKSUM;
    ';
GO

EXEC dbo.sp_add_schedule
    @schedule_name = N'Daily_2AM',
    @freq_type = 4,
    @freq_interval = 1,
    @active_start_time = 020000;
GO

EXEC sp_attach_schedule
    @job_name = N'Backup_Elgisa_Daily',
    @schedule_name = N'Daily_2AM';
GO

EXEC dbo.sp_add_jobserver @job_name = N'Backup_Elgisa_Daily';
GO