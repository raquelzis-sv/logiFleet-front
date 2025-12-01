// Mapeamento de rotas para Material Icons
const ICON_MAP = {
    '/': 'dashboard',
    '/clientes': 'people_outline',
    '/motoristas': 'directions_car',
    '/veiculos': 'local_shipping',
    '/rotas': 'route',
    '/pedidos': 'assignment',
    '/manutencoes': 'build',
    '/usuarios': 'manage_accounts',
    '/configuracoes': 'settings',
    '/logs': 'format_list_bulleted',
};

// -------------------------------------------------------------------
// SIMULAÇÃO DE SERVIÇOS DE AUTENTICAÇÃO (AuthService.js)
// Essas funções precisam ser substituídas pela sua lógica real de back-end/Firebase.
// O papel mockado define qual menu será exibido.
// -------------------------------------------------------------------

// SIMULAÇÃO: O usuário logado é um Administrador
const MOCK_USER = {
    id: localStorage.getItem('iduser'),
    nome: localStorage.getItem('username'),
    role: 'Administrador' // Mude para 'Motorista' ou 'Cliente' para testar
};



function isAuthenticated() {
    if (!localStorage.getItem('authToken')) {
        return false;
    }
    return true; // Simula que o token é válido
}

function getUserData() {
    return MOCK_USER;
}

function logout() {
    console.log("Logout simulado. Redirecionando para login.html...");
    // Em uma aplicação real: limpar token, limpar dados do usuário
    // window.location.href = 'login.html'; 
    alert('Logout realizado com sucesso! (Simulação)');

    localStorage.clear();
    window.location.href = 'login.html';
}

// -------------------------------------------------------------------
// LÓGICA PRINCIPAL (Seu main.js adaptado)
// -------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 1. VERIFICA AUTENTICAÇÃO
    // Se não estiver autenticado, volta para a tela de login

    

    if (!isAuthenticated()) {
        // Como não temos a tela de login, apenas logamos
        console.warn('Usuário não autenticado. Redirecionamento para login.html desativado.');
        window.location.href = 'login.html';
        return;
    }

    // 2. ELEMENTOS DO DOM
    const appContainer = document.getElementById('app-container');
    const menuToggle = document.getElementById('menu-toggle');
    const closeMenuToggle = document.getElementById('close-menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const userNameSpan = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-button');
    const pageTitleEl = document.getElementById('page-title');
    
    // 3. OBTÉM DADOS DO USUÁRIO
    const user = getUserData();
    
    if (user) {
        // Atualiza o nome de usuário no cabeçalho
        userNameSpan.textContent = `Olá, ${user.nome} (${user.role})`;
        // Atualiza a role na página inicial (para demonstração)
        const currentRoleEl = document.getElementById('current-role');
        if (currentRoleEl) currentRoleEl.textContent = user.role;
    }

    // 4. LÓGICA DO MENU
    
    // Toggle para desktop (colapsar)
    menuToggle.addEventListener('click', () => {
        // No mobile, apenas abre/fecha
        if (window.innerWidth < 1024) {
            const sidebar = document.getElementById('sidebar');
            appContainer.classList.toggle('open-mobile-menu'); // Classe auxiliar para mobile
            sidebar.classList.toggle('sidebar-hidden-mobile');
            sidebar.classList.toggle('open');
        } else {
            // No desktop, alterna a classe 'sidebar-collapsed'
            appContainer.classList.toggle('sidebar-collapsed');
        }
    });

    // Fechar menu (para mobile, usando o X)
    closeMenuToggle.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.add('sidebar-hidden-mobile');
        sidebar.classList.remove('open');
        appContainer.classList.remove('open-mobile-menu');
    });


    logoutButton.addEventListener('click', () => {
        logout(); // Função simulada acima
    });

    // 5. CONSTRUÇÃO DA NAVEGAÇÃO
    const menuItems = [
        { text: 'Dashboard', path: '/', default: true, roles: ['Administrador', 'Motorista', 'Cliente'] },
        { text: 'Clientes', path: '/clientes', roles: ['Administrador'] },
        { text: 'Motoristas', path: '/motoristas', roles: ['Administrador'] },
        { text: 'Veículos', path: '/veiculos', roles: ['Administrador'] },
        { text: 'Rotas', path: '/rotas', roles: ['Administrador', 'Motorista'] },
        { text: 'Pedidos', path: '/pedidos', roles: ['Administrador', 'Cliente'] },
        { text: 'Manutenções', path: '/manutencoes', roles: ['Administrador'] },
        { text: 'Usuários', path: '/usuarios', roles: ['Administrador'] },
        { text: 'Configurações', path: '/configuracoes', roles: ['Administrador'] },
        { text: 'Logs', path: '/logs', roles: ['Administrador'] },
    ];

    const userRole = user?.role || '';
    const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

    const renderNav = (items) => {
        mainNav.innerHTML = ''; // Limpa o menu
        items.forEach(item => {
            const iconName = ICON_MAP[item.path] || 'circle'; // Fallback icon
            const linkEl = document.createElement('a');
            
            // Define a URL baseada na rota (usando hash para simular rotas)
            linkEl.href = item.path === '/' ? '#' : `#${item.path}`;
            
            // Aplica classes do Tailwind e a classe de roteamento
            linkEl.className = `nav-link flex items-center p-3 rounded-lg text-gray-200 hover:bg-primary-blue hover:text-white transition-colors`;
            linkEl.dataset.path = item.path; // Usamos data-path para identificar a rota

            linkEl.innerHTML = `
                <span class="material-icons-outlined mr-4">${iconName}</span>
                <span class="font-medium">${item.text}</span>
            `;
            mainNav.appendChild(linkEl);
        });
    };
    
    renderNav(filteredMenuItems);

    // 6. LÓGICA DE ROTEAMENTO (Simulação de router.js)
    const handleRouting = (path) => {
        const pageInfo = filteredMenuItems.find(item => item.path === path);
        const pageName = pageInfo ? pageInfo.text : 'Página Desconhecida';
        
        // Remove 'active' de todos os links e adiciona ao link atual
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.path === path) {
                link.classList.add('active');
            }
        });
        
        // Atualiza o título do cabeçalho
        pageTitleEl.textContent = pageName;

        // Esconde todo o conteúdo
        document.querySelectorAll('.page-content').forEach(content => {
            content.classList.add('hidden');
        });
        
        // Mostra o conteúdo da página ou o placeholder
        // Converte o nome da página para um ID válido (ex: "Gestão de Rotas" -> "content-gestaoderotas")
        const contentId = `content-${pageName.toLowerCase().replace(/[\sáéíóúãõç]/g, '').replace(/[^a-z0-9]/g, '')}`;
        const specificContent = document.getElementById(contentId);
        const placeholderContent = document.getElementById('content-placeholder');
        
        if (path === '/') {
            document.getElementById('content-dashboard').classList.remove('hidden');
        } else if (specificContent) {
            specificContent.classList.remove('hidden');
        } else {
            // Mostra o placeholder para páginas não implementadas
            document.getElementById('placeholder-title').textContent = pageName;
            document.getElementById('placeholder-name').textContent = pageName;
            placeholderContent.classList.remove('hidden');
        }
        
        // Fecha o menu lateral no mobile após a navegação
        if (window.innerWidth < 1024) {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.add('sidebar-hidden-mobile');
            sidebar.classList.remove('open');
            appContainer.classList.remove('open-mobile-menu');
        }
    };
    
    // Event Listener para a navegação do menu
    mainNav.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-link');
        if (link) {
            e.preventDefault();
            handleRouting(link.dataset.path);
        }
    });

    // Lógica de hashchange para simular o roteador
    const currentPath = window.location.hash.slice(1) || '/';
    handleRouting(currentPath);
    window.addEventListener('hashchange', () => {
        const newPath = window.location.hash.slice(1) || '/';
        handleRouting(newPath);
    });
});