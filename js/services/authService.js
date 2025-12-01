// Funções relacionadas à autenticação

async function login(email, password) {
    try {
        const data = await fetchWrapper(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.usuario));
            window.location.href = 'index.html'; // Redireciona para a página principal
        }
    } catch (error) {
        console.error('Falha no login:', error);
        // Lança o erro para que a UI possa tratá-lo
        throw new Error(error.data || 'Não foi possível fazer login. Verifique suas credenciais.');
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'login.html'; // Redireciona para a página de login
}

function getAuthToken() {
    return localStorage.getItem('authToken');
}

function getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

function isAuthenticated() {
    return !!getAuthToken();
}
