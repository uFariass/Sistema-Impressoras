package com.impressora.elgisa.security;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class RateLimitingService {
    
    private final ConcurrentHashMap<String, LoginAttempt> loginAttempts = new ConcurrentHashMap<>();
    private final int MAX_ATTEMPTS = 5; // Máximo 5 tentativas
    private final int BLOCK_DURATION_MINUTES = 15; // Bloquear por 15 minutos
    
    public boolean isAllowed(String ipAddress) {
        try {
            LoginAttempt attempt = loginAttempts.get(ipAddress);
            
            if (attempt == null) {
                return true; // Primeira tentativa
            }
            
            // Se passou do tempo de bloqueio, resetar
            if (attempt.isExpired()) {
                loginAttempts.remove(ipAddress);
                return true;
            }
            
            // Verificar se está bloqueado
            return attempt.getAttempts() < MAX_ATTEMPTS;
            
        } catch (Exception e) {
            System.out.println("Erro no rate limiting, permitindo acesso: " + e.getMessage());
            return true; // FALLBACK: Se der erro, permite acesso
        }
    }
    
    public void recordFailedAttempt(String ipAddress) {
        try {
            LoginAttempt attempt = loginAttempts.computeIfAbsent(ipAddress, k -> new LoginAttempt());
            attempt.incrementAttempts();
            System.out.println("Tentativa falhada registrada para IP: " + ipAddress + " (Total: " + attempt.getAttempts() + ")");
        } catch (Exception e) {
            System.out.println("Erro ao registrar tentativa falhada: " + e.getMessage());
        }
    }
    
    public void recordSuccessfulLogin(String ipAddress) {
        try {
            loginAttempts.remove(ipAddress); // Limpar tentativas após sucesso
            System.out.println("Login bem-sucedido, limpando tentativas para IP: " + ipAddress);
        } catch (Exception e) {
            System.out.println("Erro ao limpar tentativas: " + e.getMessage());
        }
    }
    
    private static class LoginAttempt {
        private final AtomicInteger attempts = new AtomicInteger(0);
        private LocalDateTime firstAttempt = LocalDateTime.now();
        
        public int incrementAttempts() {
            return attempts.incrementAndGet();
        }
        
        public int getAttempts() {
            return attempts.get();
        }
        
        public boolean isExpired() {
            return ChronoUnit.MINUTES.between(firstAttempt, LocalDateTime.now()) > 15;
        }
    }
}