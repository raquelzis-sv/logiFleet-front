import * as pedidoService from '../js/services/pedidoService.js';
import * as clienteService from '../js/services/clienteService.js';
import * as enderecoClienteService from '../js/services/enderecoClienteService.js';
import itemPedidoService from '../js/services/itemPedidoService.js';

function initPedidosPage() {
    const elements = {
        tableBody: document.getElementById('pedidos-table-body'),
        addButton: document.getElementById('add-pedido-button'),
        modalOverlay: document.getElementById('pedido-modal-overlay'),
        modalTitle: document.getElementById('modal-title'),
        closeModalButton: document.getElementById('close-modal-button'),
        pedidoForm: document.getElementById('pedido-form'),
        pedidoId: document.getElementById('pedido-id'),
        clienteId: document.getElementById('clienteId'),
        enderecoEntregaId: document.getElementById('enderecoEntregaId'),
        dataLimiteEntrega: document.getElementById('dataLimiteEntrega'),
        status: document.getElementById('status'),
        statusGroup: document.getElementById('status-group'),
        itensDisponiveisContainer: document.getElementById('itens-disponiveis-container'),
        saveButton: document.getElementById('save-button'),
    };

    let clientesCache = [];

    async function populateClientesDropdown() {
        try {
            const clientes = await clienteService.getAll();
            clientesCache = clientes;
            elements.clienteId.innerHTML = '<option value="">Selecione um cliente</option>';
            clientes.forEach(c => {
                elements.clienteId.innerHTML += `<option value="${c.id}">${c.nomeEmpresa}</option>`;
            });
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
        }
    }

    async function populateEnderecosDropdown(clienteId) {
        elements.enderecoEntregaId.innerHTML = '<option value="">Carregando...</option>';
        if (!clienteId) {
            elements.enderecoEntregaId.innerHTML = '<option value="">Selecione um cliente primeiro</option>';
            return;
        }
        try {
            const enderecos = await enderecoClienteService.getAll(clienteId);
            elements.enderecoEntregaId.innerHTML = '<option value="">Selecione um endereço</option>';
            enderecos.forEach(e => {
                elements.enderecoEntregaId.innerHTML += `<option value="${e.id}">${e.logradouro}, ${e.numero}</option>`;
            });
        } catch (error) {
            console.error("Erro ao carregar endereços:", error);
            elements.enderecoEntregaId.innerHTML = '<option value="">Erro ao carregar</option>';
        }
    }

    async function loadAvailableItems() {
        try {
            const itens = await itemPedidoService.getItensPedido(true); // true => semPedido
            elements.itensDisponiveisContainer.innerHTML = '';
            if (itens.length === 0) {
                elements.itensDisponiveisContainer.innerHTML = '<p>Nenhum item disponível para associação.</p>';
                return;
            }
            itens.forEach(item => {
                const checkboxWrapper = document.createElement('div');
                checkboxWrapper.classList.add('checkbox-item');
                checkboxWrapper.innerHTML = `
                    <input type="checkbox" id="item-${item.id}" name="itensPedidoIds" value="${item.id}">
                    <label for="item-${item.id}">${item.descricao} (Qtd: ${item.quantidade})</label>
                `;
                elements.itensDisponiveisContainer.appendChild(checkboxWrapper);
            });
        } catch (error) {
            console.error("Erro ao carregar itens disponíveis:", error);
            elements.itensDisponiveisContainer.innerHTML = '<p>Erro ao carregar itens.</p>';
        }
    }

    function renderTable(pedidos) {
        elements.tableBody.innerHTML = '';
        if (!pedidos || pedidos.length === 0) {
            elements.tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nenhum pedido encontrado.</td></tr>';
            return;
        }
        pedidos.forEach(p => {
            const row = document.createElement('tr');
            row.dataset.id = p.id;
            const cliente = clientesCache.find(c => c.id === p.clienteId);
            row.innerHTML = `
                <td>${p.id}</td>
                <td>${cliente?.nomeEmpresa || 'N/A'}</td>
                <td>${new Date(p.dataLimiteEntrega).toLocaleDateString()}</td>
                <td>${p.status}</td>
                <td>${p.pesoTotalKg.toFixed(2)}</td>
                <td>${p.volumeTotalM3.toFixed(2)}</td>
                <td class="action-buttons">
                    <button class="button warning edit-button" data-id="${p.id}">Editar</button>
                    <button class="button danger delete-button" data-id="${p.id}">Excluir</button>
                </td>
            `;
            elements.tableBody.appendChild(row);
        });
    }

    async function loadPedidos() {
        elements.tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Carregando...</td></tr>';
        try {
            await populateClientesDropdown();
            const pedidos = await pedidoService.getAll();
            renderTable(pedidos);
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
            elements.tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Erro ao carregar os dados.</td></tr>';
        }
    }

    function showModal(mode = 'add', pedido = null) {
        elements.pedidoForm.reset();
        elements.statusGroup.style.display = mode === 'edit' ? 'block' : 'none';
        elements.itensDisponiveisContainer.innerHTML = ''; 

        if (mode === 'edit' && pedido) {
            elements.modalTitle.textContent = 'Editar Pedido';
            elements.pedidoId.value = pedido.id;
            elements.clienteId.value = pedido.clienteId;
            populateEnderecosDropdown(pedido.clienteId).then(() => {
                elements.enderecoEntregaId.value = pedido.enderecoEntregaId;
            });
            elements.dataLimiteEntrega.value = pedido.dataLimiteEntrega.split('T')[0];
            elements.status.value = pedido.status;
            // A lógica de edição de itens foi simplificada/removida por enquanto.
            
        } else {
            elements.modalTitle.textContent = 'Novo Pedido';
            elements.pedidoId.value = '';
            elements.enderecoEntregaId.innerHTML = '<option value="">Selecione um cliente</option>';
            loadAvailableItems(); // Carrega itens disponíveis para um novo pedido
        }

        elements.modalOverlay.classList.add('visible');
    }

    function hideModal() {
        elements.modalOverlay.classList.remove('visible');
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        const id = parseInt(elements.pedidoId.value, 10);
        
        const selectedItemCheckboxes = elements.pedidoForm.querySelectorAll('input[name="itensPedidoIds"]:checked');
        const selectedItensIds = Array.from(selectedItemCheckboxes).map(cb => parseInt(cb.value));

        const pedidoData = {
            clienteId: parseInt(elements.clienteId.value),
            enderecoEntregaId: parseInt(elements.enderecoEntregaId.value),
            dataLimiteEntrega: elements.dataLimiteEntrega.value,
            itensPedidoIds: selectedItensIds,
        };

        if (id) {
            pedidoData.id = id;
            pedidoData.status = elements.status.value;
        }

        elements.saveButton.disabled = true;
        try {
            if (id) {
                // A atualização com itens é complexa e foi desabilitada por enquanto.
                // Esta chamada pode falhar se o backend esperar uma estrutura diferente para update.
                await pedidoService.update(id, pedidoData);
            } else {
                await pedidoService.create(pedidoData);
            }
            hideModal();
            loadPedidos();
        } catch (error) {
            console.error(`Erro ao salvar pedido:`, error);
            alert('Não foi possível salvar o pedido.');
        } finally {
            elements.saveButton.disabled = false;
        }
    }

    async function handleDelete(id) {
        if (!confirm('Tem certeza?')) return;
        try {
            await pedidoService.remove(id);
            loadPedidos();
        } catch (error) {
            console.error(`Erro ao excluir pedido:`, error);
            alert('Não foi possível excluir o pedido.');
        }
    }

    // --- LÓGICA PRINCIPAL ---
    loadPedidos();
    elements.clienteId.addEventListener('change', () => populateEnderecosDropdown(elements.clienteId.value));
    elements.addButton.addEventListener('click', () => showModal('add'));
    elements.closeModalButton.addEventListener('click', hideModal);
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) {
            hideModal();
        }
    });
    elements.pedidoForm.addEventListener('submit', handleFormSubmit);

    elements.tableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('edit-button')) {
            const id = parseInt(event.target.dataset.id);
            try {
                const pedido = await pedidoService.getById(id);
                showModal('edit', pedido);
            } catch(err) {
                console.error("Erro ao buscar pedido para edição:", err);
                alert("Não foi possível carregar os dados do pedido.");
            }
        } else if (event.target.classList.contains('delete-button')) {
            const id = parseInt(event.target.dataset.id);
            handleDelete(id);
        }
    });

    const destroy = () => { console.log("Limpando página de pedidos."); };
    return destroy;
}
window.initPedidosPage = initPedidosPage;
