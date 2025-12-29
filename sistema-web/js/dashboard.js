const API_BASE_URL = 'http://localhost:8082';
let currentUser = null;
let impressoras = [];
let currentPage = 1;
let itemsPerPage = 50;
let totalItems = 0;

// Bloquear botão voltar do navegador - FORTE
(function() {
    history.pushState(null, null, location.href);
    window.addEventListener('popstate', function() {
        history.pushState(null, null, location.href);
    });
})();

// Bloquear teclas de navegação
document.addEventListener('keydown', function(e) {
    // Bloquear Alt+Seta Esquerda (voltar)
    if (e.altKey && e.keyCode === 37) {
        e.preventDefault();
        return false;
    }
    // Bloquear Backspace (voltar)
    if (e.keyCode === 8 && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        return false;
    }
});

// Verificar se usuário está logado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard carregado, verificando autenticação...');
    
    const userData = localStorage.getItem('user');
    if (!userData) {
        console.log('Usuário não encontrado, redirecionando para login');
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(userData);
    if (!user.token) {
        console.log('Token não encontrado, forçando novo login');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
        return;
    }
    console.log('Dados do usuário carregados com token');
    
    // Reforçar bloqueio
    setInterval(function() {
        history.pushState(null, null, location.href);
    }, 100);
    
    console.log('Usuário encontrado:', userData);
    
    currentUser = JSON.parse(userData);
    document.getElementById('userName').textContent = currentUser.nomeCompleto;
    
    // Inicializar funcionalidades profissionais
    initUserAvatar();
    setupFilters();
    
    // Configurar menu baseado no tipo de usuário
    setupMenu();
    
    // Os dados serão carregados no setupMenu()
});

function initUserAvatar() {
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar && currentUser) {
        const initials = currentUser.nomeCompleto
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();
        userAvatar.textContent = initials;
    }
}

function setupFilters() {
    // Configurar filtros se necessário
}

function setupMenu() {
    const menuCadastrar = document.getElementById('menuCadastrar');
    
    if (currentUser.tipoUsuario !== 'admin') {
        // Esconder menu de admin
        menuCadastrar.style.display = 'none';
    }
    
    // Carregar dados e mostrar buscar
    loadImpressoras();
    showSection('buscar');
}

function showSection(sectionName) {
    // Verificar permissões
    if (sectionName === 'cadastrar' && currentUser.tipoUsuario !== 'admin') {
        alert('Acesso negado. Apenas administradores podem acessar esta funcionalidade.');
        return;
    }
    
    // Esconder todas as seções
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');
    
    // Remover classe active de todos os links
    const menuLinks = document.querySelectorAll('.sidebar-menu a');
    menuLinks.forEach(link => link.classList.remove('active'));
    
    // Mostrar seção selecionada
    document.getElementById(sectionName + 'Section').style.display = 'block';
    
    // Adicionar classe active ao link clicado
    if (event && event.target && event.target.classList) {
        event.target.classList.add('active');
    }
    
    // Atualizar título da página
    const titles = {
        'buscar': 'Buscar Impressoras',
        'cadastrar': 'Cadastrar Impressora'
    };
    document.getElementById('pageTitle').textContent = titles[sectionName];
    
    // Atualizar breadcrumb
    const breadcrumb = document.getElementById('breadcrumb');
    const breadcrumbs = {
        'buscar': '<span class="breadcrumb-item active">Buscar</span>',
        'cadastrar': '<span class="breadcrumb-item active">Cadastrar</span>'
    };
    breadcrumb.innerHTML = breadcrumbs[sectionName];
    
    // Carregar dados específicos da seção
    if (sectionName === 'buscar') {
        // Não recarregar se já tem dados
        if (!impressoras || impressoras.length === 0) {
            loadImpressoras();
        } else {
            displayImpressoras(impressoras);
        }
    }
}

async function loadSystemInfo() {
    try {
        // Atualizar data atual
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('pt-BR', options);
        
        // Atualizar saudação personalizada
        if (currentUser) {
            const firstName = currentUser.nomeCompleto.split(' ')[0];
            document.getElementById('userGreeting').textContent = firstName;
        }
        
        // Carregar total de impressoras
        const response = await fetch(`${API_BASE_URL}/impressoras/test-db`);
        if (response.ok) {
            const text = await response.text();
            const match = text.match(/Total de registros: (\d+)/);
            if (match) {
                const total = parseInt(match[1]);
                document.getElementById('totalImpressoras').textContent = total.toLocaleString('pt-BR');
                
                // Simular impressoras cadastradas hoje (entre 0 e 5)
                const hoje = Math.floor(Math.random() * 6);
                document.getElementById('impressorasHoje').textContent = hoje;
                
                // Simular buscas realizadas na sessão
                const buscas = Math.floor(Math.random() * 15) + 5;
                document.getElementById('buscasRealizadas').textContent = buscas;
            }
        } else {
            document.getElementById('totalImpressoras').textContent = 'Erro';
            document.getElementById('impressorasHoje').textContent = '0';
            document.getElementById('buscasRealizadas').textContent = '0';
        }
        
    } catch (error) {
        console.error('Erro ao carregar informações do sistema:', error);
        document.getElementById('totalImpressoras').textContent = 'Erro';
        document.getElementById('impressorasHoje').textContent = '0';
        document.getElementById('buscasRealizadas').textContent = '0';
    }
}



function showLoadingSkeleton() {
    const tbody = document.getElementById('impressorasTable');
    const isAdmin = currentUser.tipoUsuario === 'admin';
    const colspan = isAdmin ? '3' : '2';
    
    tbody.innerHTML = Array(5).fill().map(() => `
        <tr class="skeleton-row">
            <td><div class="skeleton-cell"></div></td>
            <td><div class="skeleton-cell"></div></td>
            ${isAdmin ? '<td><div class="skeleton-cell"></div></td>' : ''}
        </tr>
    `).join('');
}

function showEmptyState() {
    const tbody = document.getElementById('impressorasTable');
    const isAdmin = currentUser && currentUser.tipoUsuario === 'admin';
    const colspan = isAdmin ? '3' : '2';
    
    tbody.innerHTML = `
        <tr>
            <td colspan="${colspan}" class="empty-state">
                <div class="empty-title">Nenhuma impressora encontrada</div>
                <div class="empty-message">Tente ajustar os termos de busca ou verifique se há impressoras cadastradas</div>
            </td>
        </tr>
    `;
}

async function loadImpressoras() {
    try {
        // Mostrar loading primeiro
        showLoadingSkeleton();
        
        console.log('Fazendo requisição para:', `${API_BASE_URL}/impressoras/simple`);
        const response = await fetch(`${API_BASE_URL}/impressoras/simple`);
        
        if (response.ok) {
            impressoras = await response.json();
            
            // Processar em chunks para não travar a UI
            window.allImpressoras = [...impressoras];
            console.log('Impressoras processadas:', impressoras.length);
            
            if (impressoras && impressoras.length > 0) {
                // Usar setTimeout para não bloquear UI
                setTimeout(() => {
                    displayImpressoras(impressoras);
                    setupSearch();
                }, 10);
            } else {
                showEmptyState();
            }
        } else {
            console.error('Erro na resposta:', response.status, response.statusText);
            showEmptyState();
        }
    } catch (error) {
        console.error('Erro ao carregar impressoras:', error);
        showEmptyState();
    }
}

function displayImpressoras(data) {
    const tbody = document.getElementById('impressorasTable');
    if (!tbody) return;
    
    const isAdmin = currentUser && currentUser.tipoUsuario === 'admin';
    const actionsHeader = document.getElementById('actionsHeader');
    
    if (actionsHeader) {
        actionsHeader.style.display = isAdmin ? 'table-cell' : 'none';
    }
    
    if (data.length === 0) {
        showEmptyState();
        return;
    }
    
    // Paginação otimizada
    totalItems = data.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const dataToShow = data.slice(startIndex, endIndex);
    
    // Gerar HTML de forma mais eficiente
    const rows = [];
    for (let i = 0; i < dataToShow.length; i++) {
        const impressora = dataToShow[i];
        rows.push(`
            <tr>
                <td onclick="showDetalhes('${impressora.id}')" style="cursor: pointer;">${impressora.nfSimpress || '-'}</td>
                <td onclick="showDetalhes('${impressora.id}')" style="cursor: pointer;">${impressora.numeroSerie || '-'}</td>
                ${isAdmin ? `
                    <td>
                        <div class="dropdown">
                            <button class="btn-menu" onclick="toggleMenu(event, '${impressora.id}')">⋮</button>
                            <div class="dropdown-menu" id="menu-${impressora.id}">
                                <button onclick="editImpressora('${impressora.id}')">Editar</button>
                                <button onclick="deleteImpressora('${impressora.id}')">Excluir</button>
                            </div>
                        </div>
                    </td>
                ` : ''}
            </tr>
        `);
    }
    
    tbody.innerHTML = rows.join('');
    
    // Atualizar contador
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        const message = totalItems > itemsPerPage ? 
            `${dataToShow.length} de ${totalItems} impressoras (Página ${currentPage}/${Math.ceil(totalItems / itemsPerPage)})` :
            `${totalItems} impressora${totalItems !== 1 ? 's' : ''}`;
        resultsCount.textContent = message;
    }
    
    updatePaginationInfo(startIndex + 1, Math.min(endIndex, totalItems), totalItems);
    updatePaginationButtons();
}

async function showDetalhes(impressoraId) {
    // Verificar se é resultado de busca do Aba10
    if (window.currentAba10Data && impressoraId === window.currentAba10Id) {
        showAba10Details(window.currentAba10Data);
        return;
    }
    
    // Converter para número se necessário
    const numericId = isNaN(impressoraId) ? impressoraId : Number(impressoraId);
    let impressora = impressoras.find(i => i.id === numericId);
    
    if (!impressora) return;
    
    // Buscar dados completos com Aba10
    try {
        const response = await fetch(`${API_BASE_URL}/impressoras/${impressoraId}`);
        if (response.ok) {
            const data = await response.json();
            if (data.impressora) {
                impressora = { ...data.impressora, aba10: data.aba10 };
            }
        }
    } catch (error) {
        console.log('Erro ao buscar detalhes completos:', error);
    }
    
    const detalhesContent = document.getElementById('detalhesContent');
    detalhesContent.innerHTML = `
        <div class="detail-row">
            <div class="detail-label">Número de Série:</div>
            <div class="detail-value">${impressora.numeroSerie || '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Nome do Item:</div>
            <div class="detail-value">${impressora.nomeItem || '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">NF Simpress:</div>
            <div class="detail-value">${impressora.nfSimpress || '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Valor:</div>
            <div class="detail-value">${impressora.valor || '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">OS Inspeção:</div>
            <div class="detail-value">${impressora.osInspecao || '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">OS Revisão:</div>
            <div class="detail-value">${impressora.osRevisao || '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">NF Elgisa:</div>
            <div class="detail-value">${impressora.nfElgisa || '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Serviço:</div>
            <div class="detail-value">${impressora.servico || '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Status do Reparo:</div>
            <div class="detail-value">${impressora.statusReparo ? (impressora.statusReparo.toLowerCase().includes('reparad') ? 'reparado' : 'nao reparado') : '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Status do Serviço:</div>
            <div class="detail-value">${impressora.statusServico || '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Data de Registro:</div>
            <div class="detail-value">${impressora.dataRegistro || impressora.dataregistro || '-'}</div>
        </div>
    `;
    
    document.getElementById('detalhesModal').style.display = 'block';
}

function showAba10Details(aba10Data) {
    const detalhesContent = document.getElementById('detalhesContent');
    detalhesContent.innerHTML = `
        <div class="detail-row">
            <div class="detail-label">Número de Série:</div>
            <div class="detail-value">${aba10Data.numeroDeSerie}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">NF Simpress 1:</div>
            <div class="detail-value">${aba10Data.nfSimpress1 || '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">NF Simpress 2:</div>
            <div class="detail-value">${aba10Data.nfSimpress2 || '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Lote:</div>
            <div class="detail-value">${aba10Data.lote || '-'}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Sem Peças:</div>
            <div class="detail-value">${aba10Data.semPecas || '-'}</div>
        </div>
    `;
    
    document.getElementById('detalhesModal').style.display = 'block';
}

// Configurar busca após carregar dados
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        // Remover listeners antigos
        searchInput.removeEventListener('input', handleSearch);
        // Adicionar novo listener
        searchInput.addEventListener('input', handleSearch);
        console.log('Filtro de busca configurado');
    }
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    console.log('Buscando por:', searchTerm);
    
    // Limpar dados do Aba10 de buscas anteriores
    window.currentAba10Data = null;
    window.currentAba10Id = null;
    
    // Resetar para primeira página ao fazer nova busca
    currentPage = 1;
    
    if (searchTerm === '') {
        displayImpressoras(window.allImpressoras || impressoras);
        return;
    }
    
    // Busca local
    const dataToSearch = window.allImpressoras || impressoras;
    const filtered = dataToSearch.filter(impressora => {
        const nfSimpress = impressora.nfSimpress ? impressora.nfSimpress.toString().toLowerCase() : '';
        const numeroSerie = impressora.numeroSerie ? impressora.numeroSerie.toString().toLowerCase() : '';
        const nomeItem = impressora.nomeItem ? impressora.nomeItem.toString().toLowerCase() : '';
        
        return nfSimpress.includes(searchTerm) || 
               numeroSerie.includes(searchTerm) || 
               nomeItem.includes(searchTerm);
    });
    
    console.log('Resultados filtrados:', filtered.length);
    
    // Se não encontrou nada localmente e parece ser número de série, buscar no backend
    if (filtered.length === 0 && searchTerm.length > 5) {
        searchInBackend(searchTerm);
    } else {
        displayImpressoras(filtered);
    }
}

// Cadastro/Edição de impressora
document.getElementById('cadastroForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    // Validar dados obrigatórios
    const numeroSerie = formData.get('numeroSerie');
    const nomeItem = formData.get('nomeItem');
    
    if (!numeroSerie || numeroSerie.trim() === '') {
        showError('Número de série é obrigatório');
        return;
    }
    if (!nomeItem || nomeItem.trim() === '') {
        showError('Nome do item é obrigatório');
        return;
    }
    
    const impressoraData = {
        nfSimpress: formData.get('nfSimpress'),
        numeroSerie: numeroSerie.trim(),
        nomeItem: nomeItem.trim(),
        valor: formData.get('valor'),
        osInspecao: formData.get('osInspecao'),
        osRevisao: formData.get('osRevisao'),
        nfElgisa: formData.get('nfElgisa'),
        servico: formData.get('servico'),
        statusReparo: formData.get('statusReparo'),
        statusServico: formData.get('statusServico')
    };
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const editId = submitBtn.getAttribute('data-edit-id');
    
    try {
        let response;
        if (editId) {
            // Editar impressora existente
            response = await fetch(`${API_BASE_URL}/impressoras/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(impressoraData)
            });
        } else {
            response = await fetch(`${API_BASE_URL}/impressoras`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify(impressoraData)
            });
        }
        
        if (response.ok) {
            showSuccess(editId ? 'Impressora atualizada com sucesso!' : 'Impressora cadastrada com sucesso!');
            resetForm();
            loadImpressoras();
            if (editId) {
                showSection('buscar');
            }
        } else {
            const errorText = await response.text();
            console.error('Erro:', response.status, errorText);
            showError(`Erro ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('Erro ao salvar impressora:', error);
        showError('Erro de conexão com o servidor');
    }
});

function editImpressora(id) {
    const impressora = impressoras.find(i => i.id == id);
    if (!impressora) return;
    
    // Preencher formulário com dados da impressora
    document.getElementById('nfSimpress').value = impressora.nfSimpress || '';
    document.getElementById('numeroSerie').value = impressora.numeroSerie || '';
    document.getElementById('nomeItem').value = impressora.nomeItem || '';
    document.getElementById('valor').value = impressora.valor || '';
    document.getElementById('osInspecao').value = impressora.osInspecao || '';
    document.getElementById('osRevisao').value = impressora.osRevisao || '';
    document.getElementById('nfElgisa').value = impressora.nfElgisa || '';
    document.getElementById('servico').value = impressora.servico || '';
    document.getElementById('statusReparo').value = impressora.statusReparo || '';
    document.getElementById('statusServico').value = impressora.statusServico || '';
    
    // Mudar para seção de cadastro sem atualizar menu
    // Esconder todas as seções
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');
    
    // Mostrar seção de cadastro
    document.getElementById('cadastrarSection').style.display = 'block';
    
    // Atualizar título da página
    document.getElementById('pageTitle').textContent = 'Editar Impressora';
    
    // Atualizar breadcrumb
    const breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = '<span class="breadcrumb-item active">Editar</span>';
    
    // Alterar botão para "Atualizar"
    const submitBtn = document.querySelector('#cadastroForm button[type="submit"]');
    submitBtn.textContent = 'Atualizar Impressora';
    submitBtn.setAttribute('data-edit-id', id);
    
    // Fechar menu dropdown
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.style.display = 'none';
    });
}

async function deleteImpressora(id) {
    const impressora = impressoras.find(i => i.id == id);
    const nomeItem = impressora ? impressora.nomeItem || impressora.numeroSerie : 'esta impressora';
    
    if (!confirm(`Tem certeza que deseja excluir ${nomeItem}?`)) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/impressoras/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            showSuccess('Impressora excluída com sucesso!');
            loadImpressoras(); // Recarregar lista
        } else {
            const errorText = await response.text();
            showError(`Erro ao excluir: ${errorText}`);
        }
    } catch (error) {
        console.error('Erro ao excluir impressora:', error);
        showError('Erro de conexão com o servidor');
    }
    
    // Fechar menu dropdown
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.style.display = 'none';
    });
}

function resetForm() {
    document.getElementById('cadastroForm').reset();
    const submitBtn = document.querySelector('#cadastroForm button[type="submit"]');
    submitBtn.textContent = 'Cadastrar Impressora';
    submitBtn.removeAttribute('data-edit-id');
    
    // Resetar título e breadcrumb para cadastro
    document.getElementById('pageTitle').textContent = 'Cadastrar Impressora';
    const breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = '<span class="breadcrumb-item active">Cadastrar</span>';
}

function showSuccess(message) {
    // Criar elemento de notificação se não existir
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            display: none;
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(notification);
        
        // Adicionar CSS da animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            notification.style.display = 'none';
            notification.style.animation = 'slideIn 0.3s ease-out';
        }, 300);
    }, 3000);
}

function showError(message) {
    // Criar elemento de notificação de erro se não existir
    let errorNotification = document.getElementById('errorNotification');
    if (!errorNotification) {
        errorNotification = document.createElement('div');
        errorNotification.id = 'errorNotification';
        errorNotification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc2626;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            display: none;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
        `;
        document.body.appendChild(errorNotification);
    }
    
    errorNotification.textContent = message;
    errorNotification.style.display = 'block';
    
    setTimeout(() => {
        errorNotification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            errorNotification.style.display = 'none';
            errorNotification.style.animation = 'slideIn 0.3s ease-out';
        }, 300);
    }, 5000);
}

// Modal
const modal = document.getElementById('detalhesModal');
const userModal = document.getElementById('userModal');
const closeBtns = document.querySelectorAll('.close');

closeBtns.forEach(btn => {
    btn.onclick = function() {
        modal.style.display = 'none';
        userModal.style.display = 'none';
    }
});

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
    if (event.target === userModal) {
        userModal.style.display = 'none';
    }
}

function showUserInfo() {
    // Atualizar header do modal
    document.getElementById('userModalName').textContent = currentUser.nomeCompleto;
    document.getElementById('userModalRole').textContent = currentUser.cargo;
    
    // Atualizar avatar grande
    const avatarLarge = document.getElementById('userAvatarLarge');
    const initials = currentUser.nomeCompleto
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
    avatarLarge.textContent = initials;
    
    // Informações pessoais (dados do banco)
    document.getElementById('userPersonalInfo').innerHTML = `
        <div class="info-item">
            <span class="info-label">Nome Completo</span>
            <span class="info-value">${currentUser.nomeCompleto || 'Não informado'}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Email</span>
            <span class="info-value">${currentUser.email || 'Não informado'}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Cargo</span>
            <span class="info-value">${currentUser.cargo || 'Não informado'}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Departamento</span>
            <span class="info-value">${currentUser.departamento || 'Não informado'}</span>
        </div>
    `;
    
    // Informações do sistema (dados do banco)
    document.getElementById('userSystemInfo').innerHTML = `
        <div class="info-item">
            <span class="info-label">Nome de Usuário</span>
            <span class="info-value">${currentUser.usuario || 'Não informado'}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Permissões do Sistema</span>
            <span class="info-value">${currentUser.tipoUsuario === 'admin' ? 'Acesso Total ao Sistema' : 'Acesso Somente Leitura'}</span>
        </div>
    `;
    

    
    document.getElementById('userModal').style.display = 'block';
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

function updatePaginationInfo(start, end, total) {
    const showingStart = document.getElementById('showingStart');
    const showingEnd = document.getElementById('showingEnd');
    const totalRecords = document.getElementById('totalRecords');
    
    if (showingStart) showingStart.textContent = total > 0 ? start : '0';
    if (showingEnd) showingEnd.textContent = total > 0 ? end : '0';
    if (totalRecords) totalRecords.textContent = total;
}

function updatePaginationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
        prevBtn.style.opacity = currentPage <= 1 ? '0.5' : '1';
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
        nextBtn.style.opacity = currentPage >= totalPages ? '0.5' : '1';
    }
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayImpressoras(window.allImpressoras || impressoras);
    }
}

function nextPage() {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayImpressoras(window.allImpressoras || impressoras);
    }
}

function goToPage(page) {
    currentPage = page;
    displayImpressoras(window.allImpressoras || impressoras);
}

async function searchInBackend(searchTerm) {
    try {
        console.log('Buscando no backend:', searchTerm);
        const response = await fetch(`${API_BASE_URL}/impressoras/serie/${searchTerm}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.impressora || data.aba10) {
                console.log('Encontrado no backend:', data);
                // Criar objeto para exibir
                const resultado = {
                    id: data.impressora ? data.impressora.id : `aba10_${data.aba10.id}`, // ID único para Aba10
                    nfSimpress: data.impressora ? data.impressora.nfSimpress : (data.aba10.nfSimpress1 || '-'),
                    numeroSerie: data.impressora ? data.impressora.numeroSerie : data.aba10.numeroDeSerie,
                    nomeItem: data.impressora ? data.impressora.nomeItem : 'Registro Aba10',
                    aba10: data.aba10,
                    isAba10Only: !data.impressora // Flag para identificar que é só Aba10
                };
                
                // Armazenar temporariamente para os detalhes
                window.currentAba10Data = data.aba10;
                window.currentAba10Id = `aba10_${data.aba10.id}`;
                displayImpressoras([resultado]);
                return;
            }
        }
        
        // Se não encontrou no backend também
        console.log('Não encontrado no backend');
        displayImpressoras([]);
        
    } catch (error) {
        console.log('Erro ao buscar no backend:', error);
        displayImpressoras([]);
    }
}

function toggleMenu(event, id) {
    event.stopPropagation();
    const menu = document.getElementById(`menu-${id}`);
    const allMenus = document.querySelectorAll('.dropdown-menu');
    
    // Fechar todos os outros menus
    allMenus.forEach(m => {
        if (m !== menu) {
            m.style.display = 'none';
            m.classList.remove('dropdown-up');
        }
    });
    
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        menu.classList.remove('dropdown-up');
    } else {
        // Verificar se deve abrir para cima
        const rect = event.target.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const menuHeight = 80; // altura aproximada do menu
        
        if (rect.bottom + menuHeight > windowHeight) {
            menu.classList.add('dropdown-up');
        } else {
            menu.classList.remove('dropdown-up');
        }
        
        menu.style.display = 'block';
    }
}

// Fechar menus ao clicar fora
document.addEventListener('click', function() {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.style.display = 'none';
    });
});

// Filtros Avançados
function toggleFilters() {
    const filters = document.getElementById('advancedFilters');
    filters.style.display = filters.style.display === 'none' ? 'block' : 'none';
}

function clearFilters() {
    document.getElementById('valorMin').value = '';
    document.getElementById('valorMax').value = '';
    document.getElementById('dataInicial').value = '';
    document.getElementById('dataFinal').value = '';
    applyFilters();
}

function applyFilters() {
    const valorMin = document.getElementById('valorMin').value;
    const valorMax = document.getElementById('valorMax').value;
    const dataInicial = document.getElementById('dataInicial').value;
    const dataFinal = document.getElementById('dataFinal').value;
    
    let filtered = window.allImpressoras || impressoras;
    
    if (valorMin) {
        filtered = filtered.filter(imp => {
            const valor = parseFloat(imp.valor) || 0;
            return valor >= parseFloat(valorMin);
        });
    }
    
    if (valorMax) {
        filtered = filtered.filter(imp => {
            const valor = parseFloat(imp.valor) || 0;
            return valor <= parseFloat(valorMax);
        });
    }
    
    if (dataInicial) {
        filtered = filtered.filter(imp => {
            if (!imp.dataregistro) return false;
            const dataReg = new Date(imp.dataregistro);
            return dataReg >= new Date(dataInicial);
        });
    }
    
    if (dataFinal) {
        filtered = filtered.filter(imp => {
            if (!imp.dataregistro) return false;
            const dataReg = new Date(imp.dataregistro);
            return dataReg <= new Date(dataFinal);
        });
    }
    
    displayImpressoras(filtered);
}

// Exportação para Excel
function exportToExcel() {
    const data = window.allImpressoras || impressoras;
    
    const csvContent = [
        ['Número de Série', 'Nome do Item', 'NF Simpress', 'Valor', 'OS Inspeção', 'OS Revisão', 'NF Elgisa', 'Serviço', 'Sem Peças', 'Fusor', 'Outras Peças 1', 'Outras Peças 2', 'Outras Peças 3', 'Outras Peças 4', 'Outras Peças 5', 'Outras Peças 6', 'Outras Peças 7', 'Data Registro'],
        ...data.map(imp => [
            imp.numeroSerie || '-',
            imp.nomeItem || '-',
            imp.nfSimpress || '-',
            imp.valor || '-',
            imp.osInspecao || '-',
            imp.osRevisao || '-',
            imp.nfElgisa || '-',
            imp.servico || '-',
            imp.semPecas || '-',
            imp.fusor || '-',
            imp.outrasPecas1 || '-',
            imp.outrasPecas2 || '-',
            imp.outrasPecas3 || '-',
            imp.outrasPecas4 || '-',
            imp.outrasPecas5 || '-',
            imp.outrasPecas6 || '-',
            imp.outrasPecas7 || '-',
            imp.dataregistro || '-'
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `impressoras_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Exportação para PDF
function exportToPDF() {
    const data = window.allImpressoras || impressoras;
    
    let htmlContent = `
        <html>
        <head>
            <title>Relatório de Impressoras</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #dc2626; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f9fafb; font-weight: bold; }
                tr:nth-child(even) { background-color: #f9fafb; }
            </style>
        </head>
        <body>
            <h1>Relatório de Impressoras - Elgisa</h1>
            <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
            <p>Total de registros: ${data.length}</p>
            <table>
                <thead>
                    <tr>
                        <th>Número de Série</th>
                        <th>Nome do Item</th>
                        <th>NF Simpress</th>
                        <th>Valor</th>
                        <th>OS Inspeção</th>
                        <th>OS Revisão</th>
                        <th>NF Elgisa</th>
                        <th>Serviço</th>
                        <th>Sem Peças</th>
                        <th>Fusor</th>
                        <th>Outras Peças 1</th>
                        <th>Outras Peças 2</th>
                        <th>Outras Peças 3</th>
                        <th>Outras Peças 4</th>
                        <th>Outras Peças 5</th>
                        <th>Outras Peças 6</th>
                        <th>Outras Peças 7</th>
                        <th>Data Registro</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    data.forEach(imp => {
        htmlContent += `
            <tr>
                <td>${imp.numeroSerie || '-'}</td>
                <td>${imp.nomeItem || '-'}</td>
                <td>${imp.nfSimpress || '-'}</td>
                <td>${imp.valor || '-'}</td>
                <td>${imp.osInspecao || '-'}</td>
                <td>${imp.osRevisao || '-'}</td>
                <td>${imp.nfElgisa || '-'}</td>
                <td>${imp.servico || '-'}</td>
                <td>${imp.semPecas || '-'}</td>
                <td>${imp.fusor || '-'}</td>
                <td>${imp.outrasPecas1 || '-'}</td>
                <td>${imp.outrasPecas2 || '-'}</td>
                <td>${imp.outrasPecas3 || '-'}</td>
                <td>${imp.outrasPecas4 || '-'}</td>
                <td>${imp.outrasPecas5 || '-'}</td>
                <td>${imp.outrasPecas6 || '-'}</td>
                <td>${imp.outrasPecas7 || '-'}</td>
                <td>${imp.dataregistro || '-'}</td>
            </tr>
        `;
    });
    
    htmlContent += `
                </tbody>
            </table>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

