// Importa o serviço de motoristas
import * as motoristaService from '../js/services/motoristaService.js';

function initMotoristasPage() {
    const elements = {
        tableBody: document.getElementById('motoristas-table-body'),
        addButton: document.getElementById('add-motorista-button'),
        modalOverlay: document.getElementById('motorista-modal-overlay'),
        modalTitle: document.getElementById('modal-title'),
        closeModalButton: document.getElementById('close-modal-button'),
        cancelButton: document.getElementById('cancel-button'),
        motoristaForm: document.getElementById('motorista-form'),
        motoristaId: document.getElementById('motorista-id'),
        nome: document.getElementById('nome'),
        cpf: document.getElementById('cpf'),
        cnh: document.getElementById('cnh'),
        telefone: document.getElementById('telefone'),
        email: document.getElementById('email'),
        saveButton: document.getElementById('save-button'),
    };

    /** Renderiza os motoristas na tabela */
    function renderTable(motoristas) {
        elements.tableBody.innerHTML = '';
        if (!motoristas || motoristas.length === 0) {
            elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum motorista encontrado.</td></tr>';
            return;
        }
        motoristas.forEach(motorista => {
            const row = document.createElement('tr');
            row.dataset.id = motorista.id;
            row.innerHTML = `
                <td>${motorista.nome || ''}</td>
                <td>${motorista.cpf || ''}</td>
                <td>${motorista.cnh || ''}</td>
                <td>${motorista.telefone || ''}</td>
                <td>${motorista.email || ''}</td>
                <td class="action-buttons">
                    <button class="button warning edit-button" data-id="${motorista.id}">Editar</button>
                    <button class="button danger delete-button" data-id="${motorista.id}">Excluir</button>
                </td>
            `;
            elements.tableBody.appendChild(row);
        });
    }

    async function loadMotoristas() {
        elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Carregando...</td></tr>';
        try {
            const motoristas = await motoristaService.getAll();
            renderTable(motoristas);
        } catch (error) {
            console.error('Erro ao carregar motoristas:', error);
            elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Erro ao carregar os dados. Verifique o console (F12).</td></tr>';
        }
    }

    function showModal(mode = 'add', motorista = null) {
        elements.motoristaForm.reset();
        elements.motoristaId.value = '';

        if (mode === 'edit' && motorista) {
            elements.modalTitle.textContent = 'Editar Motorista';
            elements.motoristaId.value = motorista.id;
            elements.nome.value = motorista.nome;
            elements.cpf.value = motorista.cpf;
            elements.cnh.value = motorista.cnh;
            elements.telefone.value = motorista.telefone;
            elements.email.value = motorista.email;
        } else {
            elements.modalTitle.textContent = 'Adicionar Motorista';
        }
        elements.modalOverlay.classList.add('visible');
    }

    function hideModal() {
        elements.modalOverlay.classList.remove('visible');
        elements.motoristaForm.reset();
        elements.motoristaId.value = '';
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        const id = parseInt(elements.motoristaId.value, 10);
        const motoristaData = {
            nome: elements.nome.value,
            cpf: elements.cpf.value,
            cnh: elements.cnh.value,
            telefone: elements.telefone.value,
            email: elements.email.value,
        };

        elements.saveButton.textContent = 'Salvando...';
        elements.saveButton.disabled = true;

        try {
            if (id) {
                await motoristaService.update(id, motoristaData);
            } else {
                await motoristaService.create(motoristaData);
            }
            hideModal();
            loadMotoristas();
        } catch (error) {
            console.error(`Erro ao salvar motorista:`, error);
            alert('Não foi possível salvar o motorista. Verifique os dados e tente novamente.');
        } finally {
            elements.saveButton.textContent = 'Salvar';
            elements.saveButton.disabled = false;
        }
    }

    async function handleDelete(id) {
        if (!confirm('Tem certeza de que deseja excluir este motorista?')) return;
        
        try {
            await motoristaService.remove(id);
            loadMotoristas();
        } catch (error) {
            console.error(`Erro ao excluir motorista:`, error);
            alert('Não foi possível excluir o motorista.');
        }
    }

    async function handleTableClick(event) {
        const target = event.target;
        const id = parseInt(target.dataset.id, 10);

        if (target.classList.contains('edit-button')) {
            try {
                const motoristas = await motoristaService.getAll();
                const motorista = motoristas.find(m => m.id === id);
                if (motorista) {
                    showModal('edit', motorista);
                }
            } catch (error) {
                console.error(`Erro ao buscar dados do motorista para edição:`, error);
                alert("Não foi possível carregar os dados para edição.");
            }
        } else if (target.classList.contains('delete-button')) {
            handleDelete(id);
        }
    }

    // --- LÓGICA PRINCIPAL E EVENT LISTENERS ---

    loadMotoristas();
    elements.addButton.addEventListener('click', () => showModal('add'));
    elements.closeModalButton.addEventListener('click', hideModal);
    elements.cancelButton.addEventListener('click', hideModal);
    elements.modalOverlay.addEventListener('click', (e) => { if (e.target === elements.modalOverlay) hideModal(); });
    elements.motoristaForm.addEventListener('submit', handleFormSubmit);
    elements.tableBody.addEventListener('click', handleTableClick);

    const destroy = () => {
        console.log("Limpando listeners da página de motoristas.");
    };

    return destroy;
}

window.initMotoristasPage = initMotoristasPage;
