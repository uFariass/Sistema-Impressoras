-- Script para configurar backup automático no SQL Server
-- Execute este script no SQL Server Management Studio

USE msdb;
GO

-- Criar job de backup diário
EXEC dbo.sp_add_job
    @job_name = N'Backup Elgisa Diario';

-- Adicionar step do job
EXEC sp_add_jobstep
    @job_name = N'Backup Elgisa Diario',
    @step_name = N'Backup Database',
    @command = N'BACKUP DATABASE [ImpressorasDB] TO DISK = N''C:\Users\Lucas\Desktop\elgisa\elgisa\backups\ImpressorasDB_Auto_'' + CONVERT(VARCHAR, GETDATE(), 112) + ''.bak'' WITH FORMAT, COMPRESSION';

-- Criar schedule (todo dia às 1h)
EXEC dbo.sp_add_schedule
    @schedule_name = N'Diario 1AM',
    @freq_type = 4,
    @freq_interval = 1,
    @active_start_time = 010000;

-- Associar job ao schedule
EXEC sp_attach_schedule
   @job_name = N'Backup Elgisa Diario',
   @schedule_name = N'Diario 1AM';

-- Adicionar job ao servidor
EXEC dbo.sp_add_jobserver
    @job_name = N'Backup Elgisa Diario';