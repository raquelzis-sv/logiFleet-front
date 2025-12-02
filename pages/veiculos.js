// Importa o serviço de veículos. O 'import' funciona pois os scripts no index.html são type="module".
import * as veiculoService from '../js/services/veiculoService.js';

function initVeiculosPage() {
    // --- FUNÇÃO DE DEBUG NA UI ---
    const logArea = document.getElementById('debug-log-area');
    function logToUI(message) {
        if (!logArea) return;
        const p = document.createElement('p');
        p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logArea.appendChild(p);
    }

    const elements = {
        tableBody: document.getElementById('vehicles-table-body'),
        addButton: document.getElementById('add-vehicle-button'),
        modalOverlay: document.getElementById('vehicle-modal-overlay'),
        modalTitle: document.getElementById('modal-title'),
        closeModalButton: document.getElementById('close-modal-button'),
        cancelButton: document.getElementById('cancel-button'),
        vehicleForm: document.getElementById('vehicle-form'),
        vehicleId: document.getElementById('vehicle-id'),
        placa: document.getElementById('placa'),
        marca: document.getElementById('marca'),
        modelo: document.getElementById('modelo'),
        ano: document.getElementById('ano'),
        capacidade: document.getElementById('capacidade'),
        saveButton: document.getElementById('save-button'),
    };

    // --- FUNÇÕES ---

    /** Renderiza os veículos na tabela */
    function renderTable(veiculos) {
        elements.tableBody.innerHTML = '';
        if (veiculos.length === 0) {
            elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum veículo encontrado.</td></tr>';
            return;
        }
        veiculos.forEach(veiculo => {
            const row = document.createElement('tr');
            row.dataset.id = veiculo.id;
            row.innerHTML = `
                <td>${veiculo.placa}</td>
                <td>${veiculo.marca}</td>
                <td>${veiculo.modelo}</td>
                <td>${veiculo.ano}</td>
                <td>${veiculo.capacidade}</td>
                <td class="action-buttons">
                    <button class="button warning edit-button" data-id="${veiculo.id}">Editar</button>
                    <button class="button danger delete-button" data-id="${veiculo.id}">Excluir</button>
                </td>
            `;
            elements.tableBody.appendChild(row);
        });
    }

    async function loadVehicles() {
        logToUI("Iniciando busca de veículos...");
        elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Carregando...</td></tr>';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            logToUI("ERRO: Timeout de 10 segundos atingido! Abortando requisição.");
            controller.abort();
        }, 10000);

        try {
            logToUI("Aguardando veiculoService.getAll()...");
            const veiculos = await veiculoService.getAll({ signal: controller.signal });
            clearTimeout(timeoutId);
            logToUI(`Veículos recebidos com sucesso: ${JSON.stringify(veiculos)}`);
            renderTable(veiculos);
        } catch (error) {
            clearTimeout(timeoutId);
            logToUI(`ERRO no bloco catch: ${error.name} - ${error.message}`);
            logToUI(`Erro completo: ${JSON.stringify(error)}`);
            
            if (error.name === 'AbortError') {
                elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Erro de Timeout: O servidor demorou muito para responder.</td></tr>';
            } else {
                elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Erro ao carregar os dados. Verifique o log de depuração abaixo.</td></tr>';
            }
        }
    }

    function showModal(mode = 'add', veiculo = null) {
        elements.vehicleForm.reset();
        elements.vehicleId.value = '';

        if (mode === 'edit' && veiculo) {
            elements.modalTitle.textContent = 'Editar Veículo';
            elements.vehicleId.value = veiculo.id;
            elements.placa.value = veiculo.placa;
            elements.marca.value = veiculo.marca;
            elements.modelo.value = veiculo.modelo;
            elements.ano.value = veiculo.ano;
            elements.capacidade.value = veiculo.capacidade;
        } else {
            elements.modalTitle.textContent = 'Adicionar Veículo';
        }
        elements.modalOverlay.classList.add('visible');
    }

    function hideModal() {
        elements.modalOverlay.classList.remove('visible');
        elements.vehicleForm.reset();
        elements.vehicleId.value = '';
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        const id = parseInt(elements.vehicleId.value, 10);
        const veiculoData = {
            placa: elements.placa.value,
            marca: elements.marca.value,
            modelo: elements.modelo.value,
            ano: parseInt(elements.ano.value, 10),
            capacidade: parseFloat(elements.capacidade.value),
        };

        elements.saveButton.textContent = 'Salvando...';
        elements.saveButton.disabled = true;

        try {
            if (id) {
                await veiculoService.update(id, veiculoData);
            } else {
                await veiculoService.create(veiculoData);
            }
            hideModal();
            loadVehicles();
        } catch (error) {
            logToUI(`Erro ao salvar veículo: ${error.message}`);
            alert('Não foi possível salvar o veículo. Tente novamente.');
        } finally {
            elements.saveButton.textContent = 'Salvar';
            elements.saveButton.disabled = false;
        }
    }

    async function handleDelete(id) {
        if (!confirm('Tem certeza de que deseja excluir este veículo?')) {
            return;
        }
        try {
            await veiculoService.remove(id);
            loadVehicles();
        } catch (error) {
            logToUI(`Erro ao excluir veículo: ${error.message}`);
            alert('Não foi possível excluir o veículo. Tente novamente.');
        }
    }

    async function handleTableClick(event) {
        const target = event.target;
        const id = parseInt(target.dataset.id, 10);

        if (target.classList.contains('edit-button')) {
            try {
                const veiculos = await veiculoService.getAll();
                const veiculo = veiculos.find(v => v.id === id);
                if (veiculo) {
                    showModal('edit', veiculo);
                }
            } catch (error) {
                logToUI(`Erro ao buscar dados para edição: ${error.message}`);
                alert("Não foi possível carregar os dados para edição.");
            }
        } else if (target.classList.contains('delete-button')) {
            handleDelete(id);
        }
    }
    
    // --- LÓGICA PRINCIPAL E EVENT LISTENERS ---

    loadVehicles();
    elements.addButton.addEventListener('click', () => showModal('add'));
    elements.closeModalButton.addEventListener('click', hideModal);
    elements.cancelButton.addEventListener('click', hideModal);
    elements.modalOverlay.addEventListener('click', (e) => { if (e.target === elements.modalOverlay) hideModal(); });
    elements.vehicleForm.addEventListener('submit', handleFormSubmit);
    elements.tableBody.addEventListener('click', handleTableClick);

    const destroy = () => {
        logToUI("Limpando listeners da página de veículos.");
    };

    return destroy;
}

window.initVeiculosPage = initVeiculosPage;
