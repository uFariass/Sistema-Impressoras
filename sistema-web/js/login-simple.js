const API_BASE_URL = 'http://localhost:8082';

console.log('Script login-simple.js carregado!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, configurando evento de login');
    
    const form = document.getElementById('loginForm');
    if (!form) {
        console.error('Formulário loginForm não encontrado!');
        return;
    }
    
    form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    
    console.log('Tentando login com:', email);
    
    if (!email || !senha) {
        showError('Preencha email e senha');
        return;
    }
    
    try {
        console.log('Fazendo requisição para:', `${API_BASE_URL}/api/usuarios/login-email`);
        
        const response = await fetch(`${API_BASE_URL}/api/usuarios/login-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });
        
        console.log('Resposta recebida:', response.status);
        
        if (response.ok) {
            const userData = await response.json();
            console.log('Login bem-sucedido:', userData);
            
            const tipoUsuario = userData.cargo && userData.cargo.toLowerCase().includes('admin') ? 'admin' : 'usuario';
            
            const userInfo = {
                id: userData.id,
                nomeCompleto: userData.nomeCompleto,
                usuario: userData.usuario,
                email: userData.email,
                cargo: userData.cargo,
                departamento: userData.departamento,
                status: userData.status,
                tipoUsuario: tipoUsuario
            };
            
            console.log('Salvando usuário no localStorage');
            localStorage.setItem('user', JSON.stringify(userInfo));
            
            console.log('Redirecionando para dashboard...');
            window.location.href = 'dashboard.html';
            
        } else {
            try {
                const errorData = await response.json();
                console.log('Erro de login:', errorData);
                
                if (response.status === 429) {
                    // Rate limiting ativo
                    showError(`⚠️ ${errorData.message || 'Muitas tentativas de login'}\n\n${errorData.details || 'Aguarde antes de tentar novamente'}`, true);
                } else {
                    showError(errorData.error || 'Email ou senha inválidos');
                }
            } catch (e) {
                const errorText = await response.text();
                console.log('Erro de login (texto):', errorText);
                showError('Email ou senha inválidos');
            }
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showError('Erro de conexão com o servidor');
    }
    });
});

function showError(message, isRateLimit = false) {
    const errorDiv = document.getElementById('errorMessage');
    
    if (isRateLimit) {
        // Mensagem de rate limiting - mais destacada e permanente
        errorDiv.innerHTML = `
            <div style="position: relative;">
                ${message.replace(/\n/g, '<br>')}
                <br><br>
                <button onclick="this.parentElement.parentElement.style.display='none'" 
                        style="background: white; color: #ff6b6b; border: none; padding: 8px 15px; 
                               border-radius: 3px; cursor: pointer; font-weight: bold;">
                    Fechar
                </button>
            </div>
        `;
        errorDiv.style.backgroundColor = '#ff6b6b';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '20px';
        errorDiv.style.borderRadius = '8px';
        errorDiv.style.fontSize = '15px';
        errorDiv.style.lineHeight = '1.5';
        errorDiv.style.border = '2px solid #ff5252';
        errorDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        errorDiv.style.textAlign = 'center';
        
        // Não remove automaticamente - usuário deve fechar
    } else {
        // Mensagem normal
        errorDiv.textContent = message;
        errorDiv.style.backgroundColor = '#f8d7da';
        errorDiv.style.color = '#721c24';
        errorDiv.style.padding = '10px';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.fontSize = '14px';
        errorDiv.style.lineHeight = '1.4';
        errorDiv.style.border = '1px solid #f5c6cb';
        errorDiv.style.boxShadow = '';
        errorDiv.style.textAlign = 'left';
        
        // Remove automaticamente após 5 segundos
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
    
    errorDiv.style.display = 'block';
}