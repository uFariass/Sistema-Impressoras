// Gerenciamento seguro de autenticação
class AuthManager {
    constructor() {
        this.tokenKey = 'elgisa_token';
        this.userKey = 'elgisa_user';
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutos
        this.setupSessionMonitoring();
    }

    // Validar token JWT
    isValidToken(token) {
        if (!token) return false;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Date.now() / 1000;
            return payload.exp > now;
        } catch {
            return false;
        }
    }

    // Login seguro
    async login(credentials) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            if (response.ok) {
                const data = await response.json();
                this.setSession(data.token, data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, error: 'Credenciais inválidas' };
            }
        } catch (error) {
            return { success: false, error: 'Erro de conexão' };
        }
    }

    // Configurar sessão
    setSession(token, user) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
        localStorage.setItem('session_start', Date.now().toString());
    }

    // Verificar autenticação
    isAuthenticated() {
        const token = localStorage.getItem(this.tokenKey);
        const sessionStart = localStorage.getItem('session_start');
        
        if (!token || !this.isValidToken(token)) {
            this.logout();
            return false;
        }

        // Verificar timeout de sessão
        if (sessionStart && Date.now() - parseInt(sessionStart) > this.sessionTimeout) {
            this.logout();
            return false;
        }

        return true;
    }

    // Obter token para requisições
    getAuthToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // Logout seguro
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem('session_start');
        window.location.href = 'index.html';
    }

    // Monitoramento de sessão
    setupSessionMonitoring() {
        // Verificar a cada 5 minutos
        setInterval(() => {
            if (!this.isAuthenticated()) {
                this.logout();
            }
        }, 5 * 60 * 1000);

        // Logout automático em caso de inatividade
        let lastActivity = Date.now();
        const inactivityTimeout = 15 * 60 * 1000; // 15 minutos

        document.addEventListener('click', () => lastActivity = Date.now());
        document.addEventListener('keypress', () => lastActivity = Date.now());

        setInterval(() => {
            if (Date.now() - lastActivity > inactivityTimeout) {
                this.logout();
            }
        }, 60 * 1000);
    }
}

// Instância global
const authManager = new AuthManager();