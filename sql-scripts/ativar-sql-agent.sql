-- Script para verificar e ativar SQL Server Agent
-- Execute este script no SQL Server Management Studio como Administrador

-- Verificar status do SQL Server Agent
SELECT 
    servicename,
    startup_type_desc,
    status_desc
FROM sys.dm_server_services
WHERE servicename LIKE '%Agent%';

-- Para ativar o SQL Server Agent via T-SQL (requer privilégios de administrador)
-- Alternativa: usar Services.msc do Windows