// Importa todos os serviços necessários
import * as rotaService from '../js/services/rotaService.js';
import * as veiculoService from '../js/services/veiculoService.js';
import * as motoristaService from '../js/services/motoristaService.js';
import * as pedidoService from '../js/services/pedidoService.js';

function initRotasPage() {
    // 1. Mapeamento de Elementos
    const elements = {
        tableBody: document.getElementById('rotas-table-body'),
        addButton: document.getElementById('add-rota-button'),
        // Modal de Criação
        createModalOverlay: document.getElementById('rota-modal-overlay'),
        closeCreateModalButton: document.getElementById('close-modal-button'),
        rotaForm: document.getElementById('rota-form'),
        veiculoIdSelect: document.getElementById('veiculoId'),
        motoristaIdSelect: document.getElementById('motoristaId'),
        pedidosCheckboxContainer: document.getElementById('pedidos-checkbox-container'),
        formErrorMessage: document.getElementById('form-error-message'),
        saveButton: document.getElementById('save-button'),
        // Modal de Detalhes
        detailsModalOverlay: document.getElementById('rota-details-modal-overlay'),
        detailsModalBody: document.getElementById('rota-details-body'),
        closeDetailsModalButton: document.getElementById('close-details-modal-button'),
    };

    // 2. Cache de dados
    let veiculosCache = [];
    let motoristasCache = [];

    // 3. Funções de Renderização da Tabela
    function getStatusClass(status) {
        switch (status) {
            case 'Planejada': return 'status-planejada';
            case 'EmAndamento': return 'status-em-andamento';
            case 'Concluida': return 'status-concluida';
            case 'Cancelada': return 'status-cancelada';
            default: return '';
        }
    }

    function renderTable(rotas) {
        elements.tableBody.innerHTML = '';
        if (!rotas || rotas.length === 0) {
            elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhuma rota encontrada.</td></tr>';
            return;
        }

        rotas.forEach(rota => {
            const veiculo = veiculosCache.find(v => v.id === rota.veiculoId) || {};
            const motorista = motoristasCache.find(m => m.id === rota.motoristaId) || {};
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${rota.id}</td>
                <td>${new Date(rota.dataRota).toLocaleDateString()}</td>
                <td><span class="status-badge ${getStatusClass(rota.status)}">${rota.status}</span></td>
                <td>${veiculo.modelo} (${veiculo.placa})</td>
                <td>${motorista.nome}</td>
                <td class="action-buttons">
                    <button class="button details-button" data-id="${rota.id}">Ver Detalhes</button>
                    <button class="button danger delete-button" data-id="${rota.id}">Excluir</button>
                </td>
            `;
            elements.tableBody.appendChild(row);
        });
    }

    async function loadAndRenderRotas() {
        elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Carregando...</td></tr>';
        try {
            const rotas = await rotaService.getAll();
            renderTable(rotas);
        } catch (error) {
            console.error('Erro ao carregar rotas:', error);
            elements.tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Erro ao carregar os dados.</td></tr>';
        }
    }

    // 4. Funções de Carregamento de Dados Iniciais
    async function loadInitialData() {
        try {
            [veiculosCache, motoristasCache] = await Promise.all([
                veiculoService.getAll(),
                motoristaService.getAll(),
            ]);
            populateSelect(elements.veiculoIdSelect, veiculosCache, v => `${v.modelo} (${v.placa})`, v => v.id);
            populateSelect(elements.motoristaIdSelect, motoristasCache, m => m.nome, m => m.id);
        } catch (error) {
            console.error("Erro ao carregar dados iniciais:", error);
        }
    }

    function populateSelect(select, items, textMap, valueMap) {
        select.innerHTML = `<option value="">Selecione</option>`;
        items.forEach(item => {
            select.innerHTML += `<option value="${valueMap(item)}">${textMap(item)}</option>`;
        });
    }
    
    // 5. Lógica do Modal de Detalhes
    function populateDetailsModal(rota) {
        const veiculo = veiculosCache.find(v => v.id === rota.veiculoId) || {};
        const motorista = motoristasCache.find(m => m.id === rota.motoristaId) || {};
        
        let climaHtml = '<h4><i class="fas fa-cloud-sun"></i> Previsão do Tempo no Destino</h4><p>Informação de clima não disponível.</p>';
        const clima = rota.alertasClimaticos && rota.alertasClimaticos[0];
        if (clima) {
            climaHtml = `
                <h4><i class="fas fa-cloud-sun"></i> Previsão do Tempo no Destino</h4>
                <div class="weather-info ${clima.tipoAlerta ? 'has-alert' : ''}">
                    <div class="weather-details">
                        <img src="https://openweathermap.org/img/wn/${clima.icone}@2x.png" alt="Ícone do tempo">
                        <div class="weather-main">
                            <p class="weather-temp">${clima.temperatura.toFixed(1)}°C</p>
                            <p class="weather-desc">${clima.descricao}</p>
                            <p class="weather-feels">Sensação de ${clima.sensacaoTermica.toFixed(1)}°C</p>
                        </div>
                    </div>
                    ${clima.tipoAlerta ? `<div class="weather-alert alert-${clima.severidade?.toLowerCase().replace('é', 'e')}"><strong>Alerta:</strong> ${clima.tipoAlerta} (Severidade: ${clima.severidade})</div>` : ''}
                </div>
            `;
        }

        let pedidosHtml = '<h4><i class="fas fa-box-open"></i> Pedidos na Rota</h4>';
        if (!rota.rotaPedidos || rota.rotaPedidos.length === 0) {
            pedidosHtml += '<p>Nenhum pedido nesta rota.</p>';
        } else {
            pedidosHtml += '<ul class="pedido-list">';
            rota.rotaPedidos.forEach(rp => {
                const p = rp.pedido;
                const end = p.enderecoEntrega;
                const cliente = p.cliente;
                const enderecoStr = end ? `${end.logradouro}, ${end.numero}, ${end.bairro}, ${end.cidade} - ${end.uf}` : 'Endereço não informado.';
                const coordsStr = end && end.latitude !== 0 ? `<br><small>Lat: ${end.latitude.toFixed(4)}, Lon: ${end.longitude.toFixed(4)}</small>` : '';
                pedidosHtml += `<li><strong>Pedido #${p.id}</strong> - Cliente: ${cliente?.nomeEmpresa || 'N/A'}<br><small>${enderecoStr}</small>${coordsStr}</li>`;
            });
            pedidosHtml += '</ul>';
        }

        elements.detailsModalBody.innerHTML = `
            <div class="details-grid">
                <div class="details-section">
                    <h4><i class="fas fa-route"></i> Rota #${rota.id}</h4>
                    <p><strong>Data:</strong> ${new Date(rota.dataRota).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${getStatusClass(rota.status)}">${rota.status}</span></p>
                </div>
                <div class="details-section">
                    <h4><i class="fas fa-user-tie"></i> Responsáveis</h4>
                    <p><strong>Veículo:</strong> ${veiculo.modelo} (${veiculo.placa})</p>
                    <p><strong>Motorista:</strong> ${motorista.nome}</p>
                </div>
                <div class="details-section full-width">
                    ${pedidosHtml}
                </div>
                <div class="details-section full-width">
                    ${climaHtml}
                </div>
            </div>
        `;
    }

    async function handleShowDetails(id) {
        elements.detailsModalBody.innerHTML = '<p>Carregando detalhes...</p>';
        elements.detailsModalOverlay.classList.add('visible');
        try {
            const rota = await rotaService.getById(id);
            populateDetailsModal(rota);
        } catch(error) {
            console.error("Erro ao buscar detalhes da rota:", error);
            elements.detailsModalBody.innerHTML = '<p class="error-message">Não foi possível carregar os detalhes.</p>';
        }
    }

    // 6. Lógica do Modal de Criação
    async function populatePedidosCheckboxes() {
        elements.pedidosCheckboxContainer.innerHTML = '<p>Carregando...</p>';
        try {
            const pedidos = await pedidoService.getPedidosPendentes();
            elements.pedidosCheckboxContainer.innerHTML = '';
            if (pedidos.length === 0) {
                elements.pedidosCheckboxContainer.innerHTML = '<p>Nenhum pedido pendente.</p>';
                return;
            }
            pedidos.forEach(p => {
                elements.pedidosCheckboxContainer.innerHTML += `
                    <div class="checkbox-item">
                        <input type="checkbox" id="pedido-${p.id}" name="pedidosIds" value="${p.id}">
                        <label for="pedido-${p.id}">#${p.id} - ${p.cliente.nomeEmpresa}</label>
                    </div>
                `;
            });
        } catch (error) {
            elements.pedidosCheckboxContainer.innerHTML = '<p>Falha ao carregar pedidos.</p>';
        }
    }
    
    function showCreateModal() {
        elements.rotaForm.reset();
        elements.formErrorMessage.textContent = '';
        populatePedidosCheckboxes();
        elements.createModalOverlay.classList.add('visible');
    }
    
    async function handleFormSubmit(event) {
        event.preventDefault();
        elements.saveButton.disabled = true;
        elements.formErrorMessage.textContent = '';
        
        const pedidosIds = Array.from(elements.rotaForm.querySelectorAll('input[name="pedidosIds"]:checked')).map(cb => parseInt(cb.value));
        if (pedidosIds.length === 0) {
            elements.formErrorMessage.textContent = 'Selecione ao menos um pedido.';
            elements.saveButton.disabled = false;
            return;
        }

        const rotaData = {
            veiculoId: parseInt(elements.veiculoIdSelect.value),
            motoristaId: parseInt(elements.motoristaIdSelect.value),
            pedidosIds: pedidosIds,
        };

        try {
            await rotaService.create(rotaData);
            elements.createModalOverlay.classList.remove('visible');
            loadAndRenderRotas();
        } catch (error) {
            elements.formErrorMessage.textContent = error.data?.message || 'Um erro desconhecido ocorreu.';
        } finally {
            elements.saveButton.disabled = false;
        }
    }
    
    // 7. Event Handlers
    function setupEventListeners() {
        elements.addButton.addEventListener('click', showCreateModal);
        elements.closeCreateModalButton.addEventListener('click', () => elements.createModalOverlay.classList.remove('visible'));
        elements.closeDetailsModalButton.addEventListener('click', () => elements.detailsModalOverlay.classList.remove('visible'));
        elements.rotaForm.addEventListener('submit', handleFormSubmit);

        elements.tableBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('details-button')) {
                handleShowDetails(event.target.dataset.id);
            }
            if (event.target.classList.contains('delete-button')) {
                // A função de delete pode ser implementada aqui se necessário
                console.log('Delete clicado para o ID:', event.target.dataset.id);
            }
        });
    }

    // 8. Inicialização
    setupEventListeners();
    loadInitialData().then(loadAndRenderRotas);

    return () => console.log("Limpando página de rotas.");
}

window.initRotasPage = initRotasPage;