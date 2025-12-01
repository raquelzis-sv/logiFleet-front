document.addEventListener('DOMContentLoaded', () => {
    // Se o usuário já estiver autenticado, redireciona para o dashboard
    if (isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const errorMessageDiv = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const email = emailInput.value;
        const password = passwordInput.value;

        // Desabilita o botão e mostra estado de carregamento
        loginButton.disabled = true;
        loginButton.textContent = 'Entrando...';
        errorMessageDiv.style.display = 'none';
        errorMessageDiv.textContent = '';

        try {
            // A função login em authService já redireciona em caso de sucesso
            await login(email, password);
        } catch (error) {
            // Mostra a mensagem de erro
            errorMessageDiv.textContent = error.message;
            errorMessageDiv.style.display = 'block';

            // Reabilita o botão
            loginButton.disabled = false;
            loginButton.textContent = 'Entrar';
        }
    });
});
