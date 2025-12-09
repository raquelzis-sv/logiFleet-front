import * as configuracaoService from '../js/services/configuracaoService.js';

function initConfiguracoesPage() {
    const elements = {
        tableBody: document.getElementById('configuracoes-table-body'),
        addButton: document.getElementById('add-configuracao-button'),
        modalOverlay: document.getElementById('configuracao-modal-overlay'),
        modalTitle: document.getElementById('modal-title'),
        closeModalButton: document.getElementById('close-modal-button'),
        cancelButton: document.getElementById('cancel-button'),
        configuracaoForm: document.getElementById('configuracao-form'),
        configuracaoId: document.getElementById('configuracao-id'),
        apiNome: document.getElementById('apiNome'),
        endpoint: document.getElementById('endpoint'),
        chave: document.getElementById('chave'),
        valor: document.getElementById('valor'),
        saveButton: document.getElementById('save-button'),
    };

    function renderTable(configuracoes) {
        elements.tableBody.innerHTML = '';
        if (!configuracoes || configuracoes.length === 0) {
            elements.tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhuma configuração encontrada.</td></tr>';
            return;
        }
        configuracoes.forEach(c => {
            const row = document.createElement('tr');
            row.dataset.id = c.id;
            row.innerHTML = `
                <td>${c.apiNome}</td>
                <td>${c.chave}</td>
                <td>${c.valor}</td>
                <td class="action-buttons">
                    <button class="button warning edit-button" data-id="${c.id}">Editar</button>
                    <button class="button danger delete-button" data-id="${c.id}">Excluir</button>
                </td>
            `;
            elements.tableBody.appendChild(row);
        });
    }

    async function loadConfiguracoes() {
        elements.tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Carregando...</td></tr>';
        try {
            const configuracoes = await configuracaoService.getAll();
            renderTable(configuracoes);
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            elements.tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Erro ao carregar os dados.</td></tr>';
        }
    }

    function showModal(mode = 'add', config = null) {
        elements.configuracaoForm.reset();
        elements.configuracaoId.value = '';
        if (mode === 'edit' && config) {
            elements.modalTitle.textContent = 'Editar Configuração';
            elements.configuracaoId.value = config.id;
            elements.apiNome.value = config.apiNome;
            elements.endpoint.value = config.endpoint;
            elements.chave.value = config.chave;
            elements.valor.value = config.valor;
        } else {
            elements.modalTitle.textContent = 'Nova Configuração';
        }
        elements.modalOverlay.classList.add('visible');
    }

    function hideModal() {
        elements.modalOverlay.classList.remove('visible');
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        const id = parseInt(elements.configuracaoId.value, 10);
        const data = {
            apiNome: elements.apiNome.value,
            endpoint: elements.endpoint.value,
            chave: elements.chave.value,
            valor: elements.valor.value,
        };

        elements.saveButton.disabled = true;
        try {
            if (id) {
                data.id = id; // Adiciona o ID apenas na atualização
                await configuracaoService.update(id, data);
            } else {
                await configuracaoService.create(data);
            }
            hideModal();
            loadConfiguracoes();
        } catch (error) {
            console.error(`Erro ao salvar configuração:`, error);
            alert('Não foi possível salvar a configuração.');
        } finally {
            elements.saveButton.disabled = false;
        }
    }

    async function handleDelete(id) {
        if (!confirm('Tem certeza?')) return;
        try {
            await configuracaoService.remove(id);
            loadConfiguracoes();
        } catch (error) {
            console.error(`Erro ao excluir configuração:`, error);
            alert('Não foi possível excluir a configuração.');
        }
    }

    loadConfiguracoes();
    elements.addButton.addEventListener('click', () => showModal('add'));
    elements.closeModalButton.addEventListener('click', hideModal);
    elements.cancelButton.addEventListener('click', hideModal);
    elements.modalOverlay.addEventListener('click', (e) => { if (e.target === elements.modalOverlay) hideModal(); });
    elements.configuracaoForm.addEventListener('submit', handleFormSubmit);
    elements.tableBody.addEventListener('click', async (event) => {
        const target = event.target;
        const id = parseInt(target.dataset.id);
        if (target.classList.contains('edit-button')) {
            const config = await configuracaoService.getById(id);
            showModal('edit', config);
        } else if (target.classList.contains('delete-button')) {
            handleDelete(id);
        }
    });

    const destroy = () => { console.log("Limpando página de configurações."); };
    return destroy;
}
window.initConfiguracoesPage = initConfiguracoesPage;
