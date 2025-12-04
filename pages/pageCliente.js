// URL da API de Endereços (o 'clienteId=' será preenchido pelo JavaScript)
const ENDERECO_API_BASE_URL = 'https://localhost:7188/api/EnderecoClientes';

// --- 1. FUNÇÕES AUXILIARES ---

/**
 * Simula a lógica de falha de CORS ou SSL com localhost em browsers modernos
 * Ao usar 'localhost' no navegador, é comum que requisições HTTPs (como 7188)
 * para um endereço diferente do domínio atual falhem devido a certificados SSL.
 * Se a busca falhar, esta função trata o erro.
 */
function handleApiError(elementId, error) {
    console.error(`Erro ao buscar dados da API para ${elementId}:`, error);
    const content = document.getElementById(elementId);
    content.innerHTML = `
        <p class="text-red-500 font-bold">Erro ao Conectar à API.</p>
        <p class="text-xs mt-1">Verifique se a API está rodando e se há problemas de CORS ou HTTPS (certificado). Usando dados mockados para continuar.</p>
    `;
    
    // Retorna dados mockados para continuar a demonstração
    return [{
        rua: "Av. Exemplo de Mock",
        numero: "999",
        cidade: "Mockland",
        estado: "MK",
        cep: "99999-999"
    }];
}

async function getById(id, options = {}) {
    return await fetchWrapper(`${ENDERECO_API_BASE_URL}/${id}`, options);
}

/**
 * Converte a string JSON de userData (do Local Storage) em um objeto.
 * @returns {object} Objeto de dados do usuário ou objeto vazio.
 */
function parseUserData() {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
        console.warn("Chave 'userData' não encontrada no Local Storage.");
        return {};
    }
    try {
        return JSON.parse(userDataString);
    } catch (e) {
        console.error("Erro ao fazer o parse do JSON de 'userData':", e);
        return {};
    }
}

// --- 2. FUNÇÕES DE CARREGAMENTO DE DADOS ---

/**
 * Carrega os dados do usuário do Local Storage e preenche o card.
 * @param {object} userData - Objeto de dados do usuário.
 */
function loadUserData(userData) {
    const content = document.getElementById('usuario-content');
    
    const userId = userData.id || 'N/A';
    const name = userData.nome || 'Usuário Desconhecido';
    const email = userData.email || 'sem.email@exemplo.com';

    content.innerHTML = `
        <ul class="space-y-2">
            <li><span class="font-medium text-gray-800">ID:</span> <span class="font-mono bg-yellow-100 p-1 rounded text-yellow-800">${userId}</span></li>
            <li><span class="font-medium text-gray-800">Nome:</span> ${name}</li>
            <li><span class="font-medium text-gray-800">Email:</span> ${email}</li>
        </ul>
    `;
    return userId; // Retorna o ID para a próxima busca
}

/**
 * Busca os endereços na API e preenche o card.
 * @param {string} userId - O ID do cliente a ser usado na API.
 */
async function loadEnderecoData(userId) {
    const content = document.getElementById('endereco-content');
    
    if (!userId || userId === 'N/A' || userId === 0) {
        content.innerHTML = '<p class="text-red-500">ID do usuário inválido ou não encontrado. Não é possível buscar o endereço.</p>';
        return;
    }

    const apiURL = getById(userId);

    try {
        const response = await fetch(apiURL);
        if (!response.ok) {
            throw new Error(`Status HTTP ${response.status}`);
        }
        const enderecos = await response.json();

        if (enderecos && enderecos.length > 0) {
            // Assume o primeiro endereço da lista para exibição
            const endereco = enderecos[0]; 
            content.innerHTML = `
                <p class="text-gray-800 font-medium">${endereco.rua}, ${endereco.numero}</p>
                <p>${endereco.cidade} - ${endereco.estado}</p>
                <p>CEP: ${endereco.cep}</p>
            `;
        } else {
            content.innerHTML = '<p class="text-gray-500">Nenhum endereço de entrega encontrado para este usuário.</p>';
        }

    } catch (error) {
        // Se a busca falhar (por ser localhost/CORS/etc.), trata o erro e usa mock.
        const mockEnderecos = handleApiError('endereco-content', error);
        const endereco = mockEnderecos[0];
            content.innerHTML = `
            <p class="text-gray-800 font-medium">${endereco.rua}, ${endereco.numero} (MOCK)</p>
            <p>${endereco.cidade} - ${endereco.estado}</p>
            <p>CEP: ${endereco.cep}</p>
        `;
    }
}

/**
 * Preenche o card de Status do Pedido (com dados mockados, pois não há API para isso).
 */
function loadStatusAndPedidoData() {
    const statusContainer = document.getElementById('status-container');
    const statusDescricao = document.getElementById('status-descricao');
    
    // Dados Mockados de Status
    const status = "Pedido Enviado";
    const descricao = "Sua encomenda saiu do centro de distribuição e está a caminho do destino.";

    // Atualiza o Status
    statusContainer.classList.remove('loading'); // Remove o spinner
    statusContainer.innerHTML = `
        <h1 class="text-3xl font-bold">${status}</h1>
        <p id="status-descricao" class="text-lg mt-1 opacity-90">${descricao}</p>
    `;

    // O conteúdo do Pedido já está em mockup no HTML, mas podemos ajustá-lo aqui se necessário.
    const pedidoTotal = document.getElementById('pedido-total');
    if (status.includes("Enviado")) {
        pedidoTotal.classList.add('text-green-300', 'font-bold');
    }
}

// --- 3. INICIALIZAÇÃO ---

async function init() {
    // 1. Carrega dados do Local Storage (userData)
    const userData = parseUserData();
    const userId = loadUserData(userData);
    
    // 2. Carrega Status e Pedido (Mock)
    loadStatusAndPedidoData();

    // 3. Busca Endereço na API (precisa do userId)
    await loadEnderecoData(userId);
}

// Inicia a aplicação após o carregamento da página
window.onload = init;