// Um roteador front-end simples

// 1. Definição das Rotas
// Mapeia um "hash" para o template HTML e a função de inicialização da página.
const routes = {
    '/': {
        template: 'pages/dashboard.html',
        init: () => { if (window.initDashboardPage) return window.initDashboardPage(); }
    },
    '/clientes': {
        template: 'pages/clientes.html',
        init: () => { if (window.initClientesPage) return window.initClientesPage(); }
    },
    '/motoristas': {
        template: 'pages/motoristas.html',
        init: () => { if (window.initMotoristasPage) return window.initMotoristasPage(); }
    },
    '/veiculos': {
        template: 'pages/veiculos.html',
        init: () => { if (window.initVeiculosPage) return window.initVeiculosPage(); }
    },
    '/rotas': {
        template: 'pages/rotas.html',
        init: () => { if (window.initRotasPage) return window.initRotasPage(); }
    },
    '/pedidos': {
        template: 'pages/pedidos.html',
        init: () => { if (window.initPedidosPage) return window.initPedidosPage(); }
    },
    '/manutencoes': {
        template: 'pages/manutencoes.html',
        init: () => { if (window.initManutencoesPage) return window.initManutencoesPage(); }
    },
    '/usuarios': {
        template: 'pages/usuarios.html',
        init: () => { if (window.initUsuariosPage) return window.initUsuariosPage(); }
    },
    '/logs': {
        template: 'pages/logs.html',
        init: () => { if (window.initLogsPage) return window.initLogsPage(); }
    },
    '/configuracoes': {
        template: 'pages/configuracoes.html',
        init: () => { if (window.initConfiguracoesPage) return window.initConfiguracoesPage(); }
    }
};

let currentPageDestroy = null;

const router = async () => {
    // 0. Limpa a página anterior
    if (typeof currentPageDestroy === 'function') {
        console.log('[Router] Cleaning up previous page...');
        currentPageDestroy();
        currentPageDestroy = null;
    }

    console.log('[Router] Hash changed, processing route.');
    const path = window.location.hash.slice(1) || '/';
    console.log(`[Router] Path resolved to: "${path}"`);
    
    const route = routes[path];
    const mainContent = document.getElementById('main-content');

    if (route && mainContent) {
        console.log(`[Router] Route found for "${path}". Template: ${route.template}`);
        try {
            // 1. Carrega o HTML da página
            console.log(`[Router] Fetching HTML for "${path}"...`);
            const response = await fetch(route.template);
            if (!response.ok) throw new Error(`A página em "${route.template}" não foi encontrada (status: ${response.status}).`);
            mainContent.innerHTML = await response.text();
            console.log(`[Router] HTML for "${path}" loaded successfully.`);

            // 2. Executa a função de inicialização e armazena a função de limpeza
            if (route.init && typeof route.init === 'function') {
                console.log(`[Router] Calling init function for "${path}"...`);
                const destroyFn = route.init();
                if(typeof destroyFn === 'function') {
                    currentPageDestroy = destroyFn;
                    console.log(`[Router] Destroy function for "${path}" stored.`);
                }
                console.log(`[Router] Init function for "${path}" executed.`);
            } else {
                console.warn(`[Router] No init function found for route "${path}".`);
            }

            // 3. Atualiza o link ativo na navegação
            updateNavLinks(path);

        } catch (error) {
            console.error("[Router] Erro no roteador:", error);
            mainContent.innerHTML = `<h1>Erro ao carregar página</h1><p>${error.message}</p>`;
        }
    } else if (mainContent) {
        console.error(`[Router] No route found for path: "${path}"`);
        mainContent.innerHTML = '<h1>404 - Página Não Encontrada</h1><p>A rota que você tentou acessar não existe.</p>';
        updateNavLinks(null); // Limpa a seleção ativa
    }
};

function updateNavLinks(path) {
    const navLinks = document.querySelectorAll('#main-nav a');
    navLinks.forEach(link => {
        const linkPath = link.hash ? link.hash.slice(1) : '/';
        if (linkPath === path) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Ouve as mudanças de hash e o carregamento da página para acionar o roteador
window.addEventListener('hashchange', router);
window.addEventListener('load', router);

