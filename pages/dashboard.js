// Função de inicialização para a página de dashboard
import * as veiculoService from '../js/services/veiculoService.js';
import * as pedidoService from '../js/services/pedidoService.js';
import * as clienteService from '../js/services/clienteService.js';
import * as usuarioService from '../js/services/usuarioService.js';
import * as manutencaoService from '../js/services/manutencaoService.js';

/*

const dashboardElements = {
    // Selecionando o título
    pageTitle: document.querySelector('.page-header h1'),
    
    // Selecionando os cards containers (se precisar criar novos)
    summaryContainer: document.querySelector('.summary-container'),
    
    // Como você tem vários valores iguais (summary-value), 
    // idealmente você deve adicionar IDs específicos no HTML 
    // ou usar seletores específicos como abaixo:
    
    // Opção 1: Pegando todos os valores em uma lista (NodeList)
    allValues: document.querySelectorAll('.summary-value'), 
    
    // Opção 2: Pegando valores específicos baseados na ordem ou ícone (mais frágil)
    veiculosAtivos: document.querySelector('.summary-card:nth-child(1) .summary-value'),
    pedidosAndamento: document.querySelector('.summary-card:nth-child(2) .summary-value'),
    clientesAtivos: document.querySelector('.summary-card:nth-child(3) .summary-value'),
    manutencoesPendentes: document.querySelector('.summary-card:nth-child(4) .summary-value'),
};

*/

async function renderIformation() {
    try {
        const [quantidadeVeiculo, quantidadePedidosAndamento, quantidadeClientes, quantidadeManutencao] = await Promise.all([
            veiculoService.getQuantidade(),
            pedidoService.getQuantidade(),
            clienteService.getQuantidade(), 
            manutencaoService.getQuantidade()
        ]);

        console.log("Quantidade de veículos ativos:", quantidadeVeiculo);
        const veiculosCard = document.getElementById('veiculos-ativos');
        veiculosCard.innerHTML = `
            <h3>Veículos Ativos</h3>
            <p class="summary-value">${quantidadeVeiculo}</p>
        `;

        console.log("Quantidade de pedidos em andamento:", quantidadePedidosAndamento);
        const pedidosCard = document.getElementById('pedidos-andamento');
        pedidosCard.innerHTML = `
            <h3>Pedidos em Andamento</h3>
            <p class="summary-value">${quantidadePedidosAndamento}</p>
        `;

        console.log("Quantidade de clientes ativos:", quantidadeClientes);
        const clientesCard = document.getElementById('Clientes');
        clientesCard.innerHTML = `
            <h3>Clientes Ativos</h3>
            <p class="summary-value">${quantidadeClientes}</p>
        `;

        console.log("Quantidade de manutenções pendentes:", quantidadeManutencao);
        const manutencaoCard = document.getElementById('manutencaoCard');
        manutencaoCard.innerHTML = `
            <h3>Manutenções Pendentes</h3>
            <p class="summary-value">${quantidadeManutencao}</p>
        `;
    } catch (error) {
        console.error("Erro ao renderizar informações do dashboard:", error);
        // Opcional: Mostrar uma mensagem de erro para o usuário no dashboard
    }
}

async function initDashboardPage() {
    await renderIformation(); // Garante que os dados sejam carregados primeiro
    console.log("Página do Dashboard inicializada e dados renderizados.");

    // Mapeamento de IDs dos cartões para as rotas de destino
    const cardRoutes = {
        'card-veiculos': '/veiculos',
        'card-pedidos': '/pedidos',
        'card-clientes': '/clientes',
        'card-manutencoes': '/manutencoes'
    };

    // Adiciona os event listeners
    const listeners = [];
    for (const cardId in cardRoutes) {
        const card = document.getElementById(cardId);
        if (card) {
            const path = cardRoutes[cardId];
            const listener = () => {
                window.location.hash = path;
            };
            card.addEventListener('click', listener);
            card.style.cursor = 'pointer'; // Adiciona um feedback visual
            listeners.push({ card, listener });
        }
    }

    // Retorna uma função de "limpeza" que o roteador chama ao sair da página.
    // Isso remove os event listeners para evitar memory leaks.
    return () => {
        console.log("Limpando a página do Dashboard e removendo event listeners.");
        listeners.forEach(({ card, listener }) => {
            card.removeEventListener('click', listener);
        });
    };
}

// Disponibiliza a função globalmente para que o router.js possa encontrá-la
window.initDashboardPage = initDashboardPage;