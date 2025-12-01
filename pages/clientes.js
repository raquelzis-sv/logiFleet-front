function initClientesPage() {
    console.log('[Clientes] initClientesPage started.');

    const tableBody = document.querySelector('#clientes-table tbody');
    const modal = document.getElementById('cliente-modal');
    const addClienteBtn = document.getElementById('add-cliente-btn');
    
    // Verificação de elementos essenciais
    if (!tableBody || !modal || !addClienteBtn) {
        console.error('[Clientes] Elementos essenciais da página não foram encontrados. Verifique se o HTML em "pages/clientes.html" está correto e se foi carregado.');
        return;
    }
    console.log('[Clientes] Elementos essenciais do DOM foram encontrados.');

    const modalTitle = document.getElementById('modal-title');
    const closeButton = document.querySelector('.close-button');
    const cancelBtn = document.getElementById('cancel-btn');
    const clienteForm = document.getElementById('cliente-form');
    const formError = document.getElementById('form-error');
    const clienteIdInput = document.getElementById('cliente-id');
    const nomeEmpresaInput = document.getElementById('nome-empresa');
    const cnpjInput = document.getElementById('cnpj');
    const inscricaoEstadualInput = document.getElementById('inscricao-estadual');
    const responsavelInput = document.getElementById('responsavel');
    const emailContatoInput = document.getElementById('email-contato');
    const telefoneContatoInput = document.getElementById('telefone-contato');

    const openModal = (cliente = null) => {
        console.log('[Clientes] Abrindo modal.', cliente ? 'Modo de edição.' : 'Modo de adição.');
        formError.style.display = 'none';
        clienteForm.reset();
        if (cliente) {
            modalTitle.textContent = 'Editar Cliente';
            clienteIdInput.value = cliente.id;
            nomeEmpresaInput.value = cliente.nomeEmpresa;
            cnpjInput.value = cliente.cnpj;
            inscricaoEstadualInput.value = cliente.inscricaoEstadual || '';
            responsavelInput.value = cliente.responsavel || '';
            emailContatoInput.value = cliente.emailContato || '';
            telefoneContatoInput.value = cliente.telefoneContato || '';
        } else {
            modalTitle.textContent = 'Adicionar Cliente';
            clienteIdInput.value = '';
        }
        modal.style.display = 'block';
    };

    const closeModal = () => {
        console.log('[Clientes] Fechando modal.');
        modal.style.display = 'none';
    };

    const loadClientes = async () => {
        console.log('[Clientes] loadClientes: Buscando lista de clientes...');
        try {
            const clientes = await clienteService.getClientes();
            console.log('[Clientes] loadClientes: Clientes recebidos:', clientes);
            tableBody.innerHTML = ''; // Limpa a tabela
            if (clientes.length === 0) {
                console.log('[Clientes] loadClientes: Nenhum cliente encontrado.');
                tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Nenhum cliente encontrado.</td></tr>`;
                return;
            }
            clientes.forEach(cliente => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${cliente.id}</td>
                    <td>${cliente.nomeEmpresa}</td>
                    <td>${cliente.cnpj}</td>
                    <td>${cliente.inscricaoEstadual || 'N/A'}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" data-id="${cliente.id}">Editar</button>
                        <button class="btn-delete" data-id="${cliente.id}">Excluir</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            console.log('[Clientes] loadClientes: Tabela de clientes renderizada.');
        } catch (error) {
            console.error('[Clientes] loadClientes: Erro ao carregar clientes:', error);
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Erro ao carregar clientes. Verifique o console.</td></tr>`;
        }
    };

    console.log('[Clientes] Adicionando event listeners...');
    addClienteBtn.addEventListener('click', () => openModal());
    closeButton.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    const windowClickListener = (event) => {
        if (event.target == modal) {
            closeModal();
        }
    };
    window.addEventListener('click', windowClickListener);

    clienteForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('[Clientes] Formulário salvo.');
        formError.style.display = 'none';

        const clienteData = {
            id: clienteIdInput.value ? parseInt(clienteIdInput.value) : 0,
            nomeEmpresa: nomeEmpresaInput.value,
            cnpj: cnpjInput.value,
            inscricaoEstadual: inscricaoEstadualInput.value,
            responsavel: responsavelInput.value,
            emailContato: emailContatoInput.value,
            telefoneContato: telefoneContatoInput.value,
        };

        try {
            if (clienteData.id) {
                await clienteService.updateCliente(clienteData.id, clienteData);
            } else {
                const { id, ...createData } = clienteData;
                await clienteService.createCliente(createData);
            }
            closeModal();
            loadClientes();
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            const errorMessage = error.data?.message || (typeof error.data === 'string' ? error.data : 'Ocorreu um erro ao salvar.');
            formError.textContent = errorMessage;
            formError.style.display = 'block';
        }
    });

    tableBody.addEventListener('click', async (event) => {
        console.log('[Clientes] Clique na tabela detectado.');
        const target = event.target;
        const id = target.getAttribute('data-id');

        if (!id) return;

        if (target.classList.contains('btn-edit')) {
            try {
                const cliente = await clienteService.getClienteById(id);
                openModal(cliente);
            } catch (error) {
                console.error('Erro ao buscar cliente:', error);
                alert('Não foi possível carregar os dados do cliente para edição.');
            }
        }

        if (target.classList.contains('btn-delete')) {
            if (confirm('Tem certeza que deseja excluir este cliente?')) {
                try {
                    await clienteService.deleteCliente(id);
                    loadClientes();
                } catch (error) {
                    console.error('Erro ao excluir cliente:', error);
                    alert('Não foi possível excluir o cliente.');
                }
            }
        }
    });

    // Carrega os clientes ao inicializar
    loadClientes();

    // Retorna uma função de limpeza que o roteador pode chamar
    return () => {
        console.log('[Clientes] Destroying page listeners...');
        window.removeEventListener('click', windowClickListener);
    };
}