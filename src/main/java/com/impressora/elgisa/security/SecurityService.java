package com.impressora.elgisa.security;

import org.springframework.stereotype.Service;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.regex.Pattern;

@Service
public class SecurityService {
    
    private static final Pattern SQL_INJECTION_PATTERN = 
        Pattern.compile("(?i).*(union|select|insert|update|delete|drop|create|alter|exec|script).*");
    
    public boolean isUserAuthenticated(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return isValidToken(token);
        }
        return false;
    }
    
    private boolean isValidToken(String token) {
        try {
            String decoded = new String(java.util.Base64.getDecoder().decode(token));
            String[] parts = decoded.split("\\|");
            if (parts.length == 4) {
                long timestamp = Long.parseLong(parts[3]);
                long now = System.currentTimeMillis();
                return (now - timestamp) < 3600000; // 1 hora
            }
        } catch (Exception e) {
            return false;
        }
        return false;
    }
    
    public Integer getUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return session != null ? (Integer) session.getAttribute("userId") : null;
    }
    
    public String getUserRole(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return session != null ? (String) session.getAttribute("userRole") : null;
    }
    
    public boolean hasPermission(HttpServletRequest request, String requiredRole) {
        String userRole = getUserRole(request);
        if (userRole == null) return false;
        
        // Admin tem acesso a tudo
        if ("Administrador".equals(userRole)) return true;
        
        // Verificar permissão específica
        return requiredRole.equals(userRole);
    }
    
    public boolean isValidInput(String input) {
        if (input == null || input.trim().isEmpty()) return false;
        
        // Verificar SQL Injection básico
        if (SQL_INJECTION_PATTERN.matcher(input).matches()) {
            return false;
        }
        
        // Verificar caracteres perigosos
        return !input.contains("<script>") && !input.contains("javascript:");
    }
    
    public String sanitizeInput(String input) {
        if (input == null) return null;
        
        return input.trim()
                   .replaceAll("<", "&lt;")
                   .replaceAll(">", "&gt;")
                   .replaceAll("\"", "&quot;")
                   .replaceAll("'", "&#x27;");
    }
}