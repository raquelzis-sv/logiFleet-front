function initConfiguracoesPage() {
    console.log('[Configuracoes] initConfiguracoesPage started.');

    const tableBody = document.querySelector('#configuracoes-table tbody');
    const modal = document.getElementById('config-modal');
    const addBtn = document.getElementById('add-config-btn');

    if (!tableBody || !modal || !addBtn) {
        console.error('[Configuracoes] Elementos essenciais não encontrados.');
        return;
    }

    const closeButton = modal.querySelector('.close-button');
    const cancelBtn = modal.querySelector('#cancel-btn');
    const configForm = document.getElementById('config-form');
    const formError = modal.querySelector('#form-error');
    const modalTitle = modal.querySelector('#modal-title');
    
    // Inputs
    const configIdInput = document.getElementById('config-id');
    const apiNomeInput = document.getElementById('config-api-nome');
    const endpointInput = document.getElementById('config-endpoint');
    const chaveInput = document.getElementById('config-chave');
    const valorInput = document.getElementById('config-valor');

    const openModal = async (config = null) => {
        formError.style.display = 'none';
        configForm.reset();
        
        if (config) {
            modalTitle.textContent = 'Editar Configuração';
            configIdInput.value = config.id;
            apiNomeInput.value = config.apiNome;
            endpointInput.value = config.endpoint;
            chaveInput.value = config.chave;
            valorInput.value = config.valor;
        } else {
            modalTitle.textContent = 'Adicionar Configuração';
            configIdInput.value = '';
        }
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    const loadConfiguracoes = async () => {
        try {
            const configuracoes = await configuracaoService.getConfiguracoes();
            tableBody.innerHTML = '';
            configuracoes.forEach(c => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${c.id}</td>
                    <td>${c.apiNome}</td>
                    <td>${c.chave}</td>
                    <td>${c.valor}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" data-id="${c.id}">Editar</button>
                        <button class="btn-delete" data-id="${c.id}">Excluir</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('[Configuracoes] Erro ao carregar configurações:', error);
            tableBody.innerHTML = `<tr><td colspan="5">Erro ao carregar configurações.</td></tr>`;
        }
    };

    // --- Event Listeners ---
    addBtn.addEventListener('click', () => openModal());
    closeButton.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    const windowClickListener = (event) => {
        if (event.target == modal) closeModal();
    };
    window.addEventListener('click', windowClickListener);

    configForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        formError.style.display = 'none';

        const configData = {
            id: configIdInput.value ? parseInt(configIdInput.value) : 0,
            apiNome: apiNomeInput.value,
            endpoint: endpointInput.value,
            chave: chaveInput.value,
            valor: valorInput.value
        };

        try {
            if (configData.id) {
                await configuracaoService.updateConfiguracao(configData.id, configData);
            } else {
                const { id, ...createData } = configData;
                await configuracaoService.createConfiguracao(createData);
            }
            closeModal();
            loadConfiguracoes();
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
                const config = await configuracaoService.getConfiguracaoById(id);
                openModal(config);
            } catch (error) {
                alert('Não foi possível carregar os dados da configuração.');
            }
        }

        if (event.target.classList.contains('btn-delete')) {
            if (confirm('Tem certeza que deseja excluir esta configuração?')) {
                try {
                    await configuracaoService.deleteConfiguracao(id);
                    loadConfiguracoes();
                } catch (error) {
                    alert('Não foi possível excluir a configuração.');
                }
            }
        }
    });

    loadConfiguracoes();

    return () => {
        console.log('[Configuracoes] Destroying page...');
        window.removeEventListener('click', windowClickListener);
    };
}
