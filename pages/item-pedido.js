// Responsável por gerenciar a UI e o estado dos itens DENTRO do modal de Pedido

function initItemPedidoManager(itemElements) {
    let items = []; // Array para manter os itens do pedido em memória
    let editingItemId = null;

    function renderItems() {
        if (!itemElements.tableBody) {
            return;
        }
        itemElements.tableBody.innerHTML = '';
        if (items.length === 0) {
            itemElements.tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum item adicionado.</td></tr>';
            return;
        }
        items.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id || 'Novo'}</td>
                <td>${item.descricao}</td>
                <td>${item.quantidade}</td>
                <td class="action-buttons">
                    <button type="button" class="button warning edit-item-button" data-index="${index}">E</button>
                    <button type="button" class="button danger remove-item-button" data-index="${index}">X</button>
                </td>
            `;
            itemElements.tableBody.appendChild(row);
        });
    }

    function clearForm() {
        if (!itemElements.form) {
            return;
        }
        itemElements.form.reset();
        itemElements.id.value = '';
        editingItemId = null;
        itemElements.addButton.style.display = 'inline-block';
        itemElements.updateButton.style.display = 'none';
        itemElements.cancelEditButton.style.display = 'none';
    }

    function handleAddItem() {
        if (!itemElements.form.checkValidity()) {
            // Idealmente, mostre uma mensagem mais específica
            alert('Por favor, preencha todos os campos do item corretamente.');
            return;
        }

        const newItem = {
            id: null, // Novo item não tem ID ainda
            descricao: itemElements.descricao.value,
            quantidade: parseInt(itemElements.quantidade.value),
            pesoUnitarioKg: parseFloat(itemElements.peso.value),
            volumeUnitarioM3: parseFloat(itemElements.volume.value),
            codigoProduto: itemElements.codigo.value,
            // PedidoId será associado no backend
        };
        items.push(newItem);
        renderItems();
        clearForm();
    }
    
    function handleUpdateItem() {
        if (!itemElements.form.checkValidity() || editingItemId === null) return;
        
        const item = items[editingItemId];
        item.descricao = itemElements.descricao.value;
        item.quantidade = parseInt(itemElements.quantidade.value);
        item.pesoUnitarioKg = parseFloat(itemElements.peso.value);
        item.volumeUnitarioM3 = parseFloat(itemElements.volume.value);
        item.codigoProduto = itemElements.codigo.value;

        renderItems();
        clearForm();
    }

    function startEditItem(index) {
        editingItemId = index;
        const item = items[index];

        itemElements.descricao.value = item.descricao;
        itemElements.quantidade.value = item.quantidade;
        itemElements.peso.value = item.pesoUnitarioKg;
        itemElements.volume.value = item.volumeUnitarioM3;
        itemElements.codigo.value = item.codigoProduto || '';
        
        itemElements.addButton.style.display = 'none';
        itemElements.updateButton.style.display = 'inline-block';
        itemElements.cancelEditButton.style.display = 'inline-block';
    }

    function handleRemoveItem(index) {
        items.splice(index, 1);
        renderItems();
    }

    // --- Event Listeners ---
    itemElements.addButton.addEventListener('click', handleAddItem);
    itemElements.updateButton.addEventListener('click', handleUpdateItem);
    itemElements.cancelEditButton.addEventListener('click', clearForm);
    itemElements.tableBody.addEventListener('click', (e) => {
        const index = e.target.dataset.index;
        if (e.target.classList.contains('edit-item-button')) {
            startEditItem(index);
        } else if (e.target.classList.contains('remove-item-button')) {
            handleRemoveItem(index);
        }
    });

    // --- Interface Pública do Módulo ---
    return {
        // Carrega os itens de um pedido existente
        loadItems: (existingItems) => {
            items = existingItems ? [...existingItems] : [];
            renderItems();
        },
        // Retorna a lista atual de itens
        getItems: () => {
            return items;
        },
        // Limpa a lista de itens
        clear: () => {
            items = [];
            editingItemId = null;
            renderItems();
            clearForm();
        }
    };
}

// Exporta a função de inicialização para ser usada em pedidos.js
export { initItemPedidoManager };
