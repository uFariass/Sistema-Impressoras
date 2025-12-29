// Utilitários de segurança
class SecurityUtils {
    
    // Sanitizar entrada HTML
    static sanitizeHTML(input) {
        if (typeof input !== 'string') return input;
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Validar entrada SQL
    static validateSQLInput(input) {
        if (typeof input !== 'string') return false;
        
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
            /(--|\/\*|\*\/|;|'|")/,
            /(\bOR\b|\bAND\b).*(\b=\b|\b<\b|\b>\b)/i
        ];
        
        return !sqlPatterns.some(pattern => pattern.test(input));
    }

    // Validar formato de dados
    static validateInput(value, type) {
        if (!value && value !== 0) return false;
        
        switch (type) {
            case 'numeroSerie':
                return /^[A-Za-z0-9\-_]{3,50}$/.test(value);
            case 'nfSimpress':
                return /^[0-9]{1,20}$/.test(value);
            case 'valor':
                return /^\d+(\.\d{1,2})?$/.test(value);
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'texto':
                return value.length <= 255 && this.validateSQLInput(value);
            default:
                return this.validateSQLInput(value);
        }
    }

    // Rate limiting simples
    static rateLimiter = new Map();
    
    static checkRateLimit(key, maxRequests = 10, windowMs = 60000) {
        const now = Date.now();
        const windowStart = now - windowMs;
        
        if (!this.rateLimiter.has(key)) {
            this.rateLimiter.set(key, []);
        }
        
        const requests = this.rateLimiter.get(key);
        const validRequests = requests.filter(time => time > windowStart);
        
        if (validRequests.length >= maxRequests) {
            return false;
        }
        
        validRequests.push(now);
        this.rateLimiter.set(key, validRequests);
        return true;
    }

    // Criptografia simples para dados sensíveis
    static encryptData(data, key = 'elgisa_key_2024') {
        try {
            return btoa(JSON.stringify(data));
        } catch {
            return null;
        }
    }

    static decryptData(encryptedData, key = 'elgisa_key_2024') {
        try {
            return JSON.parse(atob(encryptedData));
        } catch {
            return null;
        }
    }

    // Validar permissões
    static hasPermission(user, action) {
        if (!user || !user.tipoUsuario) return false;
        
        const permissions = {
            'admin': ['read', 'write', 'delete', 'export'],
            'user': ['read']
        };
        
        return permissions[user.tipoUsuario]?.includes(action) || false;
    }

    // Log de segurança
    static logSecurityEvent(event, details = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event,
            user: (typeof currentUser !== 'undefined' && currentUser) ? currentUser.usuario : 'anonymous',
            ip: 'client',
            details
        };
        
        console.warn('SECURITY EVENT:', logEntry);
        
        // Em produção, enviar para servidor
        // fetch('/api/security-log', { method: 'POST', body: JSON.stringify(logEntry) });
    }
}