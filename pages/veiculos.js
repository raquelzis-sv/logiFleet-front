function initVeiculosPage() {
    console.log('[Veiculos] initVeiculosPage started.');

    const tableBody = document.querySelector('#veiculos-table tbody');
    const modal = document.getElementById('veiculo-modal');
    const addBtn = document.getElementById('add-veiculo-btn');

    if (!tableBody || !modal || !addBtn) {
        console.error('[Veiculos] Elementos essenciais não encontrados.');
        return;
    }

    const closeButton = modal.querySelector('.close-button');
    const cancelBtn = modal.querySelector('#cancel-btn');
    const veiculoForm = document.getElementById('veiculo-form');
    const formError = modal.querySelector('#form-error');
    const modalTitle = modal.querySelector('#modal-title');
    
    // Inputs
    const veiculoIdInput = document.getElementById('veiculo-id');
    const placaInput = document.getElementById('veiculo-placa');
    const marcaInput = document.getElementById('veiculo-marca');
    const modeloInput = document.getElementById('veiculo-modelo');
    const anoInput = document.getElementById('veiculo-ano');
    const capacidadeInput = document.getElementById('veiculo-capacidade');
    const carroceriaInput = document.getElementById('veiculo-carroceria');
    const statusInput = document.getElementById('veiculo-status');
    const ultimaManutencaoInput = document.getElementById('veiculo-ultima-manutencao');
    const proximaManutencaoInput = document.getElementById('veiculo-proxima-manutencao');

    const statusMap = ['Disponível', 'Em Rota', 'Em Manutenção', 'Inativo'];

    const openModal = (veiculo = null) => {
        formError.style.display = 'none';
        veiculoForm.reset();
        if (veiculo) {
            modalTitle.textContent = 'Editar Veículo';
            veiculoIdInput.value = veiculo.id;
            placaInput.value = veiculo.placa;
            marcaInput.value = veiculo.marca;
            modeloInput.value = veiculo.modelo;
            anoInput.value = veiculo.anoFabricacao;
            capacidadeInput.value = veiculo.capacidadeCarga;
            carroceriaInput.value = veiculo.tipoCarroceria;
            statusInput.value = veiculo.status;
            ultimaManutencaoInput.value = veiculo.dataUltimaManutencao?.split('T')[0];
            proximaManutencaoInput.value = veiculo.dataProximaManutencao?.split('T')[0];
        } else {
            modalTitle.textContent = 'Adicionar Veículo';
            veiculoIdInput.value = '';
        }
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    const loadVeiculos = async () => {
        try {
            const veiculos = await veiculoService.getVeiculos();
            tableBody.innerHTML = '';
            veiculos.forEach(v => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${v.id}</td>
                    <td>${v.placa}</td>
                    <td>${v.marca}</td>
                    <td>${v.modelo}</td>
                    <td>${v.anoFabricacao}</td>
                    <td>${statusMap[v.status] || 'Desconhecido'}</td>
                    <td class="action-buttons">
                        <button class="btn-edit" data-id="${v.id}">Editar</button>
                        <button class="btn-delete" data-id="${v.id}">Excluir</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('[Veiculos] Erro ao carregar veículos:', error);
            tableBody.innerHTML = `<tr><td colspan="7">Erro ao carregar veículos.</td></tr>`;
        }
    };

    addBtn.addEventListener('click', () => openModal());
    closeButton.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    const windowClickListener = (event) => {
        if (event.target == modal) closeModal();
    };
    window.addEventListener('click', windowClickListener);

    veiculoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        formError.style.display = 'none';

        const veiculoData = {
            id: veiculoIdInput.value ? parseInt(veiculoIdInput.value) : 0,
            placa: placaInput.value,
            marca: marcaInput.value,
            modelo: modeloInput.value,
            anoFabricacao: parseInt(anoInput.value),
            capacidadeCarga: parseFloat(capacidadeInput.value),
            tipoCarroceria: carroceriaInput.value,
            status: parseInt(statusInput.value),
            dataUltimaManutencao: ultimaManutencaoInput.value || null,
            dataProximaManutencao: proximaManutencaoInput.value || null,
        };

        try {
            if (veiculoData.id) {
                await veiculoService.updateVeiculo(veiculoData.id, veiculoData);
            } else {
                const { id, ...createData } = veiculoData;
                await veiculoService.createVeiculo(createData);
            }
            closeModal();
            loadVeiculos();
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
                const veiculo = await veiculoService.getVeiculoById(id);
                openModal(veiculo);
            } catch (error) {
                alert('Não foi possível carregar os dados do veículo.');
            }
        }

        if (event.target.classList.contains('btn-delete')) {
            if (confirm('Tem certeza que deseja excluir este veículo?')) {
                try {
                    await veiculoService.deleteVeiculo(id);
                    loadVeiculos();
                } catch (error) {
                    alert('Não foi possível excluir o veículo.');
                }
            }
        }
    });

    loadVeiculos();

    return () => {
        console.log('[Veiculos] Destroying page...');
        window.removeEventListener('click', windowClickListener);
    };
}
