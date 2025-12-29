package com.impressora.elgisa.security;

import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class TwoFactorAuth {
    
    private final ConcurrentHashMap<String, String> activeCodes = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final SecureRandom random = new SecureRandom();
    
    public String generateCode(String email) {
        String code = String.format("%06d", random.nextInt(1000000));
        activeCodes.put(email, code);
        
        // Código expira em 5 minutos
        scheduler.schedule(() -> activeCodes.remove(email), 5, TimeUnit.MINUTES);
        
        return code;
    }
    
    public boolean validateCode(String email, String code) {
        String storedCode = activeCodes.get(email);
        if (storedCode != null && storedCode.equals(code)) {
            activeCodes.remove(email);
            return true;
        }
        return false;
    }
    
    public void invalidateCode(String email) {
        activeCodes.remove(email);
    }
}