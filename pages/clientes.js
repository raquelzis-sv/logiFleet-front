// Importa o serviço de clientes
import * as clienteService from '../js/services/clienteService.js';

function initClientesPage() {
    const elements = {
        tableBody: document.getElementById('clientes-table-body'),
        addButton: document.getElementById('add-cliente-button'),
        modalOverlay: document.getElementById('cliente-modal-overlay'),
        modalTitle: document.getElementById('modal-title'),
        closeModalButton: document.getElementById('close-modal-button'),
        cancelButton: document.getElementById('cancel-button'),
        clienteForm: document.getElementById('cliente-form'),
        clienteId: document.getElementById('cliente-id'),
        nomeEmpresa: document.getElementById('nomeEmpresa'),
        cnpj: document.getElementById('cnpj'),
        nomeContato: document.getElementById('nomeContato'),
        telefone: document.getElementById('telefone'),
        email: document.getElementById('email'),
        saveButton: document.getElementById('save-button'),
    };

    /** Renderiza os clientes na tabela */
    function renderTable(clientes) {
        elements.tableBody.innerHTML = '';
        if (!clientes || clientes.length === 0) {
            elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum cliente encontrado.</td></tr>';
            return;
        }
        clientes.forEach(cliente => {
            const row = document.createElement('tr');
            row.dataset.id = cliente.id;
            row.innerHTML = `
                <td>${cliente.nomeEmpresa || ''}</td>
                <td>${cliente.cnpj || ''}</td>
                <td>${cliente.nomeContato || ''}</td>
                <td>${cliente.telefone || ''}</td>
                <td>${cliente.email || ''}</td>
                <td class="action-buttons">
                    <button class="button warning edit-button" data-id="${cliente.id}">Editar</button>
                    <button class="button danger delete-button" data-id="${cliente.id}">Excluir</button>
                </td>
            `;
            elements.tableBody.appendChild(row);
        });
    }

    async function loadClientes() {
        elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Carregando...</td></tr>';
        try {
            const clientes = await clienteService.getAll();
            renderTable(clientes);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Erro ao carregar os dados. Verifique o console (F12).</td></tr>';
        }
    }

    function showModal(mode = 'add', cliente = null) {
        elements.clienteForm.reset();
        elements.clienteId.value = '';

        if (mode === 'edit' && cliente) {
            elements.modalTitle.textContent = 'Editar Cliente';
            elements.clienteId.value = cliente.id;
            elements.nomeEmpresa.value = cliente.nomeEmpresa;
            elements.cnpj.value = cliente.cnpj;
            elements.nomeContato.value = cliente.nomeContato;
            elements.telefone.value = cliente.telefone;
            elements.email.value = cliente.email;
        } else {
            elements.modalTitle.textContent = 'Adicionar Cliente';
        }
        elements.modalOverlay.classList.add('visible');
    }

    function hideModal() {
        elements.modalOverlay.classList.remove('visible');
        elements.clienteForm.reset();
        elements.clienteId.value = '';
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        const id = parseInt(elements.clienteId.value, 10);
        const clienteData = {
            nomeEmpresa: elements.nomeEmpresa.value,
            cnpj: elements.cnpj.value,
            nomeContato: elements.nomeContato.value,
            telefone: elements.telefone.value,
            email: elements.email.value,
        };

        elements.saveButton.textContent = 'Salvando...';
        elements.saveButton.disabled = true;

        try {
            if (id) {
                await clienteService.update(id, clienteData);
            } else {
                await clienteService.create(clienteData);
            }
            hideModal();
            loadClientes();
        } catch (error) {
            console.error(`Erro ao salvar cliente:`, error);
            alert('Não foi possível salvar o cliente. Verifique os dados e tente novamente.');
        } finally {
            elements.saveButton.textContent = 'Salvar';
            elements.saveButton.disabled = false;
        }
    }

    async function handleDelete(id) {
        if (!confirm('Tem certeza de que deseja excluir este cliente?')) return;
        
        try {
            await clienteService.remove(id);
            loadClientes();
        } catch (error) {
            console.error(`Erro ao excluir cliente:`, error);
            alert('Não foi possível excluir o cliente.');
        }
    }

    async function handleTableClick(event) {
        const target = event.target;
        const id = parseInt(target.dataset.id, 10);

        if (target.classList.contains('edit-button')) {
            try {
                // Re-fetch all data to get the most current version for editing
                const clientes = await clienteService.getAll();
                const cliente = clientes.find(c => c.id === id);
                if (cliente) {
                    showModal('edit', cliente);
                }
            } catch (error) {
                console.error(`Erro ao buscar dados do cliente para edição:`, error);
                alert("Não foi possível carregar os dados para edição.");
            }
        } else if (target.classList.contains('delete-button')) {
            handleDelete(id);
        }
    }

    // --- LÓGICA PRINCIPAL E EVENT LISTENERS ---

    loadClientes();
    elements.addButton.addEventListener('click', () => showModal('add'));
    elements.closeModalButton.addEventListener('click', hideModal);
    elements.cancelButton.addEventListener('click', hideModal);
    elements.modalOverlay.addEventListener('click', (e) => { if (e.target === elements.modalOverlay) hideModal(); });
    elements.clienteForm.addEventListener('submit', handleFormSubmit);
    elements.tableBody.addEventListener('click', handleTableClick);

    const destroy = () => {
        // Cleanup function for router
        console.log("Limpando listeners da página de clientes.");
    };

    return destroy;
}

window.initClientesPage = initClientesPage;
