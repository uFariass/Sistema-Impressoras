-- Script de Backup Automático para SQL Server
-- Execute este script para criar um job de backup automático

USE msdb;
GO

-- Criar o job de backup
EXEC dbo.sp_add_job
    @job_name = N'Backup_Elgisa_Daily';
GO

-- Adicionar step do backup
EXEC sp_add_jobstep
    @job_name = N'Backup_Elgisa_Daily',
    @step_name = N'Backup Database',
    @subsystem = N'TSQL',
    @command = N'
        DECLARE @BackupPath NVARCHAR(500)
        DECLARE @FileName NVARCHAR(500)
        DECLARE @Date NVARCHAR(20)
        
        SET @Date = CONVERT(NVARCHAR(20), GETDATE(), 112) + ''_'' + REPLACE(CONVERT(NVARCHAR(20), GETDATE(), 108), '':'', '''')
        SET @BackupPath = ''C:\Backups\Elgisa\''
        SET @FileName = @BackupPath + ''Elgisa_'' + @Date + ''.bak''
        
        -- Criar diretório se não existir
        EXEC xp_create_subdir @BackupPath
        
        -- Fazer backup completo
        BACKUP DATABASE [elgisa] 
        TO DISK = @FileName
        WITH FORMAT, INIT, 
        NAME = ''Elgisa Full Backup'',
        COMPRESSION,
        CHECKSUM;
        
        -- Limpar backups antigos (manter apenas 30 dias)
        DECLARE @DeleteDate DATETIME
        SET @DeleteDate = DATEADD(day, -30, GETDATE())
        
        EXECUTE master.dbo.xp_delete_file 0, @BackupPath, ''bak'', @DeleteDate, 1;
    ',
    @retry_attempts = 3,
    @retry_interval = 5;
GO

-- Configurar schedule (diário às 2:00 AM)
EXEC dbo.sp_add_schedule
    @schedule_name = N'Daily_2AM',
    @freq_type = 4,
    @freq_interval = 1,
    @active_start_time = 020000;
GO

-- Associar job ao schedule
EXEC sp_attach_schedule
    @job_name = N'Backup_Elgisa_Daily',
    @schedule_name = N'Daily_2AM';
GO

-- Adicionar job ao SQL Server Agent
EXEC dbo.sp_add_jobserver
    @job_name = N'Backup_Elgisa_Daily';
GO

-- Criar tabela de log de backups
CREATE TABLE backup_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    backup_date DATETIME DEFAULT GETDATE(),
    backup_file NVARCHAR(500),
    backup_size_mb DECIMAL(10,2),
    status NVARCHAR(50),
    error_message NVARCHAR(MAX)
);
GO

PRINT 'Backup automático configurado com sucesso!'
PRINT 'Backups serão executados diariamente às 2:00 AM'
PRINT 'Arquivos serão salvos em: C:\Backups\Elgisa\'
PRINT 'Backups antigos (>30 dias) serão removidos automaticamente'