import * as usuarioService from '../js/services/usuarioService.js';
import * as roleService from '../js/services/roleService.js';

function initUsuariosPage() {
    const elements = {
        tableBody: document.getElementById('usuarios-table-body'),
        addButton: document.getElementById('add-usuario-button'),
        modalOverlay: document.getElementById('usuario-modal-overlay'),
        modalTitle: document.getElementById('modal-title'),
        closeModalButton: document.getElementById('close-modal-button'),
        cancelButton: document.getElementById('cancel-button'),
        usuarioForm: document.getElementById('usuario-form'),
        usuarioId: document.getElementById('usuario-id'),
        nome: document.getElementById('nome'),
        email: document.getElementById('email'),
        roleId: document.getElementById('roleId'),
        password: document.getElementById('password'),
        passwordGroup: document.getElementById('password-group'),
        saveButton: document.getElementById('save-button'),
    };

    let rolesCache = [];

    async function populateRolesDropdown() {
        try {
            const roles = await roleService.getAll();
            rolesCache = roles;
            elements.roleId.innerHTML = '<option value="">Selecione um perfil</option>';
            roles.forEach(r => {
                elements.roleId.innerHTML += `<option value="${r.id}">${r.nome}</option>`;
            });
        } catch (error) {
            console.error("Erro ao carregar perfis (roles):", error);
        }
    }

    function renderTable(usuarios) {
        elements.tableBody.innerHTML = '';
        if (!usuarios || usuarios.length === 0) {
            elements.tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum usuário encontrado.</td></tr>';
            return;
        }
        usuarios.forEach(u => {
            const row = document.createElement('tr');
            row.dataset.id = u.id;
            const role = rolesCache.find(r => r.id === u.roleId);
            row.innerHTML = `
                <td>${u.id}</td>
                <td>${u.nome}</td>
                <td>${u.email}</td>
                <td>${role?.nome || 'N/A'}</td>
                <td class="action-buttons">
                    <button class="button warning edit-button" data-id="${u.id}">Editar</button>
                    <button class="button danger delete-button" data-id="${u.id}">Excluir</button>
                </td>
            `;
            elements.tableBody.appendChild(row);
        });
    }

    async function loadUsuarios() {
        elements.tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Carregando...</td></tr>';
        try {
            await populateRolesDropdown();
            const usuarios = await usuarioService.getAll();
            renderTable(usuarios);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            elements.tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Erro ao carregar os dados.</td></tr>';
        }
    }

    function showModal(mode = 'add', usuario = null) {
        elements.usuarioForm.reset();
        elements.usuarioId.value = '';
        elements.password.placeholder = "Digite a senha";
        elements.password.required = true;
        
        populateRolesDropdown().then(() => {
            if (mode === 'edit' && usuario) {
                elements.modalTitle.textContent = 'Editar Usuário';
                elements.usuarioId.value = usuario.id;
                elements.nome.value = usuario.nome;
                elements.email.value = usuario.email;
                elements.roleId.value = usuario.roleId;
                elements.password.placeholder = "Deixe em branco para não alterar";
                elements.password.required = false; // Senha não é obrigatória na edição
            } else {
                elements.modalTitle.textContent = 'Novo Usuário';
            }
        });
        elements.modalOverlay.classList.add('visible');
    }

    function hideModal() {
        elements.modalOverlay.classList.remove('visible');
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        const id = parseInt(elements.usuarioId.value, 10);
        const usuarioData = {
            nome: elements.nome.value,
            email: elements.email.value,
            roleId: parseInt(elements.roleId.value),
            SenhaHash: elements.password.value || null
        };
        
        if (!id && !usuarioData.SenhaHash) {
            alert("Senha é obrigatória para criar um novo usuário.");
            return;
        }

        elements.saveButton.disabled = true;
        try {
            if (id) {
                usuarioData.id = id; // Adiciona o ID apenas na atualização
                await usuarioService.update(id, usuarioData);
            } else {
                await usuarioService.create(usuarioData);
            }
            hideModal();
            loadUsuarios();
        } catch (error) {
            console.error(`Erro ao salvar usuário:`, error);
            alert('Não foi possível salvar o usuário.');
        } finally {
            elements.saveButton.disabled = false;
        }
    }

    async function handleDelete(id) {
        if (!confirm('Tem certeza?')) return;
        try {
            await usuarioService.remove(id);
            loadUsuarios();
        } catch (error) {
            console.error(`Erro ao excluir usuário:`, error);
            alert('Não foi possível excluir o usuário.');
        }
    }

    // --- LÓGICA PRINCIPAL ---
    loadUsuarios();
    elements.addButton.addEventListener('click', () => showModal('add'));
    elements.closeModalButton.addEventListener('click', hideModal);
    elements.cancelButton.addEventListener('click', hideModal);
    elements.modalOverlay.addEventListener('click', (e) => { if (e.target === elements.modalOverlay) hideModal(); });
    elements.usuarioForm.addEventListener('submit', handleFormSubmit);
    elements.tableBody.addEventListener('click', async (event) => {
        const target = event.target;
        const id = parseInt(target.dataset.id);
        if (target.classList.contains('edit-button')) {
            const usuario = await usuarioService.getById(id);
            showModal('edit', usuario);
        } else if (target.classList.contains('delete-button')) {
            handleDelete(id);
        }
    });

    const destroy = () => { console.log("Limpando página de usuários."); };
    return destroy;
}
window.initUsuariosPage = initUsuariosPage;