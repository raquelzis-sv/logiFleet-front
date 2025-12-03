import * as itemPedidoService from '../js/services/itemPedidoService.js';

function initItensPedidoPage() {
    const elements = {
        tableBody: document.getElementById('itens-table-body'),
        addButton: document.getElementById('add-item-button'),
        modalOverlay: document.getElementById('item-modal-overlay'),
        modalTitle: document.getElementById('modal-title'),
        closeModalButton: document.getElementById('close-modal-button'),
        itemForm: document.getElementById('item-form'),
        itemId: document.getElementById('item-id'),
        itemDescricao: document.getElementById('item-descricao'),
        itemPeso: document.getElementById('item-peso'),
        itemVolume: document.getElementById('item-volume'),
        itemCodigo: document.getElementById('item-codigo'),
        itemQuantidade: document.getElementById('item-quantidade'),
        saveButton: document.getElementById('save-button'),
    };

    function renderTable(itens) {
        elements.tableBody.innerHTML = '';
        if (!itens || itens.length === 0) {
            elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum item encontrado.</td></tr>';
            return;
        }
        itens.forEach(item => {
            const row = document.createElement('tr');
            row.dataset.id = item.id;
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.descricao}</td>
                <td>${item.pesoUnitarioKg.toFixed(2)}</td>
                <td>${item.volumeUnitarioM3.toFixed(2)}</td>
                <td>${item.codigoProduto || 'N/A'}</td>
                <td class="action-buttons">
                    <button class="button warning edit-button" data-id="${item.id}">Editar</button>
                    <button class="button danger delete-button" data-id="${item.id}">Excluir</button>
                </td>
            `;
            elements.tableBody.appendChild(row);
        });
    }

    async function loadItens() {
        elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Carregando...</td></tr>';
        try {
            const itens = await itemPedidoService.getAll();
            renderTable(itens);
        } catch (error) {
            console.error('Erro ao carregar itens:', error);
            elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Erro ao carregar os dados.</td></tr>';
        }
    }

    function showModal(mode = 'add', item = null) {
        elements.itemForm.reset();
        if (mode === 'edit' && item) {
            elements.modalTitle.textContent = 'Editar Item';
            elements.itemId.value = item.id;
            elements.itemDescricao.value = item.descricao;
            elements.itemPeso.value = item.pesoUnitarioKg;
            elements.itemVolume.value = item.volumeUnitarioM3;
            elements.itemCodigo.value = item.codigoProduto;
            elements.itemQuantidade.value = item.quantidade;
        } else {
            elements.modalTitle.textContent = 'Novo Item';
            elements.itemId.value = '';
        }
        elements.modalOverlay.classList.add('visible');
    }

    function hideModal() {
        elements.modalOverlay.classList.remove('visible');
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        const id = parseInt(elements.itemId.value, 10);
        const itemData = {
            id: id || 0,
            descricao: elements.itemDescricao.value,
            pesoUnitarioKg: parseFloat(elements.itemPeso.value),
            volumeUnitarioM3: parseFloat(elements.itemVolume.value),
            codigoProduto: elements.itemCodigo.value,
            quantidade: parseInt(elements.itemQuantidade.value),
        };

        elements.saveButton.disabled = true;
        try {
            if (id) {
                await itemPedidoService.update(id, itemData);
            } else {
                await itemPedidoService.create(itemData);
            }
            hideModal();
            loadItens();
        } catch (error) {
            console.error(`Erro ao salvar item:`, error);
            alert('Não foi possível salvar o item.');
        } finally {
            elements.saveButton.disabled = false;
        }
    }

    async function handleDelete(id) {
        if (!confirm('Tem certeza?')) return;
        try {
            await itemPedidoService.remove(id);
            loadItens();
        } catch (error) {
            console.error(`Erro ao excluir item:`, error);
            alert('Não foi possível excluir o item. Ele pode estar associado a um pedido.');
        }
    }

    // --- LÓGICA PRINCIPAL ---
    loadItens();
    elements.addButton.addEventListener('click', () => {
        console.log('Botão "Novo Item" clicado!');
        showModal('add');
    });
    elements.closeModalButton.addEventListener('click', hideModal);
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) {
            hideModal();
        }
    });
    elements.itemForm.addEventListener('submit', handleFormSubmit);

    elements.tableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('edit-button')) {
            const id = parseInt(event.target.dataset.id);
            const item = await itemPedidoService.getById(id);
            showModal('edit', item);
        } else if (event.target.classList.contains('delete-button')) {
            const id = parseInt(event.target.dataset.id);
            handleDelete(id);
        }
    });

    const destroy = () => { console.log("Limpando página de itens de pedido."); };
    return destroy;
}

window.initItensPedidoPage = initItensPedidoPage;
