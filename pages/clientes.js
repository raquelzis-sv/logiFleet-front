// Importa o serviço de clientes
import * as clienteService from '../js/services/clienteService.js';
import * as enderecoClienteService from '../js/services/enderecoClienteService.js';

function initClientesPage() {
    const elements = {
        tableBody: document.getElementById('clientes-table-body'),
        addButton: document.getElementById('add-cliente-button'),
        // Modal de Cliente (Criação/Edição)
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
        manageEnderecosButtonContainer: document.getElementById('manage-enderecos-button-container'),
        manageEnderecosButton: document.getElementById('manage-enderecos-button'),
        // Modal de Endereços (Lista)
        enderecosModalOverlay: document.getElementById('enderecos-modal-overlay'),
        enderecosModalTitle: document.getElementById('enderecos-modal-title'),
        enderecosListContainer: document.getElementById('enderecos-list-container'),
        closeEnderecosModalButton: document.getElementById('close-enderecos-modal-button'),
        // Modal de Endereços (Formulário)
        enderecoFormModalOverlay: document.getElementById('endereco-form-modal-overlay'),
        enderecoFormModalTitle: document.getElementById('endereco-form-modal-title'),
        closeEnderecoFormModalButton: document.getElementById('close-endereco-form-modal-button'),
        enderecoForm: document.getElementById('endereco-form'),
        enderecoId: document.getElementById('endereco-id'),
        enderecoClienteId: document.getElementById('endereco-cliente-id'),
        cep: document.getElementById('cep'),
        logradouro: document.getElementById('logradouro'),
        numero: document.getElementById('numero'),
        bairro: document.getElementById('bairro'),
        cidade: document.getElementById('cidade'),
        uf: document.getElementById('uf'),
        complemento: document.getElementById('complemento'),
        saveEnderecoButton: document.getElementById('save-endereco-button'),
        enderecoFormErrorMessage: document.getElementById('endereco-form-error-message'),
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
                    <button class="button info enderecos-button" data-id="${cliente.id}">Ver Endereços</button>
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

    function showClienteModal(mode = 'add', cliente = null) {
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
            elements.manageEnderecosButtonContainer.style.display = 'block';
            elements.manageEnderecosButton.dataset.id = cliente.id;
        } else {
            elements.modalTitle.textContent = 'Adicionar Cliente';
            elements.manageEnderecosButtonContainer.style.display = 'none';
        }
        elements.modalOverlay.classList.add('visible');
    }

    function hideClienteModal() {
        elements.modalOverlay.classList.remove('visible');
        elements.clienteForm.reset();
        elements.clienteId.value = '';
        elements.manageEnderecosButtonContainer.style.display = 'none';
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
            hideClienteModal();
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

    // --- Lógica para o Modal de Endereços (Lista) ---
    async function handleShowEnderecos(clienteId) {
        const cliente = (await clienteService.getAll()).find(c => c.id === clienteId);
        elements.enderecosModalTitle.textContent = `Endereços de ${cliente?.nomeEmpresa || 'Cliente'}`;
        elements.enderecosListContainer.innerHTML = '<p style="text-align:center;">Carregando endereços...</p>';
        elements.enderecosModalOverlay.classList.add('visible');

        try {
            const enderecos = await enderecoClienteService.getAll(clienteId);
            populateEnderecosModal(enderecos, clienteId);
        } catch (error) {
            console.error(`Erro ao carregar endereços para o cliente ${clienteId}:`, error);
            elements.enderecosListContainer.innerHTML = '<p class="error-message" style="text-align:center;">Erro ao carregar endereços.</p>';
        }
    }

    function populateEnderecosModal(enderecos, clienteId) {
        let contentHtml = `
            <div class="enderecos-list-header">
                <h3>Lista de Endereços</h3>
                <button class="button success" id="add-endereco-button" data-cliente-id="${clienteId}">Adicionar Novo Endereço</button>
            </div>
            <hr>
        `;

        if (enderecos.length === 0) {
            contentHtml += '<p style="text-align:center;">Nenhum endereço cadastrado.</p>';
        } else {
            enderecos.forEach(end => {
                const geocodedStatusClass = (end.latitude !== 0 || end.longitude !== 0) ? 'geocoded-ok' : 'geocoded-fail';
                const geocodedStatusText = (end.latitude !== 0 || end.longitude !== 0) ? 'Geocodificado' : 'Não Geocodificado';

                contentHtml += `
                    <div class="endereco-card">
                        <h4>${end.logradouro}, ${end.numero || 'S/N'}</h4>
                        <p>${end.bairro} - ${end.cidade}/${end.uf} - CEP: ${end.cep}</p>
                        <p>Complemento: ${end.complemento || 'Nenhum'}</p>
                        <p class="${geocodedStatusClass}">
                            Latitude: ${end.latitude !== 0 ? end.latitude.toFixed(6) : 'N/A'}, 
                            Longitude: ${end.longitude !== 0 ? end.longitude.toFixed(6) : 'N/A'} 
                            (${geocodedStatusText})
                        </p>
                        <div class="address-actions">
                            <button class="button warning edit-endereco-button" data-id="${end.id}" data-cliente-id="${clienteId}">Editar</button>
                            <button class="button danger delete-endereco-button" data-id="${end.id}" data-cliente-id="${clienteId}">Excluir</button>
                        </div>
                    </div>
                `;
            });
        }
        elements.enderecosListContainer.innerHTML = contentHtml;
    }

    // --- LÓGICA PRINCIPAL E EVENT LISTENERS ---

    async function handleTableClick(event) {
        const target = event.target;
        const id = parseInt(target.dataset.id, 10);

        if (target.classList.contains('edit-button')) {
            try {
                // Use getById for a single client for efficiency and to ensure full data
                const cliente = await clienteService.getById(id);
                if (cliente) {
                    showClienteModal('edit', cliente);
                }
            } catch (error) {
                console.error(`Erro ao buscar dados do cliente para edição:`, error);
                alert("Não foi possível carregar os dados para edição.");
            }
        } else if (target.classList.contains('delete-button')) {
            handleDelete(id);
        } else if (target.classList.contains('enderecos-button')) {
            handleShowEnderecos(id);
        }
    }

    loadClientes();
    elements.addButton.addEventListener('click', () => showClienteModal('add'));
    elements.closeModalButton.addEventListener('click', hideClienteModal);
    elements.cancelButton.addEventListener('click', hideClienteModal);
    elements.modalOverlay.addEventListener('click', (e) => { if (e.target === elements.modalOverlay) hideClienteModal(); });
    elements.clienteForm.addEventListener('submit', handleFormSubmit);
    elements.tableBody.addEventListener('click', handleTableClick);

    // Event listeners para o modal de endereços (Lista)
    elements.manageEnderecosButton.addEventListener('click', (event) => {
        const clienteId = parseInt(event.target.dataset.id, 10);
        handleShowEnderecos(clienteId);
    });
    elements.closeEnderecosModalButton.addEventListener('click', () => elements.enderecosModalOverlay.classList.remove('visible'));
    elements.enderecosModalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.enderecosModalOverlay) {
            elements.enderecosModalOverlay.classList.remove('visible');
        }
    });

    // Event Delegation para botões dentro do enderecosListContainer (Adicionar, Editar, Excluir)
    elements.enderecosListContainer.addEventListener('click', (event) => {
        let targetButton = event.target.closest('.button, #add-endereco-button'); // Find the closest button from the click target

        if (!targetButton) return; // If no button was clicked, do nothing

        const clickedClienteId = parseInt(targetButton.dataset.clienteId, 10);
        const clickedEnderecoId = parseInt(targetButton.dataset.id, 10);

        if (targetButton.id === 'add-endereco-button') {
            if (!isNaN(clickedClienteId)) {
                handleAddEndereco(clickedClienteId);
            } else {
                console.error("Erro: clienteId não encontrado para adicionar endereço.");
            }
        } else if (targetButton.classList.contains('edit-endereco-button')) {
            if (!isNaN(clickedEnderecoId) && !isNaN(clickedClienteId)) {
                handleEditEndereco(clickedEnderecoId, clickedClienteId);
            } else {
                console.error("Erro: clienteId ou enderecoId não encontrado para editar endereço.");
            }
        } else if (targetButton.classList.contains('delete-endereco-button')) {
            if (!isNaN(clickedEnderecoId) && !isNaN(clickedClienteId)) {
                handleDeleteEndereco(clickedEnderecoId, clickedClienteId);
            } else {
                console.error("Erro: clienteId ou enderecoId não encontrado para deletar endereço.");
            }
        }
    });

    // --- Lógica para o Modal de Endereços (Formulário) ---

    function showEnderecoFormModal(mode = 'add', endereco = null, clienteId) {
        elements.enderecoForm.reset();
        elements.enderecoId.value = '';
        elements.enderecoClienteId.value = clienteId;
        if (elements.enderecoFormErrorMessage) {
            elements.enderecoFormErrorMessage.textContent = '';
        }

        if (mode === 'edit' && endereco) {
            elements.enderecoFormModalTitle.textContent = 'Editar Endereço';
            elements.enderecoId.value = endereco.id;
            elements.cep.value = endereco.cep;
            elements.logradouro.value = endereco.logradouro;
            elements.numero.value = endereco.numero;
            elements.bairro.value = endereco.bairro;
            elements.cidade.value = endereco.cidade;
            elements.uf.value = endereco.uf;
            elements.complemento.value = endereco.complemento;
        } else {
            elements.enderecoFormModalTitle.textContent = 'Adicionar Novo Endereço';
        }
        elements.enderecoFormModalOverlay.classList.add('visible');
    }

    function hideEnderecoFormModal() {
        elements.enderecoFormModalOverlay.classList.remove('visible');
    }

    function handleAddEndereco(clienteId) {
        showEnderecoFormModal('add', null, clienteId);
    }

    async function handleEditEndereco(enderecoId, clienteId) {
        try {
            const endereco = await enderecoClienteService.getById(enderecoId);
            if (endereco) {
                showEnderecoFormModal('edit', endereco, clienteId);
            }
        } catch (error) {
            console.error('Erro ao buscar endereço para edição:', error);
            alert('Não foi possível carregar os dados do endereço.');
        }
    }

    async function handleDeleteEndereco(enderecoId, clienteId) {
        if (!confirm('Tem certeza que deseja excluir este endereço?')) return;
        try {
            await enderecoClienteService.remove(enderecoId);
            await handleShowEnderecos(clienteId); // Recarrega a lista
        } catch (error) {
            console.error('Erro ao excluir endereço:', error);
            alert('Não foi possível excluir o endereço.');
        }
    }

    async function handleEnderecoFormSubmit(event) {
        event.preventDefault();
        const id = parseInt(elements.enderecoId.value, 10) || null;
        const clienteId = parseInt(elements.enderecoClienteId.value, 10);
        const enderecoData = {
            clienteId: clienteId,
            cep: elements.cep.value,
            logradouro: elements.logradouro.value,
            numero: elements.numero.value,
            bairro: elements.bairro.value,
            cidade: elements.cidade.value,
            uf: elements.uf.value,
            complemento: elements.complemento.value
        };

        elements.saveEnderecoButton.disabled = true;
        if (elements.enderecoFormErrorMessage) {
            elements.enderecoFormErrorMessage.textContent = '';
        }

        try {
            if (id) {
                await enderecoClienteService.update(id, enderecoData);
            } else {
                await enderecoClienteService.create(enderecoData);
            }
            hideEnderecoFormModal();
            await handleShowEnderecos(clienteId); // Recarrega a lista
        } catch (error) {
            console.error('Erro ao salvar endereço:', error);
            if (elements.enderecoFormErrorMessage) {
                elements.enderecoFormErrorMessage.textContent = 'Erro ao salvar. Verifique os dados e a geolocalização.';
            }
        } finally {
            elements.saveEnderecoButton.disabled = false;
        }
    }


    // Event listeners para o modal de endereços (Formulário)
    elements.closeEnderecoFormModalButton.addEventListener('click', hideEnderecoFormModal);
    elements.enderecoFormModalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.enderecoFormModalOverlay) {
            hideEnderecoFormModal();
        }
    });
    elements.enderecoForm.addEventListener('submit', handleEnderecoFormSubmit);


    const destroy = () => {
        // Cleanup function for router
        console.log("Limpando listeners da página de clientes.");
    };

    return destroy;
}

window.initClientesPage = initClientesPage;
