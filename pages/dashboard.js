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

    const quantidadeVeiculo = veiculoService.getQuantidade();


    console.log("Quantidade de veículos ativos:", quantidadeVeiculo.val);
    const veiculosCard = document.getElementById('veiculos-ativos');

    // 4. Injetar o HTML dinâmico
    // Note que recriamos o <h3> e o <p> para manter a estrutura original
    veiculosCard.innerHTML = `
        <h3>Veículos Ativos</h3>
        <p class="summary-value">${quantidadeVeiculo}</p>
    `;

///////////////////////////////////////////////////////////////////////////////////////////////
    const quantidadePedidosAndamento = pedidoService.getQuantidade();

    console.log("Quantidade de pedidos em andamento:", quantidadePedidosAndamento.val);
    const pedidosCard = document.getElementById('pedidos-andamento');

    pedidosCard.innerHTML = `
        <h3>Pedidos em Andamento</h3>
        <p class="summary-value">${quantidadePedidosAndamento}</p>
    `;
///////////////////////////////////////////////////////////////////////////////////////////////
    const quantidadeClientes = usuarioService.getQuantidade();

    console.log("Quantidade de pedidos em andamento:", quantidadeClientes.val);
    const clientesCard = document.getElementById('Clientes');

    clientesCard.innerHTML = `
        <h3>Clientes Ativos</h3>
        <p class="summary-value">${quantidadeClientes}</p>
    `;


///////////////////////////////////////////////////////////////////////////////////////////////
    const quantidadeManutencao = manutencaoService.getQuantidade();

    console.log("Quantidade de pedidos em andamento:", quantidadeManutencao.val);
    const manutencaoCard = document.getElementById('manutencaoCard');

    manutencaoCard.innerHTML = `
        <h3>Clientes Ativos</h3>
        <p class="summary-value">${quantidadeManutencao}</p>
    `;





}

function redirection(valorBotao) {
    switch (valorBotao) {
        case 1:
            // Caminho para a página de veículos
            window.location.href = "veiculos.html";
            break;

        case 2:
            // Caminho para a página de pedidos
            window.location.href = "pedidos.html";
            break;

        case 3:
            // Caminho para a página de clientes
            window.location.href = "clientes.html";
            break;

        case 4:
            // Caminho para a página de manutenção
            window.location.href = "manutencao.html";
            break;

        default:
            console.log("Nenhuma rota definida para o valor: " + valorBotao);
            break;
    }
}


async function initDashboardPage() {

    
    renderIformation();
    console.log("Página do Dashboard inicializada.");

    // Poderíamos ter lógicas aqui no futuro, como buscar dados reais para os cards.

    // Retorna uma função de "limpeza" que o roteador pode chamar ao sair da página.
    // Útil para remover event listeners e evitar memory leaks.
    return () => {
        console.log("Limpando a página do Dashboard.");
    };
}

// Disponibiliza a função globalmente para que o router.js possa encontrá-la
window.initDashboardPage = initDashboardPage;