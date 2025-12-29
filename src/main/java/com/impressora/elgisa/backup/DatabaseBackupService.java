package com.impressora.elgisa.backup;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class DatabaseBackupService {
    
    @Value("${spring.datasource.url}")
    private String dbUrl;
    
    @Value("${spring.datasource.username}")
    private String dbUsername;
    
    @Value("${spring.datasource.password}")
    private String dbPassword;
    
    @Value("${backup.path:C:/elgisa-backups}")
    private String backupPath;
    
    @Scheduled(cron = "0 0 2 * * ?")
    public void performDailyBackup() {
        performBackup("daily");
    }
    
    @Scheduled(cron = "0 0 3 ? * SUN")
    public void performWeeklyBackup() {
        performBackup("weekly");
    }
    
    public void performBackup(String type) {
        try {
            File backupDir = new File(backupPath);
            if (!backupDir.exists()) {
                backupDir.mkdirs();
            }
            
            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
            String backupFileName = String.format("elgisa_backup_%s_%s.bak", type, timestamp);
            String backupFilePath = backupPath + File.separator + backupFileName;
            
            String dbName = extractDatabaseName(dbUrl);
            
            String command = String.format(
                "sqlcmd -S localhost -U %s -P %s -C -Q \"BACKUP DATABASE [%s] TO DISK = N'%s' WITH FORMAT, COMPRESSION\"",
                dbUsername, dbPassword, dbName, backupFilePath
            );
            
            System.out.println("Executando backup: " + command);
            
            ProcessBuilder pb = new ProcessBuilder("cmd", "/c", command);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            // Ler output do processo
            java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(process.getInputStream()));
            String line;
            StringBuilder output = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
                System.out.println("BACKUP OUTPUT: " + line);
            }
            
            int exitCode = process.waitFor();
            
            if (exitCode == 0 && new File(backupFilePath).exists()) {
                System.out.println("Backup realizado com sucesso: " + backupFileName);
                System.out.println("Arquivo criado: " + backupFilePath);
                cleanOldBackups(type);
            } else {
                System.err.println("Erro ao realizar backup. Exit code: " + exitCode);
                System.err.println("Output: " + output.toString());
                System.err.println("Arquivo existe: " + new File(backupFilePath).exists());
            }
            
        } catch (IOException | InterruptedException e) {
            System.err.println("Erro ao realizar backup: " + e.getMessage());
        }
    }
    
    private String extractDatabaseName(String url) {
        int start = url.indexOf("databaseName=") + 13;
        int end = url.indexOf(";", start);
        if (end == -1) end = url.length();
        return url.substring(start, end);
    }
    
    private void cleanOldBackups(String type) {
        File backupDir = new File(backupPath);
        File[] files = backupDir.listFiles((dir, name) -> name.startsWith("elgisa_backup_" + type));
        
        if (files != null && files.length > 7) {
            java.util.Arrays.sort(files, (f1, f2) -> Long.compare(f2.lastModified(), f1.lastModified()));
            for (int i = 7; i < files.length; i++) {
                files[i].delete();
            }
        }
    }
}