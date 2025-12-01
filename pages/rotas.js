function initRotasPage() {
    console.log('[Rotas] initRotasPage started.');

    // Views
    const listView = document.getElementById('view-list-rotas');
    const createView = document.getElementById('view-create-rota');
    const detailsView = document.getElementById('view-details-rota');

    if (!listView || !createView || !detailsView) {
        console.error('[Rotas] Uma ou mais views não foram encontradas.');
        return;
    }

    // --- Elementos da Lista ---
    const rotasTableBody = listView.querySelector('#rotas-table tbody');
    const addRotaBtn = listView.querySelector('#add-rota-btn');

    // --- Elementos da Criação ---
    const cancelCreationBtn = createView.querySelector('#cancel-creation-btn');
    const createRotaForm = createView.querySelector('#create-rota-form');
    const veiculoSelect = createView.querySelector('#select-veiculo');
    const motoristaSelect = createView.querySelector('#select-motorista');
    const pedidosTableBody = createView.querySelector('#pedidos-pendentes-table tbody');
    const formError = createView.querySelector('#form-error');

    const statusMap = ['Planejada', 'Em Andamento', 'Concluída', 'Cancelada'];

    // --- Funções de Troca de View ---
    const showListView = () => {
        listView.style.display = 'block';
        createView.style.display = 'none';
        detailsView.style.display = 'none';
        loadRotas();
    };

    const showCreateView = async () => {
        listView.style.display = 'none';
        detailsView.style.display = 'none';
        createView.style.display = 'block';
        await populateCreateForm();
    };

    const showDetailsView = (rota) => {
        // Lógica para mostrar detalhes (a ser implementada)
    };
    
    // --- Lógica Principal ---
    const loadRotas = async () => {
        try {
            const rotas = await rotaService.getRotas();
            rotasTableBody.innerHTML = '';
            rotas.forEach(r => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${r.id}</td>
                    <td>${new Date(r.dataRota).toLocaleDateString()}</td>
                    <td>${r.veiculo?.placa || 'N/A'}</td>
                    <td>${r.motorista?.nome || 'N/A'}</td>
                    <td>${statusMap[r.status] || 'Desconhecido'}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" data-id="${r.id}">Ver Detalhes</button>
                        <button class="btn-delete" data-id="${r.id}">Excluir</button>
                    </td>
                `;
                rotasTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('[Rotas] Erro ao carregar rotas:', error);
            rotasTableBody.innerHTML = `<tr><td colspan="6">Erro ao carregar rotas.</td></tr>`;
        }
    };

    const populateCreateForm = async () => {
        try {
            // Limpa seletores e tabela
            veiculoSelect.innerHTML = '<option value="">Carregando...</option>';
            motoristaSelect.innerHTML = '<option value="">Carregando...</option>';
            pedidosTableBody.innerHTML = '<tr><td colspan="6">Carregando...</td></tr>';

            // Busca dados em paralelo
            const [veiculos, motoristas, pedidos] = await Promise.all([
                veiculoService.getVeiculosDisponiveis(),
                motoristaService.getMotoristas(),
                pedidoService.getPedidosPendentes()
            ]);

            // Popula veículos
            veiculoSelect.innerHTML = '<option value="">Selecione um veículo</option>';
            veiculos.forEach(v => {
                veiculoSelect.innerHTML += `<option value="${v.id}">${v.placa} - ${v.marca} ${v.modelo}</option>`;
            });

            // Popula motoristas
            motoristaSelect.innerHTML = '<option value="">Selecione um motorista</option>';
            motoristas.forEach(m => {
                motoristaSelect.innerHTML += `<option value="${m.id}">${m.nome}</option>`;
            });

            // Popula pedidos pendentes
            pedidosTableBody.innerHTML = '';
            if (pedidos.length === 0) {
                 pedidosTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum pedido pendente encontrado.</td></tr>';
                 return;
            }
            pedidos.forEach(p => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" class="select-pedido" value="${p.id}"></td>
                    <td>${p.id}</td>
                    <td>${p.cliente?.nomeEmpresa || 'N/A'}</td>
                    <td>${p.enderecoEntrega?.logradouro || 'N/A'}, ${p.enderecoEntrega?.numero}</td>
                    <td>${p.pesoTotalKg}</td>
                    <td>${p.volumeTotalM3}</td>
                `;
                pedidosTableBody.appendChild(row);
            });

        } catch (error) {
            console.error('[Rotas] Erro ao popular formulário de criação:', error);
            formError.textContent = 'Erro ao carregar dados para o formulário. Tente novamente.';
            formError.style.display = 'block';
        }
    };


    // --- Event Listeners ---
    addRotaBtn.addEventListener('click', showCreateView);
    cancelCreationBtn.addEventListener('click', showListView);

    createRotaForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        formError.style.display = 'none';

        const selectedPedidos = Array.from(pedidosTableBody.querySelectorAll('.select-pedido:checked')).map(cb => parseInt(cb.value));

        if (selectedPedidos.length === 0) {
            formError.textContent = 'Selecione ao menos um pedido para a rota.';
            formError.style.display = 'block';
            return;
        }

        const rotaRequest = {
            veiculoId: parseInt(veiculoSelect.value),
            motoristaId: parseInt(motoristaSelect.value),
            pedidosIds: selectedPedidos
        };

        try {
            await rotaService.createRota(rotaRequest);
            alert('Rota criada com sucesso!');
            showListView();
        } catch (error) {
            const errorMessage = error.data?.message || (typeof error.data === 'string' ? error.data : 'Ocorreu um erro ao salvar a rota.');
            formError.textContent = errorMessage;
            formError.style.display = 'block';
        }
    });
    
    rotasTableBody.addEventListener('click', async (event) => {
        const id = event.target.getAttribute('data-id');
        if (!id) return;
        
        if (event.target.classList.contains('btn-delete')) {
            if (confirm('Tem certeza que deseja excluir esta rota? Esta ação não pode ser desfeita.')) {
                try {
                    await rotaService.deleteRota(id);
                    loadRotas();
                } catch (error) {
                    alert('Não foi possível excluir a rota. Verifique se ela não está em andamento.');
                }
            }
        }
        // Adicionar lógica para 'Ver Detalhes' aqui
    });


    // --- Inicialização ---
    showListView(); // Mostra a lista por padrão

    return () => {
        console.log('[Rotas] Destroying page...');
        // Limpar listeners se necessário (nenhum global adicionado aqui)
    };
}
