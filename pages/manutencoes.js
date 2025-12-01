function initManutencoesPage() {
    console.log('[Manutencoes] initManutencoesPage started.');

    const tableBody = document.querySelector('#manutencoes-table tbody');
    const addModal = document.getElementById('add-manutencao-modal');
    const finalizeModal = document.getElementById('finalize-manutencao-modal');
    const addBtn = document.getElementById('add-manutencao-btn');

    if (!tableBody || !addModal || !finalizeModal || !addBtn) {
        console.error('[Manutencoes] Elementos essenciais não encontrados.');
        return;
    }

    // --- Elementos do Modal de Adição ---
    const addForm = document.getElementById('add-manutencao-form');
    const addVeiculoSelect = document.getElementById('manutencao-veiculo');
    const addDataInicioInput = document.getElementById('manutencao-data-inicio');
    const addTipoSelect = document.getElementById('manutencao-tipo');
    const addDescricaoInput = document.getElementById('manutencao-descricao');
    const addFormError = document.getElementById('add-form-error');

    // --- Elementos do Modal de Finalização ---
    const finalizeForm = document.getElementById('finalize-manutencao-form');
    const finalizeIdInput = document.getElementById('finalize-manutencao-id');
    const finalizeVeiculoInfo = document.getElementById('finalize-veiculo-info');
    const finalizeDataFimInput = document.getElementById('finalize-data-fim');
    const finalizeCustoInput = document.getElementById('finalize-custo');
    const finalizeOficinaInput = document.getElementById('finalize-oficina');
    const finalizeFormError = document.getElementById('finalize-form-error');
    
    const tipoMap = ['Corretiva', 'Preventiva'];

    // --- Funções de Modal ---
    const openAddModal = async () => {
        addForm.reset();
        addFormError.style.display = 'none';
        addDataInicioInput.valueAsDate = new Date();
        
        // Popula veículos no modal de adição
        addVeiculoSelect.innerHTML = '<option value="">Carregando...</option>';
        try {
            const veiculos = await veiculoService.getVeiculos();
            addVeiculoSelect.innerHTML = '<option value="">Selecione um veículo</option>';
            veiculos.forEach(v => {
                addVeiculoSelect.innerHTML += `<option value="${v.id}">${v.placa} - ${v.marca} ${v.modelo}</option>`;
            });
        } catch (error) {
            addVeiculoSelect.innerHTML = '<option value="">Erro ao carregar veículos</option>';
        }
        
        addModal.style.display = 'block';
    };

    const openFinalizeModal = async (manutencao) => {
        finalizeForm.reset();
        finalizeFormError.style.display = 'none';
        finalizeIdInput.value = manutencao.id;
        finalizeVeiculoInfo.textContent = `${manutencao.veiculo.placa} - ${manutencao.veiculo.marca}`;
        finalizeDataFimInput.valueAsDate = new Date();
        finalizeModal.style.display = 'block';
    };
    
    const closeModal = (modal) => {
        modal.style.display = 'none';
    };

    // --- Lógica Principal ---
    const loadManutencoes = async () => {
        try {
            const manutencoes = await manutencaoService.getManutencoes();
            tableBody.innerHTML = '';
            manutencoes.forEach(m => {
                const isFinalizada = m.dataFim != null;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${m.id}</td>
                    <td>${m.veiculo?.placa || 'N/A'}</td>
                    <td>${new Date(m.dataInicio).toLocaleDateString()}</td>
                    <td>${isFinalizada ? new Date(m.dataFim).toLocaleDateString() : 'Pendente'}</td>
                    <td>${tipoMap[m.tipo]}</td>
                    <td><span class="status ${isFinalizada ? 'status-concluida' : 'status-andamento'}">${isFinalizada ? 'Concluída' : 'Em Andamento'}</span></td>
                    <td class="action-buttons">
                        <button class="btn-edit btn-finalize" data-id="${m.id}" ${isFinalizada ? 'disabled' : ''}>Finalizar</button>
                        <button class="btn-delete" data-id="${m.id}">Excluir</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('[Manutencoes] Erro ao carregar manutenções:', error);
            tableBody.innerHTML = `<tr><td colspan="7">Erro ao carregar manutenções.</td></tr>`;
        }
    };

    // --- Event Listeners ---
    addBtn.addEventListener('click', openAddModal);
    
    [addModal, finalizeModal].forEach(modal => {
        modal.querySelector('.close-button').addEventListener('click', () => closeModal(modal));
        modal.querySelector('.cancel-btn').addEventListener('click', () => closeModal(modal));
    });

    const windowClickListener = (event) => {
        if (event.target == addModal) closeModal(addModal);
        if (event.target == finalizeModal) closeModal(finalizeModal);
    };
    window.addEventListener('click', windowClickListener);

    addForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const manutencaoData = {
            veiculoId: parseInt(addVeiculoSelect.value),
            dataInicio: addDataInicioInput.value,
            tipo: parseInt(addTipoSelect.value),
            descricaoProblema: addDescricaoInput.value,
        };
        try {
            await manutencaoService.createManutencao(manutencaoData);
            closeModal(addModal);
            loadManutencoes();
        } catch (error) {
            addFormError.textContent = error.data?.message || 'Ocorreu um erro ao salvar.';
            addFormError.style.display = 'block';
        }
    });

    finalizeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const manutencaoId = parseInt(finalizeIdInput.value);
        const finalizacaoData = {
            dataFim: finalizeDataFimInput.value,
            custo: parseFloat(finalizeCustoInput.value),
            oficinaOuResponsavel: finalizeOficinaInput.value,
        };
        try {
            await manutencaoService.finalizarManutencao(manutencaoId, finalizacaoData);
            closeModal(finalizeModal);
            loadManutencoes();
        } catch (error) {
            finalizeFormError.textContent = error.data?.message || 'Ocorreu um erro ao finalizar.';
            finalizeFormError.style.display = 'block';
        }
    });

    tableBody.addEventListener('click', async (event) => {
        const id = event.target.getAttribute('data-id');
        if (!id) return;
        
        if (event.target.classList.contains('btn-finalize')) {
            const manutencao = await manutencaoService.getManutencaoById(id);
            openFinalizeModal(manutencao);
        }

        if (event.target.classList.contains('btn-delete')) {
            if (confirm('Tem certeza que deseja excluir este registro de manutenção?')) {
                try {
                    await manutencaoService.deleteManutencao(id);
                    loadManutencoes();
                } catch (error) {
                    alert('Não foi possível excluir a manutenção.');
                }
            }
        }
    });

    loadManutencoes();

    return () => {
        console.log('[Manutencoes] Destroying page...');
        window.removeEventListener('click', windowClickListener);
    };
}
