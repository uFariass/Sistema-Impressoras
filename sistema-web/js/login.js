const API_BASE_URL = 'http://localhost:8082';
let loginAttempts = 0;
const MAX_ATTEMPTS = 5;

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    
    // Validar entrada básica
    if (!email || !senha) {
        showError('Preencha email e senha');
        return;
    }
    
    loginAttempts++;
    
    if (loginAttempts > MAX_ATTEMPTS) {
        showError('Conta temporariamente bloqueada por excesso de tentativas.');
        SecurityUtils.logSecurityEvent('account_locked', { email });
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/usuarios/login-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });
        
        if (response.ok) {
            const userData = await response.json();
            // Resetar tentativas em caso de sucesso
            loginAttempts = 0;
            
            // Resetar tentativas em caso de sucesso
            loginAttempts = 0;
            
            const tipoUsuario = userData.cargo && userData.cargo.toLowerCase().includes('admin') ? 'admin' : 'usuario';
            
            // Usar sistema de autenticação seguro
            const userInfo = {
                id: userData.id,
                nomeCompleto: userData.nomeCompleto,
                usuario: userData.usuario,
                email: userData.email,
                cargo: userData.cargo,
                departamento: userData.departamento,
                status: userData.status,
                tipoUsuario: tipoUsuario,
                token: userData.token
            };
            
            console.log('Salvando usuário com token:', userInfo);
            
            // Salvar dados do usuário
            localStorage.setItem('user', JSON.stringify(userInfo));
            
            console.log('Redirecionando para dashboard...');
            
            // Redirecionar para dashboard
            window.location.href = 'dashboard.html';
        } else {
            const errorData = await response.json();
            if (response.status === 429) {
                // Erro de rate limiting - mostrar mensagem profissional
                showEnterpriseError(errorData.error, errorData.message, errorData.details, errorData.action, 12000);
            } else {
                // Padronizar todas as outras mensagens de erro
                const errorMsg = errorData.error || errorData.message || 'Credenciais inválidas';
                showError(errorMsg);
            }
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showError('Erro de conexão. Verifique sua internet e tente novamente.');
    }
});

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showEnterpriseError(title, message, details, action, duration = 12000) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.innerHTML = `
        <div style="display: flex; align-items: start; gap: 12px;">
            <svg style="width: 24px; height: 24px; color: #dc2626; flex-shrink: 0; margin-top: 2px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <div style="flex: 1;">
                <div style="font-weight: 600; color: #111827; font-size: 15px; margin-bottom: 8px;">${title}</div>
                <div style="color: #374151; line-height: 1.5; margin-bottom: 12px; font-size: 14px;">${message}</div>
                <div style="background: #f9fafb; border-left: 3px solid #dc2626; padding: 10px 12px; margin-bottom: 10px; border-radius: 4px;">
                    <div style="font-size: 13px; color: #6b7280; font-weight: 500;">${action}</div>
                </div>
                <div style="font-size: 12px; color: #9ca3af; font-family: monospace; padding-top: 8px; border-top: 1px solid #e5e7eb;">${details}</div>
            </div>
        </div>
    `;
    errorDiv.style.display = 'block';
    errorDiv.style.padding = '20px';
    errorDiv.style.maxWidth = '480px';
    errorDiv.style.borderRadius = '8px';
    errorDiv.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
        errorDiv.style.padding = '';
        errorDiv.style.maxWidth = '';
        errorDiv.style.borderRadius = '';
        errorDiv.style.boxShadow = '';
    }, duration);
}