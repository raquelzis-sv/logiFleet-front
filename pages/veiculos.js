// Importa o serviço de veículos.
import * as veiculoService from '../js/services/veiculoService.js';

function initVeiculosPage() {
    // Mapeia os IDs do HTML para um objeto para fácil acesso
    const elements = {
        tableBody: document.getElementById('vehicles-table-body'),
        addButton: document.getElementById('add-vehicle-button'),
        modalOverlay: document.getElementById('vehicle-modal-overlay'),
        modalTitle: document.getElementById('modal-title'),
        closeModalButton: document.getElementById('close-modal-button'),
        cancelButton: document.getElementById('cancel-button'),
        vehicleForm: document.getElementById('vehicle-form'),
        saveButton: document.getElementById('save-button'),
        // Campos do formulário
        vehicleId: document.getElementById('vehicle-id'),
        placa: document.getElementById('placa'),
        marca: document.getElementById('marca'),
        modelo: document.getElementById('modelo'),
        ano: document.getElementById('ano'),
        capacidadeVolume: document.getElementById('capacidadeVolume'),
        capacidadeCarga: document.getElementById('capacidadeCarga'),
        status: document.getElementById('status'),
        dataUltimaManutencao: document.getElementById('dataUltimaManutencao'),
        dataProximaManutencao: document.getElementById('dataProximaManutencao'),
    };

    // --- FUNÇÕES AUXILIARES ---

    /** Formata uma data (string ISO) para o formato dd/mm/yyyy */
    function formatarData(dataString) {
        if (!dataString) return 'N/A';
        const data = new Date(dataString);
        // Adiciona 1 dia para corrigir o problema de fuso horário
        data.setDate(data.getDate() + 1);
        return data.toLocaleDateString('pt-BR');
    }

    /** Formata uma data (string ISO) para o formato yyyy-mm-dd para o input type="date" */
    function formatarDataParaInput(dataString) {
        if (!dataString) return '';
        return new Date(dataString).toISOString().split('T')[0];
    }
    
    /** Mapeia o enum de Status para uma string legível */
    function getStatusText(statusEnum) {
        const statusMap = {
            0: 'Disponível',
            1: 'Em Rota',
            2: 'Em Manutenção',
            3: 'Inativo'
        };
        return statusMap[statusEnum] || 'Desconhecido';
    }


    // --- FUNÇÕES PRINCIPAIS ---

    /** Renderiza os veículos na tabela */
    function renderTable(veiculos) {
        elements.tableBody.innerHTML = '';
        if (veiculos.length === 0) {
            elements.tableBody.innerHTML = '<td colspan="10" style="text-align:center;">Nenhum veículo encontrado.</td>';
            return;
        }
        veiculos.forEach(veiculo => {
            const row = document.createElement('tr');
            row.dataset.id = veiculo.id;
            row.innerHTML = `
                <td>${veiculo.placa}</td>
                <td>${veiculo.marca}</td>
                <td>${veiculo.modelo}</td>
                <td>${veiculo.anoFabricacao}</td>
                <td>${veiculo.capacidadeCarga}</td>
                <td>${veiculo.capacidadeVolume}</td>
                <td>${getStatusText(veiculo.status)}</td>
                <td>${formatarData(veiculo.dataUltimaManutencao)}</td>
                <td>${formatarData(veiculo.dataProximaManutencao)}</td>
                <td class="action-buttons">
                    <button class="button warning edit-button" data-id="${veiculo.id}">Editar</button>
                    <button class="button danger delete-button" data-id="${veiculo.id}">Excluir</button>
                </td>
            `;
            elements.tableBody.appendChild(row);
        });
    }

    /** Carrega os veículos do serviço e os renderiza na tabela */
    async function loadVehicles() {
        elements.tableBody.innerHTML = '<td colspan="10" style="text-align:center;">Carregando...</td>';
        try {
            const veiculos = await veiculoService.getAll();
            renderTable(veiculos);
        } catch (error) {
            console.error('Erro ao carregar veículos:', error);
            elements.tableBody.innerHTML = '<td colspan="10" style="text-align:center;">Erro ao carregar os dados.</td>';
        }
    }

    /** Mostra o modal para adicionar ou editar um veículo */
    function showModal(mode = 'add', veiculo = null) {
        elements.vehicleForm.reset();
        elements.vehicleId.value = '';

        if (mode === 'edit' && veiculo) {
            elements.modalTitle.textContent = 'Editar Veículo';
            elements.vehicleId.value = veiculo.id;
            elements.placa.value = veiculo.placa;
            elements.marca.value = veiculo.marca;
            elements.modelo.value = veiculo.modelo;
            elements.ano.value = veiculo.anoFabricacao;
            elements.capacidadeVolume.value = veiculo.capacidadeVolume;
            elements.capacidadeCarga.value = veiculo.capacidadeCarga;
            elements.status.value = veiculo.status;
            elements.dataUltimaManutencao.value = formatarDataParaInput(veiculo.dataUltimaManutencao);
            elements.dataProximaManutencao.value = formatarDataParaInput(veiculo.dataProximaManutencao);
        } else {
            elements.modalTitle.textContent = 'Adicionar Veículo';
        }
        elements.modalOverlay.classList.add('visible');
    }

    /** Esconde o modal */
    function hideModal() {
        elements.modalOverlay.classList.remove('visible');
    }

    /** Lida com a submissão do formulário do modal */
    async function handleFormSubmit(event) {
        event.preventDefault();
        const id = parseInt(elements.vehicleId.value, 10) || null;

        const veiculoData = {
            placa: elements.placa.value,
            marca: elements.marca.value,
            modelo: elements.modelo.value,
            anoFabricacao: parseInt(elements.ano.value, 10),
            capacidadeVolume: parseFloat(elements.capacidadeVolume.value),
            capacidadeCarga: parseFloat(elements.capacidadeCarga.value),
            status: parseInt(elements.status.value, 10),
            dataUltimaManutencao: elements.dataUltimaManutencao.value || null,
            dataProximaManutencao: elements.dataProximaManutencao.value || null,
        };

        elements.saveButton.disabled = true;
        elements.saveButton.textContent = 'Salvando...';

        try {
            if (id) {
                veiculoData.id = id; // Adiciona o ID apenas na atualização
                await veiculoService.update(id, veiculoData);
            } else {
                await veiculoService.create(veiculoData);
            }
            hideModal();
            loadVehicles();
        } catch (error) {
            console.error('Erro ao salvar veículo:', error);
            const message = error?.data?.title || error?.data?.message || (typeof error?.data === 'string' ? error.data : 'Não foi possível salvar o veículo. Verifique os dados e tente novamente.');
            alert(message);
        } finally {
            elements.saveButton.disabled = false;
            elements.saveButton.textContent = 'Salvar';
        }
    }

    /** Lida com o clique no botão de excluir */
    async function handleDelete(id) {
        if (!confirm('Tem certeza de que deseja excluir este veículo?')) return;
        
        try {
            await veiculoService.remove(id);
            loadVehicles();
        } catch (error) {
            console.error('Erro ao excluir veículo:', error);
            alert('Não foi possível excluir o veículo.');
        }
    }

    /** Lida com cliques na tabela (para editar e excluir) */
    async function handleTableClick(event) {
        const target = event.target.closest('button');
        if (!target) return; 

        const id = parseInt(target.dataset.id, 10);

        if (target.classList.contains('edit-button')) {
            try {
                // É mais eficiente buscar apenas o veículo específico
                const veiculo = await veiculoService.getById(id);
                if (veiculo) {
                    showModal('edit', veiculo);
                }
            } catch (error) {
                console.error(`Erro ao buscar dados para edição:`, error);
                alert("Não foi possível carregar os dados para edição.");
            }
        } else if (target.classList.contains('delete-button')) {
            handleDelete(id);
        }
    }
    
    // --- INICIALIZAÇÃO E EVENT LISTENERS ---

    loadVehicles(); // Carga inicial dos dados
    elements.addButton.addEventListener('click', () => showModal('add'));
    elements.closeModalButton.addEventListener('click', hideModal);
    elements.cancelButton.addEventListener('click', hideModal);
    elements.modalOverlay.addEventListener('click', (e) => { if (e.target === elements.modalOverlay) hideModal(); });
    elements.vehicleForm.addEventListener('submit', handleFormSubmit);
    elements.tableBody.addEventListener('click', handleTableClick);

    // Função de limpeza para o roteador
    const destroy = () => {
        console.log("Limpando listeners e timers da página de veículos.");
    };

    return destroy;
}

window.initVeiculosPage = initVeiculosPage;
