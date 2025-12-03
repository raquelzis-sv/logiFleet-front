// Importa o serviço de veículos. O 'import' funciona pois os scripts no index.html são type="module".
import * as veiculoService from '../js/services/veiculoService.js';

function initVeiculosPage() {
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
        capacidadeCarga: document.getElementById('capacidadeCarga'),
        capacidadeVolume: document.getElementById('capacidadeVolume'),
        saveButton: document.getElementById('save-button'),
    };

    // --- FUNÇÕES ---

    /** Renderiza os veículos na tabela */
    function renderTable(veiculos) {
        elements.tableBody.innerHTML = '';
        if (veiculos.length === 0) {
            elements.tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nenhum veículo encontrado.</td></tr>';
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
                <td class="action-buttons">
                    <button class="button warning edit-button" data-id="${veiculo.id}">Editar</button>
                    <button class="button danger delete-button" data-id="${veiculo.id}">Excluir</button>
                </td>
            `;
            elements.tableBody.appendChild(row);
        });
    }

    async function loadVehicles() {
        elements.tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Carregando...</td></tr>';
        try {
            const veiculos = await veiculoService.getAll();
            renderTable(veiculos);
        } catch (error) {
            console.error('Erro ao carregar veículos:', error);
            elements.tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Erro ao carregar os dados. Verifique o console (F12).</td></tr>';
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
            elements.ano.value = veiculo.anoFabricacao;
            elements.capacidadeCarga.value = veiculo.capacidadeCarga;
            elements.capacidadeVolume.value = veiculo.capacidadeVolume;
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
            anoFabricacao: parseInt(elements.ano.value, 10),
            capacidadeCarga: parseFloat(elements.capacidadeCarga.value),
            capacidadeVolume: parseFloat(elements.capacidadeVolume.value),
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
            console.error(`Erro ao salvar veículo: ${error.message}`);
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
            console.error(`Erro ao excluir veículo: ${error.message}`);
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
                console.error(`Erro ao buscar dados para edição: ${error.message}`);
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
        console.log("Limpando listeners da página de veículos.");
        // Adicionar a remoção de event listeners se necessário no futuro
    };

    return destroy;
}

window.initVeiculosPage = initVeiculosPage;
