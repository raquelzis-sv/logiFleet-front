// --- UTILS E UI HANDLERS ---

/**
 * Gera um ID único simples (substituindo o ID do Firestore).
 */
const generateUniqueId = () => {
    return 'id-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
};

/**
 * Exibe uma mensagem de feedback (sucesso ou erro) no canto inferior direito.
 * @param {string} message - A mensagem a ser exibida.
 * @param {boolean} isError - True se for uma mensagem de erro, false para sucesso.
 */
const showMessage = (message, isError = false) => {
    const messageBox = document.getElementById('message-box');
    messageBox.textContent = message;
    messageBox.classList.remove('hidden', 'bg-red-500', 'bg-green-500', 'opacity-0');
    messageBox.classList.add(isError ? 'bg-red-500' : 'bg-green-500', 'opacity-100');

    setTimeout(() => {
        messageBox.classList.remove('opacity-100');
        messageBox.classList.add('opacity-0');
        setTimeout(() => messageBox.classList.add('hidden'), 300); // Esconde depois da transição
    }, 3000);
};

// --- LOCAL STORAGE SERVICE (veiculoStorage) ---

const STORAGE_KEY = 'veiculos';

const veiculoStorage = {
    /**
     * Carrega todos os veículos do localStorage.
     * @returns {Array<Object>}
     */
    loadVeiculos() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Erro ao carregar do localStorage:", e);
            showMessage("Erro ao carregar dados locais.", true);
            return [];
        }
    },

    /**
     * Salva a lista completa de veículos no localStorage.
     * @param {Array<Object>} veiculos - Lista completa de veículos.
     */
    saveVeiculos(veiculos) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(veiculos));
        } catch (e) {
            console.error("Erro ao salvar no localStorage:", e);
            throw new Error("Não foi possível salvar os dados localmente.");
        }
    },

    /**
     * Cria um novo veículo.
     * @param {Object} data 
     */
    async createVeiculo(data) {
        const veiculos = this.loadVeiculos();
        const novoVeiculo = {
            id: generateUniqueId(),
            ...data,
            placa: data.placa.toUpperCase(),
            anoFabricacao: parseInt(data.anoFabricacao),
            capacidadeCarga: parseFloat(data.capacidadeCarga),
            status: parseInt(data.status),
            // Datas já vêm como strings YYYY-MM-DD
            createdAt: new Date().toISOString(),
        };
        veiculos.push(novoVeiculo);
        this.saveVeiculos(veiculos);
        showMessage(`Veículo ${novoVeiculo.placa} adicionado com sucesso!`);
    },

    /**
     * Atualiza um veículo existente.
     * @param {string} id 
     * @param {Object} data 
     */
    async updateVeiculo(id, data) {
        let veiculos = this.loadVeiculos();
        const index = veiculos.findIndex(v => v.id === id);
        
        if (index === -1) {
            throw new Error('Veículo não encontrado para atualização.');
        }

        veiculos[index] = {
            ...veiculos[index], // Mantém campos antigos como createdAt
            ...data,
            placa: data.placa.toUpperCase(),
            anoFabricacao: parseInt(data.anoFabricacao),
            capacidadeCarga: parseFloat(data.capacidadeCarga),
            status: parseInt(data.status),
            updatedAt: new Date().toISOString(),
        };
        this.saveVeiculos(veiculos);
        showMessage(`Veículo ${data.placa} atualizado com sucesso!`);
    },

    /**
     * Exclui um veículo.
     * @param {string} id 
     */
    async deleteVeiculo(id) {
        const veiculos = this.loadVeiculos();
        const veiculosFiltrados = veiculos.filter(v => v.id !== id);
        if (veiculos.length === veiculosFiltrados.length) {
            throw new Error('Veículo não encontrado para exclusão.');
        }
        this.saveVeiculos(veiculosFiltrados);
        showMessage('Veículo excluído com sucesso!');
    },
    
    /**
     * Obtém um veículo pelo ID.
     * @param {string} id 
     * @returns {Object | undefined}
     */
    getVeiculoById(id) {
        const veiculos = this.loadVeiculos();
        const veiculo = veiculos.find(v => v.id === id);
        if (!veiculo) {
            throw new Error('Veículo não encontrado.');
        }
        return veiculo;
    }
};

// --- LOGIC DA INTERFACE ---

function initVeiculosPage() {
    console.log('[Veiculos] Aplicação iniciada (Modo LocalStorage).');

    const tableBody = document.querySelector('#veiculos-table tbody');
    const modal = document.getElementById('veiculo-modal');
    const addBtn = document.getElementById('add-veiculo-btn');

    // Elementos do Modal e Formulário
    const closeButton = modal.querySelector('.close-button');
    const cancelBtn = modal.querySelector('#cancel-btn');
    const veiculoForm = document.getElementById('veiculo-form');
    const formError = modal.querySelector('#form-error');
    const modalTitle = modal.querySelector('#modal-title');
    
    // Inputs
    const veiculoIdInput = document.getElementById('veiculo-id');
    const placaInput = document.getElementById('veiculo-placa');
    const marcaInput = document.getElementById('veiculo-marca');
    const modeloInput = document.getElementById('veiculo-modelo');
    const anoInput = document.getElementById('veiculo-ano');
    const capacidadeInput = document.getElementById('veiculo-capacidade');
    const carroceriaInput = document.getElementById('veiculo-carroceria');
    const statusInput = document.getElementById('veiculo-status');
    const ultimaManutencaoInput = document.getElementById('veiculo-ultima-manutencao');
    const proximaManutencaoInput = document.getElementById('veiculo-proxima-manutencao');

    const statusMap = [
        { text: 'Disponível', class: 'bg-green-100 text-green-800', icon: 'check_circle' },
        { text: 'Em Rota', class: 'bg-yellow-100 text-yellow-800', icon: 'directions_car' },
        { text: 'Em Manutenção', class: 'bg-orange-100 text-orange-800', icon: 'build' },
        { text: 'Inativo', class: 'bg-red-100 text-red-800', icon: 'cancel' }
    ];

    /**
     * Renderiza o status como um "badge" estilizado.
     * @param {number} statusValue - O valor numérico do status.
     * @returns {string} HTML do badge.
     */
    const renderStatusBadge = (statusValue) => {
        const status = statusMap[statusValue] || statusMap[3]; // Default to Inativo
        return `<span class="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${status.class}">
                    <i class="material-icons text-sm mr-1">${status.icon}</i>
                    ${status.text}
                </span>`;
    };

    /**
     * Abre o modal de edição/adição.
     * @param {Object | null} veiculo - Dados do veículo para edição ou null para adição.
     */
    const openModal = (veiculo = null) => {
        formError.style.display = 'none';
        veiculoForm.reset();
        
        // Bloqueia o scroll do corpo da página ao abrir o modal
        document.body.classList.add('overflow-hidden');

        if (veiculo) {
            modalTitle.textContent = 'Editar Veículo';
            veiculoIdInput.value = veiculo.id;
            placaInput.value = veiculo.placa;
            marcaInput.value = veiculo.marca;
            modeloInput.value = veiculo.modelo;
            anoInput.value = veiculo.anoFabricacao;
            capacidadeInput.value = veiculo.capacidadeCarga;
            carroceriaInput.value = veiculo.tipoCarroceria;
            statusInput.value = veiculo.status;
            // Datas já estão no formato YYYY-MM-DD
            ultimaManutencaoInput.value = veiculo.dataUltimaManutencao || '';
            proximaManutencaoInput.value = veiculo.dataProximaManutencao || '';
        } else {
            modalTitle.textContent = 'Adicionar Veículo';
            veiculoIdInput.value = '';
        }
        modal.style.display = 'block';
    };

    /**
     * Fecha o modal.
     */
    const closeModal = () => {
        modal.style.display = 'none';
        document.body.classList.remove('overflow-hidden');
    };

    /**
     * Carrega e renderiza todos os veículos do localStorage na tabela.
     */
    const renderVeiculosTable = () => {
        const veiculos = veiculoStorage.loadVeiculos();
        // Ordena por placa (opcional)
        veiculos.sort((a, b) => a.placa.localeCompare(b.placa));

        tableBody.innerHTML = ''; // Limpa a tabela
        
        if (veiculos.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-gray-500">Nenhum veículo cadastrado. Clique em "Adicionar Veículo" para começar!</td></tr>`;
            return;
        }

        veiculos.forEach(v => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td class="text-sm font-medium text-gray-500">${v.id.substring(0, 4)}...</td>
                <td class="text-gray-900 font-semibold">${v.placa}</td>
                <td class="text-gray-700">${v.marca}</td>
                <td class="text-gray-700">${v.modelo}</td>
                <td class="text-gray-600">${v.anoFabricacao}</td>
                <td>${renderStatusBadge(v.status)}</td>
                <td class="action-buttons space-x-2">
                    <button class="btn-edit" data-id="${v.id}" title="Editar">
                        <i class="material-icons text-base">edit</i>
                    </button>
                    <button class="btn-delete" data-id="${v.id}" title="Excluir">
                        <i class="material-icons text-base">delete</i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    };

    // --- LISTENERS ---

    addBtn.addEventListener('click', () => openModal());
    closeButton.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    // Fechar modal ao clicar fora
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });

    // Submissão do Formulário (Adicionar/Editar)
    veiculoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        formError.style.display = 'none';

        // Validação básica de Ano
        const currentYear = new Date().getFullYear();
        const anoFabricacao = parseInt(anoInput.value);
        if (anoFabricacao > (currentYear + 1) || anoFabricacao < 1900) {
            formError.textContent = 'O ano de fabricação é inválido.';
            formError.style.display = 'block';
            return;
        }

        const veiculoData = {
            placa: placaInput.value.toUpperCase().trim(),
            marca: marcaInput.value.trim(),
            modelo: modeloInput.value.trim(),
            anoFabricacao: anoFabricacao,
            capacidadeCarga: parseFloat(capacidadeInput.value),
            tipoCarroceria: carroceriaInput.value.trim(),
            status: parseInt(statusInput.value),
            dataUltimaManutencao: ultimaManutencaoInput.value,
            dataProximaManutencao: proximaManutencaoInput.value,
        };

        try {
            if (veiculoIdInput.value) {
                // Atualizar
                await veiculoStorage.updateVeiculo(veiculoIdInput.value, veiculoData);
            } else {
                // Criar
                await veiculoStorage.createVeiculo(veiculoData);
            }
            closeModal();
            renderVeiculosTable(); // Recarrega a tabela após a operação
        } catch (error) {
            console.error('[Veiculos] Erro ao salvar/atualizar:', error);
            const errorMessage = error.message || 'Ocorreu um erro desconhecido ao salvar o veículo.';
            formError.textContent = errorMessage;
            formError.style.display = 'block';
        }
    });

    // Edição e Exclusão pela Tabela
    tableBody.addEventListener('click', async (event) => {
        // Encontra o botão clicado e seu data-id
        const button = event.target.closest('button');
        if (!button) return;

        const id = button.getAttribute('data-id');
        if (!id) return;

        if (button.classList.contains('btn-edit')) {
            try {
                const veiculo = veiculoStorage.getVeiculoById(id);
                openModal(veiculo);
            } catch (error) {
                console.error('Erro ao carregar dados para edição:', error);
                showMessage('Não foi possível carregar os dados do veículo.', true);
            }
        }

        if (button.classList.contains('btn-delete')) {
            // Substituição do confirm() nativo por uma alternativa
            if (!window.confirm(`Tem certeza que deseja EXCLUIR o veículo com ID ${id.substring(0, 4)}...? (Ação permanente)`)) {
                return; // Sai se o usuário cancelar
            }
            try {
                await veiculoStorage.deleteVeiculo(id);
                renderVeiculosTable(); // Recarrega a tabela após a exclusão
            } catch (error) {
                console.error('Erro ao excluir veículo:', error);
                showMessage('Não foi possível excluir o veículo.', true);
            }
        }
    });

    // Chamada inicial para carregar os dados
    renderVeiculosTable(); 
}

// Inicia a aplicação
window.onload = initVeiculosPage;