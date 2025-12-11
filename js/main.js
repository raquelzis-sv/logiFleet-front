import * as authService from './services/authService.js';

// Mapeamento de rotas para Material Icons
const ICON_MAP = {
    '/': 'dashboard',
    '/clientes': 'people_outline',
    '/motoristas': 'directions_car',
    '/pageCliente': 'person_outline',
    '/veiculos': 'local_shipping',
    '/rotas': 'route',
    '/pedidos': 'assignment',
    '/itens-pedido': 'list_alt',
    '/manutencoes': 'build',
    '/usuarios': 'manage_accounts',
    '/configuracoes': 'settings',
    // '/logs': 'format_list_bulleted',
};

document.addEventListener('DOMContentLoaded', () => {
    // 2. ELEMENTOS DO DOM
    const appContainer = document.getElementById('app-container');
    const menuToggle = document.getElementById('menu-toggle');
    const closeMenuToggle = document.getElementById('close-menu-toggle'); // Este elemento não existe mais, mas o listener será removido.
    const mainNav = document.getElementById('main-nav');
    const userNameSpan = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-button');
    const pageTitleEl = document.getElementById('page-title');
    
    // 3. OBTÉM DADOS DO USUÁRIO
    const user = authService.getUserData();

    // Determina a role do usuário de forma segura
    let userRole = '';
    if (user && user.role) {
        if (typeof user.role === 'object' && user.role !== null && user.role.nome) {
            userRole = user.role.nome;
        } else if (typeof user.role === 'string') {
            userRole = user.role;
        }
    }
    
    if (user) {
        // Atualiza o nome de usuário no cabeçalho
        userNameSpan.textContent = `Olá, ${user.nome} (${userRole})`;
    }

    // 4. LÓGICA DO MENU
    menuToggle.addEventListener('click', () => {
        // Apenas alterna a classe no container principal. O CSS cuida da responsividade.
        appContainer.classList.toggle('sidebar-collapsed');
    });

    logoutButton.addEventListener('click', () => {
        authService.logout();
    });

    // 5. CONSTRUÇÃO DA NAVEGAÇÃO
    const menuItems = [
        { text: 'Dashboard', path: '/', default: true, roles: ['Administrador'] },
        { text: 'Clientes', path: '/clientes', roles: ['Administrador'] },
        { text: 'Motoristas', path: '/motoristas', roles: ['Administrador'] },
        { text: 'Área do Cliente', path: '/pageCliente', roles: ['Cliente'] },
        { text: 'Veiculos', path: '/veiculos', roles: ['Administrador'] },
        { text: 'Rotas', path: '/rotas', roles: ['Administrador', 'Motorista'] },
        { text: 'Pedidos', path: '/pedidos', roles: ['Administrador'] },
        { text: 'Itens', path: '/itens-pedido', roles: ['Administrador'] },
        { text: 'Manutencoes', path: '/manutencoes', roles: ['Administrador'] },
        { text: 'Usuarios', path: '/usuarios', roles: ['Administrador'] },
        { text: 'Configuracoes', path: '/configuracoes', roles: ['Administrador'] },
        // { text: 'Logs', path: '/logs', roles: ['Administrador'] },
    ];
    
    const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

    const renderNav = (items) => {
        mainNav.innerHTML = ''; // Limpa o menu
        items.forEach(item => {
            const iconName = ICON_MAP[item.path] || 'circle'; // Fallback icon
            const linkEl = document.createElement('a');
            
            // Define a URL baseada na rota (usando hash para simular rotas)
            linkEl.href = `#${item.path}`;
            
            // Aplica a classe CSS para o link de navegação
            linkEl.className = 'nav-link';

            linkEl.innerHTML = `
                <span class="material-icons-outlined">${iconName}</span>
                <span>${item.text}</span>
            `;
            mainNav.appendChild(linkEl);
        });
    };
    
    renderNav(filteredMenuItems);

    // Initial setting of page title based on current hash
    const currentPath = window.location.hash.slice(1) || '/';
    const initialPageInfo = filteredMenuItems.find(item => item.path === currentPath);
    if (initialPageInfo) {
        pageTitleEl.textContent = initialPageInfo.text;
    } else {
        pageTitleEl.textContent = 'Dashboard'; // Default title
    }

    // Handle active nav link and page title on hashchange
    window.addEventListener('hashchange', () => {
        const path = window.location.hash.slice(1) || '/';
        
        // Atualiza o link ativo
        document.querySelectorAll('.nav-link').forEach(link => {
            const linkPath = link.hash ? link.hash.slice(1) : '/';
            if (linkPath === path) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Atualiza o título da página
        const pageInfo = filteredMenuItems.find(item => item.path === path);
        if (pageInfo) {
            pageTitleEl.textContent = pageInfo.text;
        }

        // Fecha a sidebar em telas móveis ao navegar
        if (window.innerWidth <= 768) {
            appContainer.classList.add('sidebar-collapsed');
        }
    });

    // Set active class for initial load
    const initialPath = window.location.hash.slice(1) || '/';
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkPath = link.hash ? link.hash.slice(1) : '/';
        if (linkPath === initialPath) {
            link.classList.add('active');
        }
    });

    // Garante que a sidebar comece fechada em telas móveis
    if (window.innerWidth <= 768) {
        appContainer.classList.add('sidebar-collapsed');
    }
    
});