import * as pedidoService from '../js/services/pedidoService.js';
import * as clienteService from '../js/services/clienteService.js';
import * as enderecoClienteService from '../js/services/enderecoClienteService.js';
import { initItemPedidoManager } from './item-pedido.js';
import * as itemPedidoService from '../js/services/itemPedidoService.js';

function initPedidosPage() {
    const elements = {
        tableBody: document.getElementById('pedidos-table-body'),
        addButton: document.getElementById('add-pedido-button'),
        modalOverlay: document.getElementById('pedido-modal-overlay'),
        modalTitle: document.getElementById('modal-title'),
        closeModalButton: document.getElementById('close-modal-button'),
        cancelButton: document.getElementById('cancel-button'),
        pedidoForm: document.getElementById('pedido-form'),
        pedidoId: document.getElementById('pedido-id'),
        clienteId: document.getElementById('clienteId'),
        enderecoEntregaId: document.getElementById('enderecoEntregaId'),
        dataLimiteEntrega: document.getElementById('dataLimiteEntrega'),
        pesoTotalKg: document.getElementById('pesoTotalKg'),
        volumeTotalM3: document.getElementById('volumeTotalM3'),
        status: document.getElementById('status'),
        saveButton: document.getElementById('save-button'),
    };

    const itemElements = {
        tableBody: document.getElementById('itens-pedido-table-body'),
        form: document.getElementById('item-pedido-form'),
        id: document.getElementById('item-pedido-id'),
        descricao: document.getElementById('item-descricao'),
        quantidade: document.getElementById('item-quantidade'),
        peso: document.getElementById('item-peso'),
        volume: document.getElementById('item-volume'),
        codigo: document.getElementById('item-codigo'),
        addButton: document.getElementById('add-item-button'),
        updateButton: document.getElementById('update-item-button'),
        cancelEditButton: document.getElementById('cancel-edit-item-button'),
    };

    const itemManager = initItemPedidoManager(itemElements);
    let clientesCache = []; // Cache para evitar buscas repetidas

    async function populateClientesDropdown() {
        try {
            const clientes = await clienteService.getAll();
            clientesCache = clientes; // Armazena em cache
            elements.clienteId.innerHTML = '<option value="">Selecione um cliente</option>';
            clientes.forEach(c => {
                elements.clienteId.innerHTML += `<option value="${c.id}">${c.nomeEmpresa}</option>`;
            });
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
        }
    }

    async function populateEnderecosDropdown(clienteId) {
        elements.enderecoEntregaId.innerHTML = '<option value="">Carregando endereços...</option>';
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
    
    elements.clienteId.addEventListener('change', () => {
        populateEnderecosDropdown(elements.clienteId.value);
    });

    function renderTable(pedidos) {
        elements.tableBody.innerHTML = '';
        if (!pedidos || pedidos.length === 0) {
            elements.tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nenhum pedido encontrado.</td></tr>';
            return;
        }
        pedidos.forEach(p => {
            const row = document.createElement('tr');
            row.dataset.id = p.id;
            // Assumindo que a API retorna o nome do cliente. Se não, precisaria buscar e mapear.
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
            // Carrega clientes primeiro para ter o cache para a renderização da tabela
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
        elements.pedidoId.value = '';
        itemManager.clear();

        // Lógica para o status 'Em Rota'
        const emRotaOption = elements.status.querySelector('option[value="EmRota"]');
        if (mode === 'add') {
            emRotaOption.style.display = 'none'; // Esconde a opção
            elements.status.value = 'Pendente'; // Garante que não vai ser o valor escondido
        } else {
            emRotaOption.style.display = 'block'; // Mostra a opção
        }


        // Sempre popula clientes, e se for edição, popula os endereços também
        populateClientesDropdown().then(() => {
            if (mode === 'edit' && pedido) {
                elements.modalTitle.textContent = 'Editar Pedido';
                elements.pedidoId.value = pedido.id;
                elements.clienteId.value = pedido.clienteId;
                populateEnderecosDropdown(pedido.clienteId).then(() => {
                    elements.enderecoEntregaId.value = pedido.enderecoEntregaId;
                });
                elements.dataLimiteEntrega.value = pedido.dataLimiteEntrega.split('T')[0];
                elements.pesoTotalKg.value = pedido.pesoTotalKg.toFixed(2);
                elements.volumeTotalM3.value = pedido.volumeTotalM3.toFixed(2);
                elements.status.value = pedido.status;

                // Carrega os itens do pedido
                itemManager.loadItems(pedido.itensPedido);

            } else {
                elements.modalTitle.textContent = 'Novo Pedido';
                elements.enderecoEntregaId.innerHTML = '<option value="">Selecione um cliente primeiro</option>';
            }
        });
        elements.modalOverlay.classList.add('visible');
    }

    function hideModal() {
        elements.modalOverlay.classList.remove('visible');
        elements.pedidoForm.reset();
        itemManager.clear();
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        const id = parseInt(elements.pedidoId.value, 10);
        const pedidoData = {
            clienteId: parseInt(elements.clienteId.value),
            enderecoEntregaId: parseInt(elements.enderecoEntregaId.value),
            dataLimiteEntrega: elements.dataLimiteEntrega.value,
            status: elements.status.value,
            itensPedido: itemManager.getItems(), // Pega os itens do gerenciador
        };

        elements.saveButton.disabled = true;
        try {
            if (id) {
                // Para edição, o ideal é que o backend saiba como lidar com a lista de itens.
                // Se um item tem ID, é uma atualização. Se não tem, é uma adição.
                // Itens que foram removidos da lista no front não serão enviados, o backend precisa tratar isso.
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
    elements.addButton.addEventListener('click', () => showModal('add'));
    elements.closeModalButton.addEventListener('click', hideModal);
    elements.cancelButton.addEventListener('click', hideModal);
    elements.modalOverlay.addEventListener('click', (e) => { if (e.target === elements.modalOverlay) hideModal(); });
    elements.pedidoForm.addEventListener('submit', handleFormSubmit);
    // Delegação de eventos para botões de ação na tabela
    elements.tableBody.addEventListener('click', async (event) => {
        const target = event.target;
        const id = parseInt(target.dataset.id);
        if (target.classList.contains('edit-button')) {
            const pedido = await pedidoService.getById(id);
            showModal('edit', pedido);
        } else if (target.classList.contains('delete-button')) {
            handleDelete(id);
        }
    });

    const destroy = () => { console.log("Limpando página de pedidos."); };
    return destroy;
}
window.initPedidosPage = initPedidosPage;
