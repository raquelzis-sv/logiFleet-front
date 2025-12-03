// Roteador dinâmico que carrega HTML e JS sob demanda

// Mapeamento de rotas para templates e scripts
const routes = {
    '/': {
        template: 'pages/dashboard.html',
        script: 'pages/dashboard.js',
        init: () => window.initDashboardPage?.()
    },
    '/clientes': {
        template: 'pages/clientes.html',
        script: 'pages/clientes.js',
        init: () => window.initClientesPage?.()
    },
    '/motoristas': {
        template: 'pages/motoristas.html',
        script: 'pages/motoristas.js',
        init: () => window.initMotoristasPage?.()
    },
    '/pageCliente': {
        template: 'pages/pageCliente.html',
        script: 'pages/pageCliente.js',
        init: () => window.initPageCliente?.()
    },
    '/veiculos': {
        template: 'pages/veiculos.html',
        script: 'pages/veiculos.js',
        init: () => window.initVeiculosPage?.()
    },
    '/rotas': {
        template: 'pages/rotas.html',
        script: 'pages/rotas.js',
        init: () => window.initRotasPage?.()
    },
    '/pedidos': {
        template: 'pages/pedidos.html',
        script: 'pages/pedidos.js',
        init: () => window.initPedidosPage?.()
    },
    '/itens-pedido': {
        template: 'pages/itens-pedido.html',
        script: 'pages/itens-pedido.js',
        init: () => window.initItensPedidoPage?.()
    },
    '/manutencoes': {
        template: 'pages/manutencoes.html',
        script: 'pages/manutencoes.js',
        init: () => window.initManutencoesPage?.()
    },
    '/usuarios': {
        template: 'pages/usuarios.html',
        script: 'pages/usuarios.js',
        init: () => window.initUsuariosPage?.()
    },
    '/logs': {
        template: 'pages/logs.html',
        script: 'pages/logs.js',
        init: () => window.initLogsPage?.()
    },
    '/configuracoes': {
        template: 'pages/configuracoes.html',
        script: 'pages/configuracoes.js',
        init: () => window.initConfiguracoesPage?.()
    }
};

let currentPageDestroy = null;
const SCRIPT_ID = 'dynamic-page-script';

/**
 * Carrega um script dinamicamente no <head> e retorna uma Promise
 * que resolve quando o script é carregado.
 * @param {string} src - O caminho para o arquivo de script.
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // Remove o script antigo, se existir
        const oldScript = document.getElementById(SCRIPT_ID);
        if (oldScript) {
            oldScript.remove();
        }

        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = src;
        script.type = 'module';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Falha ao carregar o script: ${src}`));
        document.head.appendChild(script);
    });
}

/**
 * Função principal do roteador.
 */
const router = async () => {
    // 1. Limpa recursos da página anterior
    if (typeof currentPageDestroy === 'function') {
        currentPageDestroy();
        currentPageDestroy = null;
    }

    // 2. Resolve a rota atual
    const path = window.location.hash.slice(1) || '/';
    const route = routes[path];
    const mainContent = document.getElementById('main-content');

    if (!route || !mainContent) {
        mainContent.innerHTML = '<h1>404 - Página Não Encontrada</h1>';
        return;
    }

    try {
        // 3. Carrega o conteúdo HTML da página
        const response = await fetch(route.template);
        if (!response.ok) throw new Error(`Página não encontrada: ${route.template}`);
        mainContent.innerHTML = await response.text();

        // 4. Carrega o script da página, se houver
        if (route.script) {
            await loadScript(route.script);
        }

        // 5. Executa a função de inicialização da página
        if (route.init && typeof route.init === 'function') {
            const destroyFn = route.init();
            if (typeof destroyFn === 'function') {
                currentPageDestroy = destroyFn;
            }
        }

        // 6. Atualiza o link ativo na navegação
        updateNavLinks(path);

    } catch (error) {
        console.error("[Router] Erro:", error);
        mainContent.innerHTML = `<h1>Erro ao carregar a página</h1><p>${error.message}</p>`;
    }
};

/**
 * Atualiza a classe 'active' nos links de navegação.
 * @param {string} path - O caminho da rota atual.
 */
function updateNavLinks(path) {
    document.querySelectorAll('#main-nav a').forEach(link => {
        const linkPath = link.hash.slice(1) || '/';
        link.classList.toggle('active', linkPath === path);
    });
}

// Adiciona os listeners para o roteamento
window.addEventListener('hashchange', router);
window.addEventListener('load', router);

