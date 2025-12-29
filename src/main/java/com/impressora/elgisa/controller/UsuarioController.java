package com.impressora.elgisa.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import com.impressora.elgisa.security.RateLimitingService;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class UsuarioController {
    
    // @Autowired
    // private com.impressora.elgisa.security.SecurityService securityService;

    private static final Logger logger = LoggerFactory.getLogger(UsuarioController.class);
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private RateLimitingService rateLimitingService;

    @GetMapping("/usuarios/test")
    public ResponseEntity<?> testUsuarios() {
        return ResponseEntity.ok("API Usuários funcionando!");
    }
    
    @GetMapping("/api/usuarios/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok("API funcionando!");
    }
    
    @GetMapping("/hash1234")
    public ResponseEntity<?> gerarHash1234() {
        try {
            String hash = passwordEncoder.encode("1234");
            return ResponseEntity.ok(Map.of(
                "senha", "1234",
                "hash", hash,
                "sql", "UPDATE Usuarios SET Senha = '" + hash + "' WHERE Email = 'lucas@email.com';"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/test-cors")
    public ResponseEntity<?> testCors(@RequestBody Map<String, String> data) {
        return ResponseEntity.ok(Map.of("message", "CORS funcionando", "received", data));
    }
    
    @GetMapping("/gerar-hash/{senha}")
    public ResponseEntity<?> gerarHash(@PathVariable String senha) {
        try {
            String hash = passwordEncoder.encode(senha);
            return ResponseEntity.ok(Map.of(
                "senha", senha,
                "hash", hash,
                "sql", "UPDATE Usuarios SET Senha = '" + hash + "' WHERE Email = 'lucas@email.com';"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/test-db")
    public ResponseEntity<?> testDatabase() {
        try {
            // Verificar se a tabela Usuarios existe e tem dados
            String sql = "SELECT COUNT(*) FROM Usuarios";
            Number count = (Number) entityManager.createNativeQuery(sql).getSingleResult();
            
            // Verificar se existe o usuário lucas@email.com
            String sqlUser = "SELECT ID, NomeCompleto, Email, Status FROM Usuarios WHERE Email = ?";
            @SuppressWarnings("unchecked")
            List<Object[]> result = entityManager.createNativeQuery(sqlUser)
                .setParameter(1, "lucas@email.com")
                .getResultList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalUsuarios", count.longValue());
            response.put("usuarioLucasEncontrado", !result.isEmpty());
            
            if (!result.isEmpty()) {
                Object[] user = result.get(0);
                response.put("dadosUsuario", Map.of(
                    "id", user[0],
                    "nome", user[1],
                    "email", user[2],
                    "status", user[3]
                ));
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Erro ao testar banco: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Erro: " + e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<?> listarUsuarios() {
        try {
            // Temporariamente sem autenticação
            return ResponseEntity.ok("Lista de usuários temporariamente desabilitada");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Erro interno"));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok(Map.of("message", "Logout realizado com sucesso"));
    }
    
    @PostMapping("/usuarios/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData, HttpServletRequest request) {
        return loginPorEmail(loginData, request);
    }
    
    @PostMapping("/api/usuarios/login-email")
    public ResponseEntity<?> loginPorEmail(@RequestBody Map<String, String> loginData, HttpServletRequest request) {
        String email = loginData.get("email");
        String senha = loginData.get("senha");
        String ipAddress = getClientIpAddress(request);
        
        // Validar entrada
        if (email == null || senha == null || email.trim().isEmpty() || senha.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Preencha email e senha"));
        }
        
        // Rate Limiting - Segurança contra ataques
        try {
            if (!rateLimitingService.isAllowed(ipAddress)) {
                logger.warn("IP bloqueado por excesso de tentativas: {}", ipAddress);
                return ResponseEntity.status(429).body(Map.of(
                    "error", "Acesso Temporariamente Restrito",
                    "message", "Múltiplas tentativas de login detectadas. Acesso bloqueado por 15 minutos.",
                    "details", "Código: SEC-429 | Tentativas: 5/5",
                    "action", "Aguarde 15 minutos para tentar novamente."
                ));
            }
        } catch (Exception e) {
            logger.error("Erro no rate limiting: {}", e.getMessage());
        }
        
        try {
            logger.info("Tentativa de login para email: {}", email);
            
            // Buscar usuário no banco
            String sql = "SELECT ID, NomeCompleto, Usuario, Email, Cargo, Departamento, Status, Senha FROM Usuarios WHERE Email = ?";
            @SuppressWarnings("unchecked")
            List<Object[]> result = entityManager.createNativeQuery(sql)
                .setParameter(1, email.trim().toLowerCase())
                .getResultList();
            
            logger.info("Usuários encontrados no banco: {}", result.size());
            
            if (result.isEmpty()) {
                // Tentar buscar sem lowercase
                @SuppressWarnings("unchecked")
                List<Object[]> result2 = entityManager.createNativeQuery(sql)
                    .setParameter(1, email.trim())
                    .getResultList();
                
                logger.info("Usuários encontrados (sem lowercase): {}", result2.size());
                
                if (result2.isEmpty()) {
                    rateLimitingService.recordFailedAttempt(ipAddress);
                    logger.warn("Email não encontrado no banco: {}", email);
                    return ResponseEntity.status(401).body(Map.of("error", "Email ou senha incorretos"));
                }
                result = result2;
            }
            
            Object[] user = result.get(0);
            String status = (String) user[6];
            logger.info("Usuário encontrado - Status: {}", status);
            
            if (!"Ativo".equals(status)) {
                logger.warn("Usuário inativo tentando login: {}", email);
                return ResponseEntity.status(401).body(Map.of("error", "Email ou senha incorretos"));
            }
            String senhaHash = (String) user[7];
            
            // Verificar senha
            boolean senhaValida = false;
            try {
                if (senhaHash != null && senhaHash.startsWith("$2a$")) {
                    // Senha criptografada com BCrypt
                    senhaValida = passwordEncoder.matches(senha, senhaHash);
                } else {
                    // Senha em texto simples (migrar para BCrypt)
                    senhaValida = senha.equals(senhaHash);
                    logger.warn("Usuário {} usando senha não criptografada", email);
                }
            } catch (Exception e) {
                logger.error("Erro na verificação de senha: {}", e.getMessage());
                senhaValida = false;
            }
            
            if (!senhaValida) {
                // Registrar tentativa falhada
                rateLimitingService.recordFailedAttempt(ipAddress);
                logger.warn("Tentativa de login com senha incorreta para: {}", email);
                return ResponseEntity.status(401).body(Map.of("error", "Email ou senha incorretos"));
            }
            
            // Login bem-sucedido
            rateLimitingService.recordSuccessfulLogin(ipAddress);
            
            // Gerar token JWT simples (base64 com dados do usuário)
            String tokenData = user[0] + "|" + user[3] + "|" + user[4] + "|" + System.currentTimeMillis();
            String token = java.util.Base64.getEncoder().encodeToString(tokenData.getBytes());
            logger.debug("Token gerado para usuário: {}", user[3]);
            
            // Dados de resposta (sem senha)
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user[0]);
            userData.put("nomeCompleto", user[1]);
            userData.put("usuario", user[2]);
            userData.put("email", user[3]);
            userData.put("cargo", user[4]);
            userData.put("departamento", user[5]);
            userData.put("status", user[6]);
            userData.put("token", token);
            
            logger.info("Login bem-sucedido para usuário: {} - IP: {}", email, ipAddress);
            return ResponseEntity.ok(userData);
            
        } catch (Exception e) {
            logger.error("Erro interno no login para {}: {}", email, e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Erro no sistema. Tente novamente"));
        }
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}