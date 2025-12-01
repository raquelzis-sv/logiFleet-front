function initUsuariosPage() {
    console.log('[Usuarios] initUsuariosPage started.');

    const tableBody = document.querySelector('#usuarios-table tbody');
    const modal = document.getElementById('usuario-modal');
    const addBtn = document.getElementById('add-usuario-btn');

    if (!tableBody || !modal || !addBtn) {
        console.error('[Usuarios] Elementos essenciais não encontrados.');
        return;
    }

    const closeButton = modal.querySelector('.close-button');
    const cancelBtn = modal.querySelector('#cancel-btn');
    const usuarioForm = document.getElementById('usuario-form');
    const formError = modal.querySelector('#form-error');
    const modalTitle = modal.querySelector('#modal-title');
    
    // Inputs
    const usuarioIdInput = document.getElementById('usuario-id');
    const nomeInput = document.getElementById('usuario-nome');
    const emailInput = document.getElementById('usuario-email');
    const senhaInput = document.getElementById('usuario-senha');
    const roleSelect = document.getElementById('usuario-role');
    
    let roles = []; // Cache para as roles

    const openModal = async (usuario = null) => {
        formError.style.display = 'none';
        usuarioForm.reset();

        // Popula roles se ainda não foram carregadas
        if (roles.length === 0) {
            roleSelect.innerHTML = '<option value="">Carregando...</option>';
            try {
                roles = await roleService.getRoles();
            } catch (error) {
                console.error('Falha ao carregar perfis (roles).');
                roleSelect.innerHTML = '<option value="">Erro ao carregar</option>';
            }
        }
        
        roleSelect.innerHTML = '<option value="">Selecione um perfil</option>';
        roles.forEach(r => {
            roleSelect.innerHTML += `<option value="${r.id}">${r.nome}</option>`;
        });

        if (usuario) {
            modalTitle.textContent = 'Editar Usuário';
            senhaInput.placeholder = "Deixe em branco para não alterar";
            usuarioIdInput.value = usuario.id;
            nomeInput.value = usuario.nome;
            emailInput.value = usuario.email;
            roleSelect.value = usuario.roleId;
        } else {
            modalTitle.textContent = 'Adicionar Usuário';
            senhaInput.placeholder = "Senha de acesso";
            usuarioIdInput.value = '';
        }
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    const loadUsuarios = async () => {
        try {
            const usuarios = await usuarioService.getUsuarios();
            tableBody.innerHTML = '';
            usuarios.forEach(u => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${u.id}</td>
                    <td>${u.nome}</td>
                    <td>${u.email}</td>
                    <td>${u.role?.nome || 'N/A'}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" data-id="${u.id}">Editar</button>
                        <button class="btn-delete" data-id="${u.id}">Excluir</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('[Usuarios] Erro ao carregar usuários:', error);
            tableBody.innerHTML = `<tr><td colspan="5">Erro ao carregar usuários.</td></tr>`;
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

    usuarioForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        formError.style.display = 'none';

        const usuarioData = {
            id: usuarioIdInput.value ? parseInt(usuarioIdInput.value) : 0,
            nome: nomeInput.value,
            email: emailInput.value,
            senhaHash: senhaInput.value,
            roleId: parseInt(roleSelect.value)
        };

        if (usuarioData.id && !usuarioData.senhaHash) {
            delete usuarioData.senhaHash;
        }

        try {
            if (usuarioData.id) {
                await usuarioService.updateUsuario(usuarioData.id, usuarioData);
            } else {
                const { id, ...createData } = usuarioData;
                await usuarioService.createUsuario(createData);
            }
            closeModal();
            loadUsuarios();
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
                const usuario = await usuarioService.getUsuarioById(id);
                openModal(usuario);
            } catch (error) {
                alert('Não foi possível carregar os dados do usuário.');
            }
        }

        if (event.target.classList.contains('btn-delete')) {
            if (confirm('Tem certeza que deseja excluir este usuário?')) {
                try {
                    await usuarioService.deleteUsuario(id);
                    loadUsuarios();
                } catch (error) {
                    alert('Não foi possível excluir o usuário.');
                }
            }
        }
    });

    loadUsuarios();

    return () => {
        console.log('[Usuarios] Destroying page...');
        window.removeEventListener('click', windowClickListener);
    };
}
