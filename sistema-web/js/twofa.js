// Sistema 2FA Frontend
class TwoFactorAuth {
    constructor() {
        this.isEnabled = false;
        this.pendingLogin = null;
    }

    async requestCode(email) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/2fa/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            if (response.ok) {
                this.showCodeInput();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao solicitar código 2FA:', error);
            return false;
        }
    }

    async validateCode(email, code) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/2fa/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });
            
            return response.ok;
        } catch (error) {
            console.error('Erro ao validar código 2FA:', error);
            return false;
        }
    }

    showCodeInput() {
        const modal = document.createElement('div');
        modal.className = 'twofa-modal';
        modal.innerHTML = `
            <div class="twofa-content">
                <h3>Verificação em Duas Etapas</h3>
                <p>Digite o código de 6 dígitos enviado para seu email:</p>
                <input type="text" id="tfaCode" maxlength="6" placeholder="000000">
                <div class="twofa-actions">
                    <button onclick="this.closest('.twofa-modal').remove()">Cancelar</button>
                    <button onclick="twoFA.submitCode()">Verificar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('tfaCode').focus();
    }

    async submitCode() {
        const code = document.getElementById('tfaCode').value;
        if (code.length !== 6) {
            alert('Código deve ter 6 dígitos');
            return;
        }

        if (this.pendingLogin && await this.validateCode(this.pendingLogin.email, code)) {
            // Completar login
            authManager.setSession(this.pendingLogin.token, this.pendingLogin.user);
            window.location.href = 'dashboard.html';
        } else {
            alert('Código inválido');
        }
        
        document.querySelector('.twofa-modal').remove();
    }
}

const twoFA = new TwoFactorAuth();