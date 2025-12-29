package com.impressora.elgisa.controller;

import com.impressora.elgisa.model.Impressora;
import com.impressora.elgisa.model.Aba10;
import com.impressora.elgisa.repository.ImpressoraRepository;
import com.impressora.elgisa.repository.Aba10Repository;
import com.impressora.elgisa.dto.ImpressoraComAba10DTO;
import com.impressora.elgisa.dto.ImpressoraListaDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/impressoras")
@CrossOrigin(origins = "*")
public class ImpressoraController {
    
    @Autowired
    private com.impressora.elgisa.security.SecurityService securityService;

    private static final Logger logger = LoggerFactory.getLogger(ImpressoraController.class);

    @Autowired
    private ImpressoraRepository repository;

    @Autowired
    private Aba10Repository aba10Repository;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private com.impressora.elgisa.backup.DatabaseBackupService backupService;
    
    // Rate limiting simples
    private final Map<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
    private final Map<String, Long> lastRequestTime = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_MINUTE = 60;
    private static final long MINUTE_IN_MILLIS = 60000;

    @GetMapping("/test-db")
    public String testDatabase() {
        try {
            Number count = (Number) entityManager.createNativeQuery("SELECT COUNT(*) FROM IMPRESSORAS").getSingleResult();
            return "Conexão OK. Total de registros: " + count.longValue();
        } catch (Exception e) {
            return "Erro na conexão: " + e.getMessage();
        }
    }
    
    @GetMapping("/test-auth")
    public ResponseEntity<?> testAuth(HttpServletRequest request) {
        boolean isAuth = securityService.isUserAuthenticated(request);
        Integer userId = securityService.getUserId(request);
        String userRole = securityService.getUserRole(request);
        
        return ResponseEntity.ok(Map.of(
            "authenticated", isAuth,
            "userId", userId,
            "userRole", userRole,
            "sessionId", request.getSession(false) != null ? request.getSession(false).getId() : "null"
        ));
    }

    @GetMapping("/test-backup")
    public String testBackup() {
        try {
            backupService.performBackup("manual");
            return "Backup executado com sucesso!";
        } catch (Exception e) {
            return "Erro no backup: " + e.getMessage();
        }
    }

    @GetMapping("/simple")
    public ResponseEntity<?> listarSimples() {
        try {
            logger.info("Buscando TODAS as impressoras");
            
            List<Impressora> impressoras = repository.findAll();
            
            logger.info("TODAS as {} impressoras carregadas", impressoras.size());
            return ResponseEntity.ok(impressoras);
        } catch (Exception e) {
            logger.error("Erro na query simples: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Erro: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> listarTodas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            // Paginação para performance
            org.springframework.data.domain.Pageable pageable = 
                org.springframework.data.domain.PageRequest.of(page, size);
            
            org.springframework.data.domain.Page<Impressora> impressorasPage = repository.findAll(pageable);
            
            Map<String, Object> response = Map.of(
                "impressoras", impressorasPage.getContent(),
                "currentPage", page,
                "totalItems", impressorasPage.getTotalElements(),
                "totalPages", impressorasPage.getTotalPages(),
                "hasNext", impressorasPage.hasNext()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Erro ao buscar impressoras: {}", e.getMessage());
            return ResponseEntity.status(500).body("Erro: " + e.getMessage());
        }
    }

    @GetMapping("/teste-aba10/{id}")
    public ResponseEntity<?> testeAba10(@PathVariable Long id) {
        try {
            logger.info("Testando busca Aba10 por ID: {}", id);
            Aba10 aba10 = aba10Repository.findById(id).orElse(null);
            if (aba10 != null) {
                logger.info("Aba10 encontrado - Número de série: '{}'", aba10.getNumeroDeSerie());
                return ResponseEntity.ok(aba10);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Erro no teste Aba10: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Erro: " + e.getMessage());
        }
    }

    @GetMapping("/teste-db2")
    public ResponseEntity<?> testeImpressoras() {
        try {
            logger.info("Teste - Query nativa");
            List<Object[]> result = entityManager.createNativeQuery(
                "SELECT TOP 5 NUMERO_SERIE, NOME_ITEM, NF_SIMPRESS FROM IMPRESSORAS"
            ).getResultList();
            logger.info("Query executada. Registros: {}", result.size());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Erro no teste: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Erro: " + e.getMessage());
        }
    }

    @GetMapping("/serie/{numeroSerie}")
    public ResponseEntity<?> buscarPorNumeroSerie(@PathVariable String numeroSerie) {
        try {
            logger.info("Buscando impressora por série: {}", numeroSerie);
            
            List<Impressora> impressoras = repository.findAllByNumeroSerie(numeroSerie);
            logger.info("Encontradas {} impressoras com série: {}", impressoras.size(), numeroSerie);
            Impressora impressora = impressoras.isEmpty() ? null : impressoras.get(0);
            
            List<Aba10> aba10List = aba10Repository.findAllByNumeroDeSerie(numeroSerie);
            logger.info("Encontrados {} registros Aba10 com série: {}", aba10List.size(), numeroSerie);
            Aba10 aba10 = aba10List.isEmpty() ? null : aba10List.get(0);
            
            if (impressora != null || aba10 != null) {
                logger.info("Retornando resultado: impressora={}, aba10={}", impressora != null, aba10 != null);
                return ResponseEntity.ok(new ImpressoraComAba10DTO(impressora, aba10));
            }
            
            logger.info("Nenhum resultado encontrado para série: {}", numeroSerie);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Erro ao buscar por série: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Erro: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            logger.info("Buscando impressora por ID: {}", id);
            Impressora impressora = repository.findById(id).orElse(null);
            
            if (impressora != null) {
                logger.info("Buscando Aba10 para ID: {}", id);
                Aba10 aba10 = aba10Repository.findById(id).orElse(null);
                logger.info("Aba10 encontrado: {}", aba10 != null ? "Sim" : "Não");
                return ResponseEntity.ok(new ImpressoraComAba10DTO(impressora, aba10));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Erro ao buscar por ID: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Erro: " + e.getMessage());
        }
    }

    @PostMapping("/test-post")
    public ResponseEntity<?> testPost(@RequestBody Map<String, Object> data) {
        logger.info("POST recebido: {}", data);
        return ResponseEntity.ok(Map.of("message", "POST OK", "received", data));
    }
    
    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Map<String, Object> data, HttpServletRequest request) {
        // Verificar autenticação para segurança empresarial
        if (!securityService.isUserAuthenticated(request)) {
            return ResponseEntity.status(401).body(Map.of("error", "Não autenticado"));
        }
        
        // Rate limiting básico
        String clientIp = getClientIp(request);
        if (!isRequestAllowed(clientIp)) {
            return ResponseEntity.status(429).body(Map.of("error", "Muitas requisições. Tente novamente em 1 minuto."));
        }
        
        try {
            logger.info("Dados recebidos para cadastro");
            
            // Validação robusta de entrada
            String numeroSerie = (String) data.get("numeroSerie");
            String nomeItem = (String) data.get("nomeItem");
            
            if (!isValidInput(numeroSerie, 100)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Número de série inválido ou muito longo"));
            }
            if (!isValidInput(nomeItem, 200)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Nome do item inválido ou muito longo"));
            }
            
            // Validar outros campos opcionais
            String nfSimpress = (String) data.get("nfSimpress");
            if (nfSimpress != null && !isValidInput(nfSimpress, 100)) {
                return ResponseEntity.badRequest().body(Map.of("error", "NF Simpress inválida"));
            }
            
            Impressora impressora = new Impressora();
            impressora.setNfSimpress(sanitizeInput((String) data.get("nfSimpress")));
            impressora.setNumeroSerie(sanitizeInput((String) data.get("numeroSerie")));
            impressora.setNomeItem(sanitizeInput((String) data.get("nomeItem")));
            impressora.setValor(sanitizeInput((String) data.get("valor")));
            impressora.setOsInspecao(sanitizeInput((String) data.get("osInspecao")));
            impressora.setOsRevisao(sanitizeInput((String) data.get("osRevisao")));
            impressora.setNfElgisa(sanitizeInput((String) data.get("nfElgisa")));
            impressora.setServico(sanitizeInput((String) data.get("servico")));
            impressora.setStatusReparo(sanitizeInput((String) data.get("statusReparo")));
            impressora.setStatusServico(sanitizeInput((String) data.get("statusServico")));
            impressora.setDataRegistro(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date()));
            
            logger.info("Salvando impressora: {}", impressora.getNumeroSerie());
            Impressora salva = repository.save(impressora);
            logger.info("Salvo com sucesso: {}", salva.getId());
            return ResponseEntity.ok(salva);
        } catch (Exception e) {
            logger.error("Erro ao salvar impressora: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Erro interno do servidor"));
        }
    }
    
    @PostMapping("/batch")
    @Transactional
    public ResponseEntity<?> criarLote(@RequestBody List<Impressora> impressoras, HttpServletRequest request) {
        try {
            logger.info("Cadastrando lote de {} impressoras", impressoras.size());
            
            List<Impressora> salvas = repository.saveAll(impressoras);
            logger.info("Lote cadastrado com sucesso: {} impressoras", salvas.size());
            
            return ResponseEntity.ok(Map.of(
                "message", "Lote cadastrado com sucesso",
                "total", salvas.size(),
                "impressoras", salvas
            ));
        } catch (Exception e) {
            logger.error("Erro ao cadastrar lote: {}", e.getMessage());
            return ResponseEntity.status(500).body("Erro: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Impressora> atualizar(@PathVariable Long id, @RequestBody Impressora impressoraAtualizada, HttpServletRequest request) {
        return repository.findById(id)
                .map(impressora -> {
                    impressora.setNfSimpress(impressoraAtualizada.getNfSimpress());
                    impressora.setNomeItem(impressoraAtualizada.getNomeItem());
                    impressora.setNumeroSerie(impressoraAtualizada.getNumeroSerie());
                    impressora.setValor(impressoraAtualizada.getValor());
                    impressora.setOsInspecao(impressoraAtualizada.getOsInspecao());
                    impressora.setOsRevisao(impressoraAtualizada.getOsRevisao());
                    impressora.setNfElgisa(impressoraAtualizada.getNfElgisa());
                    impressora.setServico(impressoraAtualizada.getServico());
                    impressora.setStatusReparo(impressoraAtualizada.getStatusReparo());
                    impressora.setStatusServico(impressoraAtualizada.getStatusServico());
                    impressora.setDataRegistro(impressoraAtualizada.getDataRegistro());
                    Impressora saved = repository.save(impressora);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<?> buscar(
            @RequestParam String termo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            org.springframework.data.domain.Pageable pageable = 
                org.springframework.data.domain.PageRequest.of(page, size);
            
            org.springframework.data.domain.Page<Impressora> resultado = 
                repository.findByNumeroSerieContainingOrNomeItemContaining(termo, pageable);
            
            return ResponseEntity.ok(Map.of(
                "impressoras", resultado.getContent(),
                "totalItems", resultado.getTotalElements(),
                "totalPages", resultado.getTotalPages()
            ));
        } catch (Exception e) {
            logger.error("Erro na busca: {}", e.getMessage());
            return ResponseEntity.status(500).body("Erro: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id, HttpServletRequest request) {
        try {
            if (repository.existsById(id)) {
                repository.deleteById(id);
                logger.info("Impressora {} deletada", id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Erro ao deletar: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
    
    private String sanitizeInput(String input) {
        if (input == null) return null;
        
        // Remover caracteres perigosos e limitar tamanho
        String sanitized = input.trim()
                   .replaceAll("<", "&lt;")
                   .replaceAll(">", "&gt;")
                   .replaceAll("\"", "&quot;")
                   .replaceAll("'", "&#x27;")
                   .replaceAll("[\\r\\n]", "") // Remove quebras de linha
                   .replaceAll("[^\\p{Print}]", ""); // Remove caracteres não imprimíveis
        
        // Limitar tamanho para evitar ataques de buffer
        if (sanitized.length() > 500) {
            sanitized = sanitized.substring(0, 500);
        }
        
        return sanitized;
    }
    
    private boolean isValidInput(String input, int maxLength) {
        if (input == null || input.trim().isEmpty()) return false;
        if (input.length() > maxLength) return false;
        
        // Verificar padrões suspeitos
        String[] suspiciousPatterns = {"script", "javascript", "vbscript", "onload", "onerror", "<", ">", "DROP", "DELETE", "INSERT", "UPDATE", "SELECT"};
        String lowerInput = input.toLowerCase();
        for (String pattern : suspiciousPatterns) {
            if (lowerInput.contains(pattern.toLowerCase())) {
                return false;
            }
        }
        return true;
    }
    
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
    
    private boolean isRequestAllowed(String clientIp) {
        long currentTime = System.currentTimeMillis();
        
        // Limpar contadores antigos
        Long lastTime = lastRequestTime.get(clientIp);
        if (lastTime != null && (currentTime - lastTime) > MINUTE_IN_MILLIS) {
            requestCounts.remove(clientIp);
            lastRequestTime.remove(clientIp);
        }
        
        // Verificar limite
        AtomicInteger count = requestCounts.computeIfAbsent(clientIp, k -> new AtomicInteger(0));
        lastRequestTime.put(clientIp, currentTime);
        
        return count.incrementAndGet() <= MAX_REQUESTS_PER_MINUTE;
    }
    
    @DeleteMapping("/batch")
    @Transactional
    public ResponseEntity<?> deletarLote(@RequestBody List<Long> ids, HttpServletRequest request) {
        // Verificar autenticação e permissão (apenas Admin)
        if (!securityService.isUserAuthenticated(request)) {
            return ResponseEntity.status(401).body(Map.of("error", "Não autenticado"));
        }
        if (!securityService.hasPermission(request, "Administrador")) {
            return ResponseEntity.status(403).body(Map.of("error", "Sem permissão para exclusão em lote"));
        }
        
        try {
            repository.deleteByIdIn(ids);
            logger.info("Lote de {} impressoras deletado por usuário {}", 
                ids.size(), securityService.getUserId(request));
            return ResponseEntity.ok(Map.of("message", "Lote deletado com sucesso", "total", ids.size()));
        } catch (Exception e) {
            logger.error("Erro ao deletar lote: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Erro interno"));
        }
    }
}