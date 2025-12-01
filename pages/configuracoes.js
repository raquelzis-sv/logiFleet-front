// --- Funções de UI Auxiliares (Toasts e Modals) ---

/**
 * Exibe uma mensagem de feedback (toast) na tela.
 * @param {string} message A mensagem a ser exibida.
 * @param {'success'|'error'|'info'} type O tipo de mensagem (para styling).
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const baseClasses = 'confirmation-box transition duration-300 transform';
    let icon = 'info', color = 'bg-blue-600';

    switch (type) {
        case 'success':
            icon = 'check_circle';
            color = 'bg-green-600';
            break;
        case 'error':
            icon = 'error';
            color = 'bg-red-600';
            break;
        case 'info':
        default:
            icon = 'info';
            color = 'bg-blue-600';
            break;
    }

    const toast = document.createElement('div');
    toast.className = `${baseClasses} ${color} opacity-0`;
    toast.innerHTML = `
        <i class="material-icons">${icon}</i>
        <span class="text-sm">${message}</span>
    `;

    container.appendChild(toast);

    // Animação de entrada
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    // Remoção automática
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Abre um modal customizado.
 */
function openCustomModal(modalId, onConfirm = null) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = 'block';

    if (modalId === 'delete-confirm-modal' && onConfirm) {
        const confirmBtn = document.getElementById('confirm-delete-btn');
        // Remove listener anterior para evitar múltiplas execuções
        confirmBtn.onclick = null; 
        confirmBtn.onclick = () => {
            onConfirm();
            closeCustomModal(modalId);
        };
    }
}

/**
 * Fecha um modal customizado.
 */
function closeCustomModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = 'none';
}


// --- Serviço de Simulação de API em Memória (ConfiguracaoApiService) ---

// Array para simular o armazenamento de dados em um banco de dados
//
// aquei que vais os dados 
//
let configuracoes = [
    { id: 'cfg1', apiNome: 'API Google Maps', endpoint: 'https://maps.googleapis.com', chave: 'MAP_KEY', valor: 'AIzaSy...XYZ' },
    { id: 'cfg2', apiNome: 'API de Clima', endpoint: 'https://api.weather.com', chave: 'WEATHER_ID', valor: 'WTHR-1234' },
    { id: 'cfg3', apiNome: 'Serviço de Pagamento', endpoint: 'https://api.payment.pro', chave: 'PAY_SECRET', valor: 'SEC_8765' }
];

let nextId = configuracoes.length + 1;

// NOTA: Para usar sua API real, substitua os métodos abaixo com a lógica de fetch()
const ConfiguracaoApiService = {
    /**
     * Simula a busca de todas as configurações.
     */
    getConfiguracoes: async () => {
        // Simula latência de rede
        await new Promise(resolve => setTimeout(resolve, 300));
        return configuracoes;
    },

    /**
     * Simula a busca de uma configuração por ID.
     */
    getConfiguracaoById: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        const config = configuracoes.find(c => c.id === id);
        if (!config) {
            throw new Error("Configuração não encontrada.");
        }
        return config;
    },

    /**
     * Simula a criação de uma nova configuração.
     */
    createConfiguracao: async (data) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        const newConfig = { 
            id: `cfg${nextId++}`, 
            apiNome: data.apiNome,
            endpoint: data.endpoint,
            chave: data.chave,
            valor: data.valor
        };
        configuracoes.push(newConfig);
        return newConfig;
    },

    /**
     * Simula a atualização de uma configuração.
     */
    updateConfiguracao: async (id, data) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        const index = configuracoes.findIndex(c => c.id === id);
        if (index === -1) {
            throw new Error("Configuração não encontrada para atualização.");
        }
        // O spread mantém a referência, garantindo que o ID permaneça o mesmo
        configuracoes[index] = { ...configuracoes[index], ...data }; 
        return configuracoes[index];
    },

    /**
     * Simula a exclusão de uma configuração.
     */
    deleteConfiguracao: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        const initialLength = configuracoes.length;
        configuracoes = configuracoes.filter(c => c.id !== id);
        if (configuracoes.length === initialLength) {
            throw new Error("Configuração não encontrada para exclusão.");
        }
    }
};


// --- Lógica da Aplicação Principal ---

function initConfiguracoesPage() {
    const tableBody = document.querySelector('#configuracoes-table tbody');
    const modal = document.getElementById('config-modal');
    const addBtn = document.getElementById('add-config-btn');

    if (!tableBody || !modal || !addBtn) {
        console.error('[Configuracoes] Elementos essenciais não encontrados.');
        return;
    }

    const closeButton = modal.querySelector('.close-button');
    const cancelBtn = modal.querySelector('#cancel-btn');
    const configForm = document.getElementById('config-form');
    const formError = modal.querySelector('#form-error');
    const modalTitle = modal.querySelector('#modal-title');
    
    // Inputs
    const configIdInput = document.getElementById('config-id');
    const apiNomeInput = document.getElementById('config-api-nome');
    const endpointInput = document.getElementById('config-endpoint');
    const chaveInput = document.getElementById('config-chave');
    const valorInput = document.getElementById('config-valor');

    const openModal = (config = null) => {
        formError.classList.add('hidden');
        formError.textContent = '';
        configForm.reset();
        
        if (config) {
            modalTitle.textContent = 'Editar Configuração';
            configIdInput.value = config.id;
            apiNomeInput.value = config.apiNome || '';
            endpointInput.value = config.endpoint || '';
            chaveInput.value = config.chave || '';
            valorInput.value = config.valor || '';
        } else {
            modalTitle.textContent = 'Adicionar Configuração';
            configIdInput.value = '';
        }
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    const renderConfiguracoes = (configuracoes) => {
        tableBody.innerHTML = '';
        if (configuracoes.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-gray-500">Nenhuma configuração encontrada.</td></tr>`;
            return;
        }
        
        configuracoes.forEach(c => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">${c.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${c.apiNome || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">${c.endpoint || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${c.chave || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">${c.valor || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium action-buttons flex space-x-2">
                    <button class="text-indigo-600 hover:text-indigo-900 transition duration-150 btn-edit" data-id="${c.id}" title="Editar">
                        <i class="material-icons text-lg">edit</i>
                    </button>
                    <button class="text-red-600 hover:text-red-900 transition duration-150 btn-delete" data-id="${c.id}" title="Excluir">
                        <i class="material-icons text-lg">delete</i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    };

    const loadConfiguracoes = async () => {
         tableBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-gray-500">Carregando configurações...</td></tr>`;
        try {
            const configuracoesData = await ConfiguracaoApiService.getConfiguracoes();
            renderConfiguracoes(configuracoesData);
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            tableBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-red-500">Erro ao carregar configurações. ${error.message}</td></tr>`;
        }
    };
    
    // --- Event Listeners ---
    addBtn.addEventListener('click', () => openModal());
    closeButton.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    const windowClickListener = (event) => {
        if (event.target == modal) closeModal();
    };
    window.addEventListener('click', windowClickListener);

    configForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        formError.classList.add('hidden');

        const configData = {
            id: configIdInput.value,
            apiNome: apiNomeInput.value.trim(),
            endpoint: endpointInput.value.trim(),
            chave: chaveInput.value.trim(),
            valor: valorInput.value.trim()
        };

        try {
            if (configData.id) {
                await ConfiguracaoApiService.updateConfiguracao(configData.id, configData);
                showToast('Configuração atualizada com sucesso!', 'success');
            } else {
                await ConfiguracaoApiService.createConfiguracao(configData);
                showToast('Configuração criada com sucesso!', 'success');
            }
            closeModal();
            loadConfiguracoes(); // Recarrega a lista após a operação
        } catch (error) {
            console.error('Erro ao salvar configuração:', error);
            const errorMessage = error.message || 'Ocorreu um erro ao salvar.';
            formError.textContent = 'Erro: ' + errorMessage;
            formError.classList.remove('hidden');
        }
    });

    tableBody.addEventListener('click', async (event) => {
        const target = event.target.closest('button');
        if (!target) return;

        const id = target.getAttribute('data-id');
        if (!id) return;

        if (target.classList.contains('btn-edit')) {
            try {
                const config = await ConfiguracaoApiService.getConfiguracaoById(id);
                openModal(config);
            } catch (error) {
                console.error('Erro ao carregar dados para edição:', error);
                showToast('Não foi possível carregar os dados da configuração.', 'error');
            }
        }

        if (target.classList.contains('btn-delete')) {
            // Abrir modal de confirmação
            openCustomModal('delete-confirm-modal', async () => {
                try {
                    await ConfiguracaoApiService.deleteConfiguracao(id);
                    showToast('Configuração excluída com sucesso!', 'success');
                    loadConfiguracoes(); // Recarrega a lista após a exclusão
                } catch (error) {
                    console.error('Erro ao excluir configuração:', error);
                    showToast('Não foi possível excluir a configuração. Tente novamente.', 'error');
                }
            });
        }
    });

    // Inicia o carregamento dos dados quando a página carrega
    window.onload = loadConfiguracoes;

    // Função de limpeza (apenas para organização)
    return () => {
        window.removeEventListener('click', windowClickListener);
    };
}

// Inicializa a aplicação
initConfiguracoesPage();