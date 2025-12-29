-- Script para verificar se os backups estão funcionando
-- Execute este script no SQL Server Management Studio

USE msdb;
GO

-- 1. Verificar se o job de backup existe e está ativo
SELECT 
    j.name AS 'Nome do Job',
    j.enabled AS 'Ativo',
    j.date_created AS 'Data Criação',
    j.date_modified AS 'Última Modificação'
FROM sysjobs j
WHERE j.name LIKE '%Backup%' OR j.name LIKE '%elgisa%';

-- 2. Verificar histórico de execução dos jobs
SELECT TOP 10
    j.name AS 'Nome do Job',
    h.run_date AS 'Data Execução',
    h.run_time AS 'Hora Execução',
    CASE h.run_status
        WHEN 0 THEN 'Falhou'
        WHEN 1 THEN 'Sucesso'
        WHEN 2 THEN 'Retry'
        WHEN 3 THEN 'Cancelado'
    END AS 'Status',
    h.message AS 'Mensagem'
FROM sysjobs j
INNER JOIN sysjobhistory h ON j.job_id = h.job_id
WHERE j.name LIKE '%Backup%' OR j.name LIKE '%elgisa%'
ORDER BY h.run_date DESC, h.run_time DESC;

-- 3. Verificar próximas execuções agendadas
SELECT 
    j.name AS 'Nome do Job',
    s.name AS 'Nome do Schedule',
    s.enabled AS 'Schedule Ativo',
    CASE s.freq_type
        WHEN 1 THEN 'Uma vez'
        WHEN 4 THEN 'Diário'
        WHEN 8 THEN 'Semanal'
        WHEN 16 THEN 'Mensal'
    END AS 'Frequência'
FROM sysjobs j
INNER JOIN sysjobschedules js ON j.job_id = js.job_id
INNER JOIN sysschedules s ON js.schedule_id = s.schedule_id
WHERE j.name LIKE '%Backup%' OR j.name LIKE '%elgisa%';

-- 4. Verificar backups recentes do banco
SELECT TOP 10
    database_name AS 'Banco',
    backup_start_date AS 'Início Backup',
    backup_finish_date AS 'Fim Backup',
    type AS 'Tipo',
    physical_device_name AS 'Arquivo'
FROM msdb.dbo.backupset bs
INNER JOIN msdb.dbo.backupmediafamily bmf ON bs.media_set_id = bmf.media_set_id
WHERE database_name = 'ImpressorasDB'
ORDER BY backup_start_date DESC;