function initPedidosPage() {
    console.log('[Pedidos] initPedidosPage started.');

    const tableBody = document.querySelector('#pedidos-table tbody');
    const modal = document.getElementById('pedido-modal');
    const addBtn = document.getElementById('add-pedido-btn');

    if (!tableBody || !modal || !addBtn) {
        console.error('[Pedidos] Elementos essenciais não encontrados.');
        return;
    }

    const closeButton = modal.querySelector('.close-button');
    const cancelBtn = modal.querySelector('#cancel-btn');
    const pedidoForm = document.getElementById('pedido-form');
    const formError = modal.querySelector('#form-error');
    const modalTitle = modal.querySelector('#modal-title');
    
    // Inputs
    const pedidoIdInput = document.getElementById('pedido-id');
    const clienteSelect = document.getElementById('pedido-cliente');
    const enderecoSelect = document.getElementById('pedido-endereco');
    const dataInput = document.getElementById('pedido-data');
    const statusInput = document.getElementById('pedido-status');

    const statusMap = ['Pendente', 'Em Rota', 'Entregue', 'Cancelado'];

    const openModal = async (pedido = null) => {
        formError.style.display = 'none';
        pedidoForm.reset();
        
        // Popula o seletor de clientes
        clienteSelect.innerHTML = '<option value="">Carregando...</option>';
        const clientes = await clienteService.getClientes();
        clienteSelect.innerHTML = '<option value="">Selecione um cliente</option>';
        clientes.forEach(c => {
            clienteSelect.innerHTML += `<option value="${c.id}">${c.nomeEmpresa}</option>`;
        });

        if (pedido) {
            modalTitle.textContent = 'Editar Pedido';
            pedidoIdInput.value = pedido.id;
            clienteSelect.value = pedido.clienteId;
            // Carrega os endereços para o cliente selecionado
            await populateEnderecos(pedido.clienteId);
            enderecoSelect.value = pedido.enderecoEntregaId;
            dataInput.value = pedido.dataCriacao?.split('T')[0];
            statusInput.value = pedido.status;
            statusInput.disabled = false; // Permite alterar o status ao editar
        } else {
            modalTitle.textContent = 'Adicionar Pedido';
            pedidoIdInput.value = '';
            enderecoSelect.innerHTML = '<option value="">Selecione um cliente primeiro</option>';
            dataInput.valueAsDate = new Date();
            statusInput.value = 0; // Pendente
            statusInput.disabled = true; // Status inicial é sempre pendente
        }
        modal.style.display = 'block';
    };

    const populateEnderecos = async (clienteId) => {
        enderecoSelect.innerHTML = '<option value="">Carregando...</option>';
        if (!clienteId) {
            enderecoSelect.innerHTML = '<option value="">Selecione um cliente primeiro</option>';
            return;
        }
        try {
            const enderecos = await enderecoClienteService.getEnderecos(clienteId);
            enderecoSelect.innerHTML = '<option value="">Selecione um endereço</option>';
            enderecos.forEach(e => {
                enderecoSelect.innerHTML += `<option value="${e.id}">${e.logradouro}, ${e.numero} - ${e.cidade}</option>`;
            });
        } catch (error) {
             console.error('[Pedidos] Erro ao carregar endereços:', error);
             enderecoSelect.innerHTML = '<option value="">Erro ao carregar</option>';
        }
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    const loadPedidos = async () => {
        try {
            const pedidos = await pedidoService.getPedidos();
            tableBody.innerHTML = '';
            pedidos.forEach(p => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${p.id}</td>
                    <td>${p.cliente?.nomeEmpresa || 'N/A'}</td>
                    <td>${new Date(p.dataCriacao).toLocaleDateString()}</td>
                    <td>${statusMap[p.status] || 'Desconhecido'}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" data-id="${p.id}">Editar</button>
                        <button class="btn-delete" data-id="${p.id}">Excluir</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('[Pedidos] Erro ao carregar pedidos:', error);
            tableBody.innerHTML = `<tr><td colspan="5">Erro ao carregar pedidos.</td></tr>`;
        }
    };

    // --- Event Listeners ---
    addBtn.addEventListener('click', () => openModal());
    closeButton.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    clienteSelect.addEventListener('change', () => populateEnderecos(clienteSelect.value));

    const windowClickListener = (event) => {
        if (event.target == modal) closeModal();
    };
    window.addEventListener('click', windowClickListener);

    pedidoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        formError.style.display = 'none';

        const pedidoData = {
            id: pedidoIdInput.value ? parseInt(pedidoIdInput.value) : 0,
            clienteId: parseInt(clienteSelect.value),
            enderecoEntregaId: parseInt(enderecoSelect.value),
            dataCriacao: dataInput.value,
            status: parseInt(statusInput.value),
            // Itens do pedido não gerenciados nesta UI simplificada
            itensPedido: [], 
            pesoTotalKg: 0,
            volumeTotalM3: 0
        };

        try {
            if (pedidoData.id) {
                await pedidoService.updatePedido(pedidoData.id, pedidoData);
            } else {
                const { id, ...createData } = pedidoData;
                await pedidoService.createPedido(createData);
            }
            closeModal();
            loadPedidos();
        } catch (error) {
            const errorMessage = error.data?.message || (typeof error.data === 'string' ? error.data : 'Ocorreu um erro ao salvar.');
            formError.textContent = errorMessage;
            formError.style.display = 'block';
        }
    });

    tableBody.addEventListener('click', async (event) => {
        const id = event.target.getAttribute('data-id');
        if (!id) return;

        if (event.target.classList.contains('btn-edit')) {
            try {
                const pedido = await pedidoService.getPedidoById(id);
                openModal(pedido);
            } catch (error) {
                alert('Não foi possível carregar os dados do pedido.');
            }
        }

        if (event.target.classList.contains('btn-delete')) {
            if (confirm('Tem certeza que deseja excluir este pedido?')) {
                try {
                    await pedidoService.deletePedido(id);
                    loadPedidos();
                } catch (error) {
                    alert('Não foi possível excluir o pedido.');
                }
            }
        }
    });

    loadPedidos();

    return () => {
        console.log('[Pedidos] Destroying page...');
        window.removeEventListener('click', windowClickListener);
    };
}
