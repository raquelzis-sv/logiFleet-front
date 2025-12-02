import * as clienteService from '../js/services/clienteService.js';

// Função para carregar e exibir os clientes
async function loadClientes() {
    const tbody = document.querySelector('#clientes-table tbody');
    tbody.innerHTML = ''; // Limpa a tabela

    try {
        const clientes = await clienteService.getAllClientes();
        clientes.forEach(cliente => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cliente.id}</td>
                <td>${cliente.nomeEmpresa}</td>
                <td>${cliente.cnpj}</td>
                <td>${cliente.inscricaoEstadual || ''}</td>
                <td>
                    <button class="btn-edit" data-id="${cliente.id}">Editar</button>
                    <button class="btn-delete" data-id="${cliente.id}">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        addEventListeners(); // Adiciona event listeners após carregar os clientes
    } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        // Exibir mensagem de erro na UI, se houver
    }
}

// Função para abrir o modal de adicionar/editar
function openClienteModal(cliente = null) {
    const modal = document.getElementById('cliente-modal');
    const form = document.getElementById('cliente-form');
    const title = document.getElementById('modal-title');
    const clienteId = document.getElementById('cliente-id');
    const nomeEmpresa = document.getElementById('nome-empresa');
    const cnpj = document.getElementById('cnpj');
    const inscricaoEstadual = document.getElementById('inscricao-estadual');
    const responsavel = document.getElementById('responsavel');
    const emailContato = document.getElementById('email-contato');
    const telefoneContato = document.getElementById('telefone-contato');
    const formError = document.getElementById('form-error');

    form.reset();
    formError.textContent = ''; // Limpa mensagens de erro

    if (cliente) {
        title.textContent = 'Editar Cliente';
        clienteId.value = cliente.id;
        nomeEmpresa.value = cliente.nomeEmpresa;
        cnpj.value = cliente.cnpj;
        inscricaoEstadual.value = cliente.inscricaoEstadual || '';
        responsavel.value = cliente.responsavel;
        emailContato.value = cliente.emailContato;
        telefoneContato.value = cliente.telefoneContato;
    } else {
        title.textContent = 'Adicionar Cliente';
        clienteId.value = '';
    }
    modal.style.display = 'block';
}

// Função para fechar o modal
function closeClienteModal() {
    document.getElementById('cliente-modal').style.display = 'none';
}

// Função para lidar com o envio do formulário (Adicionar/Editar)
async function handleClienteFormSubmit(event) {
    event.preventDefault();

    const clienteId = document.getElementById('cliente-id').value;
    const nomeEmpresa = document.getElementById('nome-empresa').value;
    const cnpj = document.getElementById('cnpj').value;
    const inscricaoEstadual = document.getElementById('inscricao-estadual').value;
    const responsavel = document.getElementById('responsavel').value;
    const emailContato = document.getElementById('email-contato').value;
    const telefoneContato = document.getElementById('telefone-contato').value;
    const formError = document.getElementById('form-error');

    const clienteData = {
        nomeEmpresa,
        cnpj,
        inscricaoEstadual: inscricaoEstadual || null,
        responsavel,
        emailContato,
        telefoneContato
    };

    try {
        if (clienteId) {
            // Editar cliente existente
            await clienteService.updateCliente(parseInt(clienteId), clienteData);
        } else {
            // Adicionar novo cliente
            await clienteService.createCliente(clienteData);
        }
        closeClienteModal();
        loadClientes(); // Recarrega a lista de clientes
    } catch (error) {
        console.error("Erro ao salvar cliente:", error);
        formError.textContent = error.data?.message || 'Erro ao salvar o cliente.';
    }
}

// Função para lidar com a exclusão de um cliente
async function handleDeleteCliente(event) {
    const id = parseInt(event.target.dataset.id);
    if (confirm(`Tem certeza que deseja excluir o cliente ID: ${id}?`)) {
        try {
            await clienteService.deleteCliente(id);
            loadClientes(); // Recarrega a lista
        } catch (error) {
            console.error("Erro ao excluir cliente:", error);
            alert(error.data?.message || 'Erro ao excluir o cliente.');
        }
    }
}

// Adiciona os event listeners para os botões da tabela e o modal
function addEventListeners() {
    // Botões de edição
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.onclick = async (event) => {
            const id = parseInt(event.target.dataset.id);
            try {
                const cliente = await clienteService.getClienteById(id);
                openClienteModal(cliente);
            } catch (error) {
                console.error("Erro ao carregar cliente para edição:", error);
                alert(error.data?.message || 'Erro ao carregar cliente para edição.');
            }
        };
    });

    // Botões de exclusão
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.onclick = handleDeleteCliente;
    });
}

// Função de inicialização da página de clientes, chamada pelo roteador
export function initClientesPage() {
    console.log('Inicializando página de clientes...');
    loadClientes();

    // Event Listeners para o botão "Adicionar Cliente" e o modal
    document.getElementById('add-cliente-btn').onclick = () => openClienteModal();
    document.querySelector('#cliente-modal .close-button').onclick = closeClienteModal;
    document.getElementById('cancel-btn').onclick = closeClienteModal;
    document.getElementById('cliente-form').onsubmit = handleClienteFormSubmit;

    // Retorna uma função de limpeza (opcional, mas boa prática para single-page apps)
    return () => {
        console.log('Limpando página de clientes...');
        // Remove os event listeners para evitar duplicação em navegações futuras
        document.getElementById('add-cliente-btn').onclick = null;
        document.querySelector('#cliente-modal .close-button').onclick = null;
        document.getElementById('cancel-btn').onclick = null;
        document.getElementById('cliente-form').onsubmit = null;
        // Os event listeners dos botões de editar/excluir são re-adicionados a cada loadClientes,
        // então não precisam ser removidos explicitamente aqui se a tabela for limpa.
    };
}

// Adiciona a função ao objeto window para que o roteador possa encontrá-la
// (Considerar usar um sistema de módulos mais robusto se o projeto crescer)
window.initClientesPage = initClientesPage;