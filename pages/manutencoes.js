import * as manutencaoService from '../js/services/manutencaoService.js';
import * as veiculoService from '../js/services/veiculoService.js';

function initManutencoesPage() {
    const elements = {
        tableBody: document.getElementById('manutencoes-table-body'),
        addButton: document.getElementById('add-manutencao-button'),
        modalOverlay: document.getElementById('manutencao-modal-overlay'),
        modalTitle: document.getElementById('modal-title'),
        closeModalButton: document.getElementById('close-modal-button'),
        cancelButton: document.getElementById('cancel-button'),
        manutencaoForm: document.getElementById('manutencao-form'),
        manutencaoId: document.getElementById('manutencao-id'),
        veiculoId: document.getElementById('veiculoId'),
        tipo: document.getElementById('tipo'),
        dataInicio: document.getElementById('dataInicio'),
        dataFim: document.getElementById('dataFim'),
        custo: document.getElementById('custo'),
        descricao: document.getElementById('descricao'),
        oficinaOuResponsavel: document.getElementById('oficinaOuResponsavel'),
        saveButton: document.getElementById('save-button'),
    };

    let veiculosCache = [];
    const tipoManutencaoMap = {
        0: 'Preventiva',
        1: 'Corretiva'
    };
    const tipoManutencaoReverseMap = {
        'Preventiva': 0,
        'Corretiva': 1
    };

    async function populateVeiculosDropdown() {
        try {
            const veiculos = await veiculoService.getAll();
            veiculosCache = veiculos;
            elements.veiculoId.innerHTML = '<option value="">Selecione um veículo</option>';
            veiculos.forEach(v => {
                elements.veiculoId.innerHTML += `<option value="${v.id}">${v.placa} - ${v.modelo}</option>`;
            });
        } catch (error) {
            console.error("Erro ao carregar veículos:", error);
        }
    }

    function renderTable(manutencoes) {
        elements.tableBody.innerHTML = '';
        if (!manutencoes || manutencoes.length === 0) {
            elements.tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nenhuma manutenção encontrada.</td></tr>';
            return;
        }

        manutencoes.forEach(m => {
            const row = document.createElement('tr');
            row.dataset.id = m.id;
            const veiculo = veiculosCache.find(v => v.id === m.veiculoId);
            row.innerHTML = `
                <td>${m.id}</td>
                <td>${veiculo?.placa || 'N/A'}</td>
                <td>${tipoManutencaoMap[m.tipo]}</td>
                <td>${new Date(m.dataInicio).toLocaleDateString()}</td>
                <td>${m.dataFim ? new Date(m.dataFim).toLocaleDateString() : 'Em andamento'}</td>
                <td>R$ ${m.custo.toFixed(2)}</td>
                <td class="action-buttons">
                    <button class="button warning edit-button" data-id="${m.id}">Editar</button>
                    <button class="button danger delete-button" data-id="${m.id}">Excluir</button>
                </td>
            `;
            elements.tableBody.appendChild(row);
        });
    }

    async function loadManutencoes() {
        elements.tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Carregando...</td></tr>';
        try {
            await populateVeiculosDropdown();
            const manutencoes = await manutencaoService.getAll();
            renderTable(manutencoes);
        } catch (error) {
            console.error('Erro ao carregar manutenções:', error);
            elements.tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Erro ao carregar os dados.</td></tr>';
        }
    }

    function showModal(mode = 'add', manutencao = null) {
        elements.manutencaoForm.reset();
        elements.manutencaoId.value = '';

        populateVeiculosDropdown().then(() => {
            if (mode === 'edit' && manutencao) {
                elements.modalTitle.textContent = 'Editar Manutenção';
                elements.manutencaoId.value = manutencao.id;
                elements.veiculoId.value = manutencao.veiculoId;
                elements.tipo.value = tipoManutencaoMap[manutencao.tipo];
                elements.dataInicio.value = manutencao.dataInicio.split('T')[0];
                elements.dataFim.value = manutencao.dataFim ? manutencao.dataFim.split('T')[0] : '';
                elements.custo.value = manutencao.custo;
                elements.descricao.value = manutencao.descricao;
                elements.oficinaOuResponsavel.value = manutencao.oficinaOuResponsavel;
            } else {
                elements.modalTitle.textContent = 'Nova Manutenção';
            }
        });
        elements.modalOverlay.classList.add('visible');
    }

    function hideModal() {
        elements.modalOverlay.classList.remove('visible');
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        const id = parseInt(elements.manutencaoId.value, 10);
        const manutencaoData = {
            veiculoId: parseInt(elements.veiculoId.value),
            tipo: tipoManutencaoReverseMap[elements.tipo.value],
            dataInicio: elements.dataInicio.value,
            dataFim: elements.dataFim.value || null,
            custo: parseFloat(elements.custo.value),
            descricao: elements.descricao.value,
            oficinaOuResponsavel: elements.oficinaOuResponsavel.value,
        };


        elements.saveButton.disabled = true;
        try {
            if (id) {
                await manutencaoService.update(id, manutencaoData);
            } else {
                await manutencaoService.create(manutencaoData);
            }
            hideModal();
            loadManutencoes();
        } catch (error) {
            console.error(`Erro ao salvar manutenção:`, error);
            alert('Não foi possível salvar a manutenção.');
        } finally {
            elements.saveButton.disabled = false;
        }
    }

    async function handleDelete(id) {
        if (!confirm('Tem certeza?')) return;
        try {
            await manutencaoService.remove(id);
            loadManutencoes();
        } catch (error) {
            console.error(`Erro ao excluir manutenção:`, error);
            alert('Não foi possível excluir a manutenção.');
        }
    }

    // --- LÓGICA PRINCIPAL ---
    loadManutencoes();
    elements.addButton.addEventListener('click', () => showModal('add'));
    elements.closeModalButton.addEventListener('click', hideModal);
    elements.cancelButton.addEventListener('click', hideModal);
    elements.modalOverlay.addEventListener('click', (e) => { if (e.target === elements.modalOverlay) hideModal(); });
    elements.manutencaoForm.addEventListener('submit', handleFormSubmit);
    elements.tableBody.addEventListener('click', async (event) => {
        const target = event.target;
        const id = parseInt(target.dataset.id);
        if (target.classList.contains('edit-button')) {
            const manutencao = await manutencaoService.getById(id);
            showModal('edit', manutencao);
        } else if (target.classList.contains('delete-button')) {
            handleDelete(id);
        }
    });

    const destroy = () => { console.log("Limpando página de manutenções."); };
    return destroy;
}
window.initManutencoesPage = initManutencoesPage;