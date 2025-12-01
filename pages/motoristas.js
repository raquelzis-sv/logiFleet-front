function initMotoristasPage() {
    console.log('[Motoristas] initMotoristasPage started.');

    const tableBody = document.querySelector('#motoristas-table tbody');
    const modal = document.getElementById('motorista-modal');
    const addBtn = document.getElementById('add-motorista-btn');

    if (!tableBody || !modal || !addBtn) {
        console.error('[Motoristas] Elementos essenciais não encontrados.');
        return;
    }

    const closeButton = modal.querySelector('.close-button');
    const cancelBtn = modal.querySelector('#cancel-btn');
    const motoristaForm = document.getElementById('motorista-form');
    const formError = modal.querySelector('#form-error');
    const modalTitle = modal.querySelector('#modal-title');
    
    // Inputs
    const motoristaIdInput = document.getElementById('motorista-id');
    const nomeInput = document.getElementById('motorista-nome');
    const cpfInput = document.getElementById('motorista-cpf');
    const cnhInput = document.getElementById('motorista-cnh');
    const telefoneInput = document.getElementById('motorista-telefone');
    const nascimentoInput = document.getElementById('motorista-nascimento');
    const emailInput = document.getElementById('usuario-email');
    const senhaInput = document.getElementById('usuario-senha');

    const openModal = (motorista = null) => {
        formError.style.display = 'none';
        motoristaForm.reset();
        if (motorista) {
            modalTitle.textContent = 'Editar Motorista';
            senhaInput.placeholder = "Deixe em branco para não alterar";
            motoristaIdInput.value = motorista.id;
            nomeInput.value = motorista.nome;
            cpfInput.value = motorista.cpf;
            cnhInput.value = motorista.cnh;
            telefoneInput.value = motorista.telefone;
            nascimentoInput.value = motorista.dataNascimento?.split('T')[0]; // Formato YYYY-MM-DD
            if(motorista.usuario) {
                emailInput.value = motorista.usuario.email;
            }
        } else {
            modalTitle.textContent = 'Adicionar Motorista';
            senhaInput.placeholder = "Senha de acesso";
            motoristaIdInput.value = '';
        }
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    const loadMotoristas = async () => {
        try {
            const motoristas = await motoristaService.getMotoristas();
            tableBody.innerHTML = '';
            motoristas.forEach(m => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${m.id}</td>
                    <td>${m.nome}</td>
                    <td>${m.cpf}</td>
                    <td>${m.cnh}</td>
                    <td>${m.telefone || 'N/A'}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" data-id="${m.id}">Editar</button>
                        <button class="btn-delete" data-id="${m.id}">Excluir</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('[Motoristas] Erro ao carregar motoristas:', error);
            tableBody.innerHTML = `<tr><td colspan="6">Erro ao carregar motoristas.</td></tr>`;
        }
    };

    addBtn.addEventListener('click', () => openModal());
    closeButton.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    const windowClickListener = (event) => {
        if (event.target == modal) closeModal();
    };
    window.addEventListener('click', windowClickListener);

    motoristaForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        formError.style.display = 'none';

        const motoristaData = {
            id: motoristaIdInput.value ? parseInt(motoristaIdInput.value) : 0,
            nome: nomeInput.value,
            cpf: cpfInput.value,
            cnh: cnhInput.value,
            telefone: telefoneInput.value,
            dataNascimento: nascimentoInput.value,
            usuario: {
                nome: nomeInput.value, // Backend usa o nome do motorista para o usuário
                email: emailInput.value,
                senhaHash: senhaInput.value, // Senha em texto plano, backend faz o hash
            }
        };

        // Se a senha estiver vazia na edição, não a envie
        if (motoristaData.id && !motoristaData.usuario.senhaHash) {
            delete motoristaData.usuario.senhaHash;
        }

        try {
            if (motoristaData.id) {
                await motoristaService.updateMotorista(motoristaData.id, motoristaData);
            } else {
                const { id, ...createData } = motoristaData;
                await motoristaService.createMotorista(createData);
            }
            closeModal();
            loadMotoristas();
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
                const motorista = await motoristaService.getMotoristaById(id);
                openModal(motorista);
            } catch (error) {
                alert('Não foi possível carregar os dados do motorista.');
            }
        }

        if (event.target.classList.contains('btn-delete')) {
            if (confirm('Tem certeza que deseja excluir este motorista? A exclusão também removerá o usuário de acesso associado.')) {
                try {
                    await motoristaService.deleteMotorista(id);
                    loadMotoristas();
                } catch (error) {
                    alert('Não foi possível excluir o motorista.');
                }
            }
        }
    });

    loadMotoristas();

    return () => {
        console.log('[Motoristas] Destroying page...');
        window.removeEventListener('click', windowClickListener);
    };
}
