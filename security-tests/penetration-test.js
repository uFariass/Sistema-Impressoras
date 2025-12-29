// Script de Testes de Penetração Automatizados
const https = require('https');
const http = require('http');

class SecurityTester {
    constructor(baseUrl = 'http://localhost:8082') {
        this.baseUrl = baseUrl;
        this.results = [];
    }

    async runAllTests() {
        console.log('🔒 Iniciando Testes de Segurança...\n');
        
        await this.testSQLInjection();
        await this.testXSS();
        await this.testCSRF();
        await this.testBruteForce();
        await this.testDirectoryTraversal();
        await this.testSecurityHeaders();
        
        this.generateReport();
    }

    async testSQLInjection() {
        console.log('🧪 Testando SQL Injection...');
        const payloads = [
            "' OR '1'='1",
            "'; DROP TABLE users; --",
            "' UNION SELECT * FROM users --",
            "admin'--",
            "' OR 1=1#"
        ];

        for (const payload of payloads) {
            try {
                const response = await this.makeRequest('/api/usuarios/login-email', 'POST', {
                    email: payload,
                    senha: 'test'
                });
                
                if (response.status === 200) {
                    this.results.push({
                        test: 'SQL Injection',
                        status: 'VULNERÁVEL',
                        payload: payload,
                        severity: 'CRÍTICO'
                    });
                }
            } catch (e) {
                // Erro esperado
            }
        }
        console.log('✅ Teste SQL Injection concluído\n');
    }

    async testXSS() {
        console.log('🧪 Testando XSS...');
        const payloads = [
            '<script>alert("XSS")</script>',
            '<img src=x onerror=alert("XSS")>',
            'javascript:alert("XSS")',
            '<svg onload=alert("XSS")>'
        ];

        for (const payload of payloads) {
            try {
                const response = await this.makeRequest('/impressoras', 'POST', {
                    numeroSerie: payload,
                    nomeItem: 'Test'
                });
                
                if (response.body && response.body.includes(payload)) {
                    this.results.push({
                        test: 'XSS',
                        status: 'VULNERÁVEL',
                        payload: payload,
                        severity: 'ALTO'
                    });
                }
            } catch (e) {
                // Erro esperado
            }
        }
        console.log('✅ Teste XSS concluído\n');
    }

    async testBruteForce() {
        console.log('🧪 Testando Proteção Brute Force...');
        let attempts = 0;
        
        for (let i = 0; i < 10; i++) {
            try {
                const response = await this.makeRequest('/api/usuarios/login-email', 'POST', {
                    email: 'admin@test.com',
                    senha: 'wrongpassword'
                });
                attempts++;
            } catch (e) {
                break;
            }
        }

        if (attempts >= 10) {
            this.results.push({
                test: 'Brute Force Protection',
                status: 'VULNERÁVEL',
                details: 'Sem limitação de tentativas',
                severity: 'MÉDIO'
            });
        }
        console.log('✅ Teste Brute Force concluído\n');
    }

    async testCSRF() {
        console.log('🧪 Testando CSRF...');
        try {
            const response = await this.makeRequest('/impressoras', 'POST', {
                numeroSerie: 'CSRF_TEST'
            }, false);
            
            if (response.status === 200) {
                this.results.push({
                    test: 'CSRF Protection',
                    status: 'VULNERÁVEL',
                    details: 'Requisição sem token CSRF aceita',
                    severity: 'MÉDIO'
                });
            }
        } catch (e) {
            // Proteção funcionando
        }
        console.log('✅ Teste CSRF concluído\n');
    }

    async testDirectoryTraversal() {
        console.log('🧪 Testando Directory Traversal...');
        const payloads = [
            '../../../etc/passwd',
            '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
            '....//....//....//etc/passwd'
        ];

        for (const payload of payloads) {
            try {
                const response = await this.makeRequest(`/files/${payload}`, 'GET');
                if (response.status === 200) {
                    this.results.push({
                        test: 'Directory Traversal',
                        status: 'VULNERÁVEL',
                        payload: payload,
                        severity: 'ALTO'
                    });
                }
            } catch (e) {
                // Erro esperado
            }
        }
        console.log('✅ Teste Directory Traversal concluído\n');
    }

    async testSecurityHeaders() {
        console.log('🧪 Testando Security Headers...');
        try {
            const response = await this.makeRequest('/', 'GET');
            const headers = response.headers;
            
            const requiredHeaders = [
                'X-Content-Type-Options',
                'X-Frame-Options',
                'X-XSS-Protection',
                'Content-Security-Policy'
            ];

            for (const header of requiredHeaders) {
                if (!headers[header.toLowerCase()]) {
                    this.results.push({
                        test: 'Security Headers',
                        status: 'VULNERÁVEL',
                        details: `Header ausente: ${header}`,
                        severity: 'BAIXO'
                    });
                }
            }
        } catch (e) {
            console.log('Erro ao testar headers:', e.message);
        }
        console.log('✅ Teste Security Headers concluído\n');
    }

    async makeRequest(path, method = 'GET', data = null, includeAuth = true) {
        return new Promise((resolve, reject) => {
            const url = new URL(path, this.baseUrl);
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'SecurityTester/1.0'
                }
            };

            if (includeAuth) {
                options.headers['Authorization'] = 'Bearer fake-token';
            }

            const req = (url.protocol === 'https:' ? https : http).request(url, options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                });
            });

            req.on('error', reject);

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    generateReport() {
        console.log('📊 RELATÓRIO DE SEGURANÇA\n');
        console.log('='.repeat(50));
        
        if (this.results.length === 0) {
            console.log('✅ Nenhuma vulnerabilidade encontrada!');
        } else {
            console.log(`⚠️  ${this.results.length} vulnerabilidade(s) encontrada(s):\n`);
            
            this.results.forEach((result, index) => {
                console.log(`${index + 1}. ${result.test}`);
                console.log(`   Status: ${result.status}`);
                console.log(`   Severidade: ${result.severity}`);
                if (result.payload) console.log(`   Payload: ${result.payload}`);
                if (result.details) console.log(`   Detalhes: ${result.details}`);
                console.log('');
            });
        }
        
        console.log('='.repeat(50));
        console.log(`Teste concluído em: ${new Date().toISOString()}`);
    }
}

if (require.main === module) {
    const tester = new SecurityTester();
    tester.runAllTests().catch(console.error);
}

module.exports = SecurityTester;