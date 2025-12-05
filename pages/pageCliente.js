import * as pedidoService from '../js/services/pedidoService.js';

/**
 * Funções de Renderização (preenchem o HTML com dados)
 */

function renderUserData() {
    const content = document.getElementById('usuario-content');
    const userDataString = localStorage.getItem('userData');
    
    if (!userDataString) {
        content.innerHTML = '<p class="text-red-500">Não foi possível carregar os dados do usuário.</p>';
        return;
    }

    const userData = JSON.parse(userDataString);
    const name = userData.nome || 'Usuário Desconhecido';
    const email = userData.email || 'sem.email@exemplo.com';

    content.innerHTML = `
        <ul class="space-y-2">
            <li><span class="font-medium text-gray-800">Nome:</span> ${name}</li>
            <li><span class="font-medium text-gray-800">Email:</span> ${email}</li>
        </ul>
    `;
}

function renderPedidoData(pedido) {
    // --- 1. Atualiza o Status ---
    const statusContainer = document.getElementById('status-container');
    const statusMap = {
        0: { text: "Pendente", desc: "Seu pedido foi recebido e está aguardando processamento." },
        1: { text: "Em Rota", desc: "Sua encomenda saiu para entrega." },
        2: { text: "Entregue", desc: "Seu pedido foi entregue com sucesso!" },
        3: { text: "Cancelado", desc: "Este pedido foi cancelado." }
    };
    const statusInfo = statusMap[pedido.status] || { text: "Desconhecido", desc: "O status do seu pedido é desconhecido." };
    
    statusContainer.innerHTML = `
        <h1 class="text-3xl font-bold">${statusInfo.text}</h1>
        <p class="text-lg mt-1 opacity-90">${statusInfo.desc}</p>
    `;

    // --- 2. Detalhes do Pedido ---
    const pedidoContent = document.getElementById('pedido-content');
    const totalItens = pedido.itensPedido ? pedido.itensPedido.length : 0;
    
    pedidoContent.innerHTML = `
        <ul class="mt-4 space-y-2">
            <li><span class="font-medium text-gray-800">Nº Pedido:</span> <span class="font-mono bg-gray-100 p-1 rounded">#${pedido.id}</span></li>
            <li><span class="font-medium text-gray-800">Data do Pedido:</span> ${new Date(pedido.dataCriacao).toLocaleDateString()}</li>
            <li><span class="font-medium text-gray-800">Itens no Pedido:</span> ${totalItens}</li>
            <li><span class="font-medium text-gray-800">Peso Total:</span> ${pedido.pesoTotalKg.toFixed(2)} kg</li>
            <li><span class="font-medium text-gray-800">Volume Total:</span> ${pedido.volumeTotalM3.toFixed(3)} m³</li>
        </ul>
    `;

    // --- 3. Endereço de Entrega ---
    const enderecoContent = document.getElementById('endereco-content');
    if (pedido.enderecoEntrega) {
        const endereco = pedido.enderecoEntrega;
        enderecoContent.innerHTML = `
            <p class="text-gray-800 font-medium">${endereco.logradouro}, ${endereco.numero}</p>
            <p>${endereco.cidade} - ${endereco.uf}</p>
            <p>CEP: ${endereco.cep}</p>
        `;
    } else {
        enderecoContent.innerHTML = '<p class="text-gray-500">Endereço de entrega não especificado.</p>';
    }
}

function renderNoOrders() {
    document.getElementById('status-container').innerHTML = `
        <h1 class="text-3xl font-bold">Bem-vindo(a)!</h1>
        <p class="text-lg mt-1 opacity-90">Você ainda não possui pedidos registrados.</p>
    `;
    document.getElementById('pedido-card').style.display = 'none';
    document.getElementById('endereco-card').style.display = 'none';
}

function renderError(error) {
    console.error("Erro ao carregar dados da página do cliente:", error);
    document.getElementById('app').innerHTML = `
        <div class="card border-red-500 text-center">
            <h1 class="text-2xl font-bold text-red-600">Ocorreu um Erro</h1>
            <p class="mt-2">Não foi possível carregar as informações do seu pedido.</p>
            <p class="text-sm text-gray-500 mt-4">${error.message || 'Tente novamente mais tarde.'}</p>
        </div>
    `;
}

/**
 * Função de Inicialização da Página do Cliente
 * Chamada pelo roteador.
 */
async function initPageCliente() {
    try {
        // Carrega os dados estáticos do usuário
        renderUserData();
        
        // Busca os pedidos do cliente
        const pedidos = await pedidoService.getMeusPedidos();
        
        // Verifica se há pedidos e renderiza o mais recente
        if (pedidos && pedidos.length > 0) {
            // A API já retorna ordenado por data de criação descendente
            const pedidoMaisRecente = pedidos[0]; 
            renderPedidoData(pedidoMaisRecente);
        } else {
            // Caso não haja pedidos
            renderNoOrders();
        }
    } catch (error) {
        // Trata erros de API ou de renderização
        renderError(error);
    }

    // Função de limpeza (opcional, pode ser usada para remover listeners)
    return () => {
        console.log("Cleaning up client page resources.");
    };
}

// Disponibiliza a função no objeto window para ser chamada pelo roteador
window.initPageCliente = initPageCliente;
