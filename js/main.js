document.addEventListener('DOMContentLoaded', () => {
    // 1. VERIFICA AUTENTICAÇÃO
    // Se não estiver autenticado, volta para a tela de login
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Altera a classe do body para aplicar os estilos corretos
    document.body.classList.add('app-body');

    // 2. ELEMENTOS DO DOM
    const appContainer = document.getElementById('app-container');
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const userNameSpan = document.getElementById('user-name');
    const logoutButton = document.getElementById('logout-button');
    
    // 3. OBTÉM DADOS DO USUÁRIO
    const user = getUserData();
    
    if (user) {
        userNameSpan.textContent = `Olá, ${user.nome} (${user.role})`;
    }

    // 4. LÓGICA DO MENU
    menuToggle.addEventListener('click', () => {
        appContainer.classList.toggle('sidebar-collapsed');
    });

    logoutButton.addEventListener('click', () => {
        logout(); // Função do authService.js
    });

    // 5. CONSTRUÇÃO DA NAVEGAÇÃO
    const menuItems = [
        { text: 'Dashboard', path: '/', roles: ['Administrador', 'Motorista', 'Cliente'] },
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

    const navUl = document.createElement('ul');
    filteredMenuItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        // O link da raiz é '#', os outros são '#/caminho'
        a.href = item.path === '/' ? '#' : `#${item.path}`;
        a.textContent = item.text;
        li.appendChild(a);
        navUl.appendChild(li);
    });
    mainNav.appendChild(navUl);

    // O roteador (em router.js) agora tem seu próprio listener de 'load'
    // e 'hashchange', então não é mais necessário chamá-lo aqui.
});

