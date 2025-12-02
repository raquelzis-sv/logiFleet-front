// Importa todos os serviços necessários
import * as rotaService from '../js/services/rotaService.js';
import * as veiculoService from '../js/services/veiculoService.js';
import * as motoristaService from '../js/services/motoristaService.js';
import * as pedidoService from '../js/services/pedidoService.js';

function initRotasPage() {
    const elements = {
        tableBody: document.getElementById('rotas-table-body'),
        addButton: document.getElementById('add-rota-button'),
        modalOverlay: document.getElementById('rota-modal-overlay'),
        modalTitle: document.getElementById('modal-title'),
        closeModalButton: document.getElementById('close-modal-button'),
        cancelButton: document.getElementById('cancel-button'),
        rotaForm: document.getElementById('rota-form'),
        rotaId: document.getElementById('rota-id'),
        dataRota: document.getElementById('dataRota'),
        veiculoId: document.getElementById('veiculoId'),
        motoristaId: document.getElementById('motoristaId'),
        pedidosIds: document.getElementById('pedidosIds'),
        status: document.getElementById('status'),
        saveButton: document.getElementById('save-button'),
    };

    /** Popula os dropdowns do formulário buscando dados da API */
    async function populateDropdowns() {
        try {
            // Usa Promise.all para buscar tudo em paralelo
            const [veiculos, motoristas, pedidos] = await Promise.all([
                veiculoService.getAll(),
                motoristaService.getAll(),
                pedidoService.getPedidosPendentes() // Assumindo que essa função existe e foi padronizada
            ]);

            // Popula veículos
            elements.veiculoId.innerHTML = '<option value="">Selecione um veículo</option>';
            veiculos.forEach(v => {
                elements.veiculoId.innerHTML += `<option value="${v.id}">${v.placa} - ${v.modelo}</option>`;
            });

            // Popula motoristas
            elements.motoristaId.innerHTML = '<option value="">Selecione um motorista</option>';
            motoristas.forEach(m => {
                elements.motoristaId.innerHTML += `<option value="${m.id}">${m.nome}</option>`;
            });

            // Popula pedidos
            elements.pedidosIds.innerHTML = ''; // Limpa, pois é multi-select
            if (pedidos.length === 0) {
                 elements.pedidosIds.innerHTML = '<option disabled>Nenhum pedido pendente</option>';
            }
            pedidos.forEach(p => {
                elements.pedidosIds.innerHTML += `<option value="${p.id}">Pedido #${p.id} - Cliente ${p.clienteId}</option>`;
            });

        } catch (error) {
            console.error("Erro ao popular os dropdowns:", error);
            alert("Não foi possível carregar os dados para criar a rota.");
        }
    }

    /** Renderiza as rotas na tabela, fazendo a correspondência de IDs para nomes */
    function renderTable(rotas, veiculos, motoristas) {
        elements.tableBody.innerHTML = '';
        if (!rotas || rotas.length === 0) {
            elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhuma rota encontrada.</td></tr>';
            return;
        }

        // Criar mapas para busca rápida de O(1) em vez de usar .find() em um loop
        const veiculoMap = new Map(veiculos.map(v => [v.id, v]));
        const motoristaMap = new Map(motoristas.map(m => [m.id, m]));

        rotas.forEach(rota => {
            const veiculo = veiculoMap.get(rota.veiculoId);
            const motorista = motoristaMap.get(rota.motoristaId);

            const row = document.createElement('tr');
            row.dataset.id = rota.id;
            row.innerHTML = `
                <td>${rota.id}</td>
                <td>${new Date(rota.dataRota).toLocaleDateString()}</td>
                <td>${rota.status || ''}</td>
                <td>${veiculo?.placa || 'ID: ' + rota.veiculoId}</td>
                <td>${motorista?.nome || 'ID: ' + rota.motoristaId}</td>
                <td class="action-buttons">
                    <button class="button warning edit-button" data-id="${rota.id}">Editar</button>
                    <button class="button danger delete-button" data-id="${rota.id}">Excluir</button>
                </td>
            `;
            elements.tableBody.appendChild(row);
        });
    }

    async function loadRotas() {
        elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Carregando...</td></tr>';
        try {
            // Busca todos os dados necessários em paralelo para eficiência
            const [rotas, veiculos, motoristas] = await Promise.all([
                rotaService.getAll(),
                veiculoService.getAll(),
                motoristaService.getAll()
            ]);
            
            renderTable(rotas, veiculos, motoristas);
        } catch (error) {
            console.error('Erro ao carregar rotas:', error);
            elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Erro ao carregar os dados.</td></tr>';
        }
    }

    function showModal(mode = 'add', rota = null) {
        elements.rotaForm.reset();
        elements.rotaId.value = '';
        elements.status.parentElement.style.display = 'none'; // Esconde o status na criação

        populateDropdowns().then(() => {
            if (mode === 'edit' && rota) {
                elements.modalTitle.textContent = 'Editar Rota';
                elements.rotaId.value = rota.id;
                elements.dataRota.value = rota.dataRota.split('T')[0]; // Formato YYYY-MM-DD
                elements.veiculoId.value = rota.veiculoId;
                elements.motoristaId.value = rota.motoristaId;
                elements.status.value = rota.status;
                elements.status.parentElement.style.display = 'block'; // Mostra o status na edição

                // Lógica para selecionar pedidos (simplificada para edição)
                 elements.pedidosIds.innerHTML = '<option disabled>Pedidos não podem ser alterados na edição.</option>';
            } else {
                elements.modalTitle.textContent = 'Planejar Nova Rota';
                elements.dataRota.value = new Date().toISOString().split('T')[0];
            }
            elements.modalOverlay.classList.add('visible');
        });
    }

    function hideModal() {
        elements.modalOverlay.classList.remove('visible');
        elements.rotaForm.reset();
        elements.rotaId.value = '';
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        const id = parseInt(elements.rotaId.value, 10);
        
        // Pega todos os IDs selecionados no multi-select
        const pedidosIds = [...elements.pedidosIds.selectedOptions].map(option => parseInt(option.value, 10));

        const rotaData = {
            dataRota: elements.dataRota.value,
            veiculoId: parseInt(elements.veiculoId.value, 10),
            motoristaId: parseInt(elements.motoristaId.value, 10),
            pedidosIds: pedidosIds,
            status: elements.status.value,
        };

        elements.saveButton.textContent = 'Salvando...';
        elements.saveButton.disabled = true;

        try {
            if (id) {
                // Para edição, não enviamos os pedidosIds, apenas o status
                const updateData = { status: rotaData.status };
                await rotaService.update(id, updateData);
            } else {
                await rotaService.create(rotaData);
            }
            hideModal();
            loadRotas();
        } catch (error) {
            console.error(`Erro ao salvar rota:`, error);
            alert('Não foi possível salvar a rota.');
        } finally {
            elements.saveButton.textContent = 'Salvar';
            elements.saveButton.disabled = false;
        }
    }

    async function handleDelete(id) {
        if (!confirm('Tem certeza de que deseja excluir esta rota?')) return;
        try {
            await rotaService.remove(id);
            loadRotas();
        } catch (error) {
            console.error(`Erro ao excluir rota:`, error);
            alert('Não foi possível excluir a rota.');
        }
    }

    async function handleTableClick(event) {
        const target = event.target;
        const id = parseInt(target.dataset.id, 10);

        if (target.classList.contains('edit-button')) {
            try {
                const rota = await rotaService.getById(id);
                if (rota) {
                    showModal('edit', rota);
                }
            } catch (error) {
                alert("Não foi possível carregar os dados para edição.");
            }
        } else if (target.classList.contains('delete-button')) {
            handleDelete(id);
        }
    }

    loadRotas();
    elements.addButton.addEventListener('click', () => showModal('add'));
    elements.closeModalButton.addEventListener('click', hideModal);
    elements.cancelButton.addEventListener('click', hideModal);
    elements.modalOverlay.addEventListener('click', (e) => { if (e.target === elements.modalOverlay) hideModal(); });
    elements.rotaForm.addEventListener('submit', handleFormSubmit);
    elements.tableBody.addEventListener('click', handleTableClick);

    const destroy = () => { console.log("Limpando listeners da página de rotas."); };
    return destroy;
}

window.initRotasPage = initRotasPage;