// FUNCIONALIDADES PROFISSIONAIS

// Sistema de Notificações
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">&times;</button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Mostrar notificação
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remover automaticamente
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Loading Overlay
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// Paginação (usando variáveis globais do dashboard.js)

function updatePagination() {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    
    document.getElementById('showingStart').textContent = start;
    document.getElementById('showingEnd').textContent = end;
    document.getElementById('totalRecords').textContent = totalItems;
    
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayPaginatedData();
    }
}

function nextPage() {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayPaginatedData();
    }
}

function goToPage(page) {
    currentPage = page;
    displayPaginatedData();
}

function displayPaginatedData() {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = allImpressoras.slice(start, end);
    
    displayImpressorasProfessional(pageData);
    updatePagination();
}

// Exibição profissional da tabela
function displayImpressorasProfessional(data) {
    const tbody = document.getElementById('impressorasTable');
    
    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #6b7280;">
                    <div style="font-size: 1.2rem; margin-bottom: 8px;">Nenhum registro encontrado</div>
                    <div style="font-size: 0.9rem;">Tente ajustar os filtros de busca</div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = data.map(impressora => `
        <tr style="cursor: pointer;" onmouseover="this.style.backgroundColor='#f9fafb'" onmouseout="this.style.backgroundColor=''">
            <td style="font-weight: 600; color: #374151; font-size: 0.9rem;">${impressora.id}</td>
            <td style="font-weight: 500;">${impressora.nfSimpress || '-'}</td>
            <td style="font-family: 'Courier New', monospace; background: #f8fafc; padding: 6px 8px; border-radius: 4px; font-size: 0.85rem; color: #1e40af;">${impressora.numeroSerie || '-'}</td>
            <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${impressora.nomeItem || '-'}">${impressora.nomeItem || '-'}</td>
            <td style="font-weight: 600; color: #059669;">${impressora.valor || '-'}</td>
            <td><span class="status-badge status-active">Ativo</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="showDetalhes(${impressora.id})" title="Visualizar">View</button>
                    <button class="btn-action btn-edit" onclick="editImpressora(${impressora.id})" title="Editar">Edit</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Atualizar breadcrumb
function updateBreadcrumb(section) {
    const breadcrumb = document.getElementById('breadcrumb');
    const breadcrumbs = {
        'buscar': '<span class="breadcrumb-item">Sistema</span><span class="breadcrumb-item active">Buscar Impressoras</span>',
        'cadastrar': '<span class="breadcrumb-item">Sistema</span><span class="breadcrumb-item active">Cadastrar Impressora</span>',
        'usuarios': '<span class="breadcrumb-item">Sistema</span><span class="breadcrumb-item active">Gerenciar Usuários</span>'
    };
    breadcrumb.innerHTML = breadcrumbs[section] || breadcrumbs['buscar'];
}

// Filtros avançados
function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const periodoFilter = document.getElementById('periodoFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    if (periodoFilter) {
        periodoFilter.addEventListener('change', applyFilters);
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const periodoFilter = document.getElementById('periodoFilter')?.value || '';
    
    let filtered = [...allImpressoras];
    
    // Filtro de busca
    if (searchTerm) {
        filtered = filtered.filter(impressora => 
            (impressora.nfSimpress && impressora.nfSimpress.toLowerCase().includes(searchTerm)) ||
            (impressora.numeroSerie && impressora.numeroSerie.toLowerCase().includes(searchTerm)) ||
            (impressora.nomeItem && impressora.nomeItem.toLowerCase().includes(searchTerm))
        );
    }
    
    // Atualizar dados
    totalItems = filtered.length;
    currentPage = 1;
    allImpressoras = filtered;
    displayPaginatedData();
}

// Exportar dados
function exportData() {
    showNotification('Preparando exportação...', 'info');
    
    setTimeout(() => {
        const csv = convertToCSV(allImpressoras);
        downloadCSV(csv, 'impressoras.csv');
        showNotification('Dados exportados com sucesso!', 'success');
    }, 1000);
}

function convertToCSV(data) {
    const headers = ['ID', 'NF Simpress', 'Número de Série', 'Nome do Item', 'Valor', 'OS Inspeção', 'OS Revisão', 'NF Elgisa'];
    const rows = data.map(item => [
        item.id || '',
        item.nfSimpress || '',
        item.numeroSerie || '',
        item.nomeItem || '',
        item.valor || '',
        item.osInspecao || '',
        item.osRevisao || '',
        item.nfElgisa || ''
    ]);
    
    return [headers, ...rows].map(row => 
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Atualizar dados
function refreshData() {
    showNotification('Atualizando dados...', 'info');
    loadImpressoras();
}

// Editar impressora
function editImpressora(id) {
    showNotification('Funcionalidade de edição em desenvolvimento', 'warning');
}

// Inicializar avatar do usuário
function initUserAvatar() {
    if (currentUser && currentUser.nomeCompleto) {
        const avatar = document.getElementById('userAvatar');
        const initials = currentUser.nomeCompleto
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();
        avatar.textContent = initials;
    }
}