// pages/itens-pedido.js
import itemPedidoService from '../js/services/itemPedidoService.js';

function initItensPedidoPage() {
    // Mapeamento de elementos do DOM
    const elements = {
        tableBody: document.querySelector('#itens-disponiveis-table tbody'),
        addButton: document.getElementById('add-item-button'),
        modalOverlay: document.getElementById('item-modal-overlay'),
        modalTitle: document.getElementById('modal-title'),
        closeModalButton: document.getElementById('close-modal-button'),
        itemForm: document.getElementById('item-form'),
        itemId: document.getElementById('item-id'),
        saveButton: document.getElementById('save-button'),
        errorMessage: document.getElementById('error-message')
    };

    function renderTable(items) {
        elements.tableBody.innerHTML = '';
        if (items.length === 0) {
            elements.tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum item disponível. Crie um novo!</td></tr>';
            return;
        }
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.descricao}</td>
                <td>${item.quantidade}</td>
                <td>${item.pesoUnitarioKg}</td>
                <td>${item.volumeUnitarioM3}</td>
                <td>${item.codigoProduto || ''}</td>
                <td><button class="button danger delete-btn" data-id="${item.id}">Excluir</button></td>
            `;
            elements.tableBody.appendChild(row);
        });
    }

    async function loadItensDisponiveis() {
        try {
            const items = await itemPedidoService.getItensPedido(true); // true para buscar itens sem pedido
            renderTable(items);
        } catch (error) {
            console.error(error);
            elements.tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Falha ao carregar itens.</td></tr>';
        }
    }

    function showModal() {
        elements.itemForm.reset();
        elements.itemId.value = '';
        elements.modalTitle.textContent = 'Novo Item';
        elements.errorMessage.textContent = '';
        elements.modalOverlay.classList.add('visible');
    }

    function hideModal() {
        elements.modalOverlay.classList.remove('visible');
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        elements.errorMessage.textContent = '';
        elements.saveButton.disabled = true;

        const formData = new FormData(elements.itemForm);
        const itemData = {
            // id é omitido para criação
            descricao: formData.get('descricao'),
            quantidade: parseInt(formData.get('quantidade'), 10),
            pesoUnitarioKg: parseFloat(formData.get('peso')),
            volumeUnitarioM3: parseFloat(formData.get('volume')),
            codigoProduto: formData.get('codigo') || null,
            pedidoId: null
        };

        try {
            await itemPedidoService.createItemPedido(itemData);
            hideModal();
            loadItensDisponiveis(); // Recarrega a lista
        } catch (error) {
            console.error('Falha ao criar item:', error);
            elements.errorMessage.textContent = error.data?.message || 'Erro desconhecido ao salvar. Tente novamente.';
        } finally {
            elements.saveButton.disabled = false;
        }
    }

    async function handleDelete(event) {
        if (!event.target.classList.contains('delete-btn')) return;

        const id = event.target.dataset.id;
        if (confirm(`Tem certeza que deseja excluir o item ${id}?`)) {
            try {
                await itemPedidoService.deleteItemPedido(id);
                loadItensDisponiveis();
            } catch (error) {
                console.error('Falha ao deletar item:', error);
                alert(error.data?.message || 'Não foi possível excluir o item.');
            }
        }
    }
    
    // --- LÓGICA PRINCIPAL ---
    // Adiciona event listeners
    elements.addButton.addEventListener('click', showModal);
    elements.closeModalButton.addEventListener('click', hideModal);
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) {
            hideModal();
        }
    });
    elements.itemForm.addEventListener('submit', handleFormSubmit);
    elements.tableBody.addEventListener('click', handleDelete);

    // Carrega os itens ao iniciar a página
    loadItensDisponiveis();
    
    // Retorna função de limpeza se necessário
    return () => {
        console.log('Limpando página de itens de pedido.');
    };
}

// Inicializa a página
initItensPedidoPage();