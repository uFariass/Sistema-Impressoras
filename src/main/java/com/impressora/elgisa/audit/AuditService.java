package com.impressora.elgisa.audit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.servlet.http.HttpServletRequest;
import com.impressora.elgisa.repository.AuditLogRepository;
import com.impressora.elgisa.model.AuditLog;

@Service
public class AuditService {
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    public void logAction(String acao, String tabela, Long registroId, String dadosAnteriores, String dadosNovos, HttpServletRequest request) {
        String ipAddress = getClientIpAddress(request);
        AuditLog log = new AuditLog(null, "Sistema", acao, tabela, registroId, dadosAnteriores, dadosNovos, ipAddress);
        auditLogRepository.save(log);
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader == null) {
            return request.getRemoteAddr();
        } else {
            return xForwardedForHeader.split(",")[0];
        }
    }
}