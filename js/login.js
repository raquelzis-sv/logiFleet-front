import * as authService from './services/authService.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const messageBox = document.getElementById('message-box');
    const loginButton = document.getElementById('login-button');

    if (!loginForm) {
        console.error("Elemento #login-form não encontrado.");
        return;
    }

    // Função utilitária para exibir mensagens de feedback
    function showMessage(text, isError = false) {
        messageBox.textContent = text;
        if (isError) {
            messageBox.className = 'error'; // Adiciona a classe de erro
        } else {
            messageBox.className = ''; // Remove classes
            messageBox.style.display = 'block'; // Garante que esteja visível se não for erro
        }
    }
    
    function hideMessage() {
        messageBox.textContent = '';
        messageBox.style.display = 'none';
        messageBox.className = '';
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o recarregamento da página

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!email || !password) {
            showMessage("Por favor, preencha todos os campos.", true);
            return;
        }

        // Desabilita o botão e mostra o carregamento
        loginButton.disabled = true;
        loginButton.textContent = 'Entrando...';
        hideMessage();

        try {
            await authService.login(email, password);
            // O redirecionamento é tratado dentro do authService.login() com sucesso.
            // Se o login falhar, o código abaixo será executado no bloco catch.
        } catch (error) {
            showMessage(error.message || 'Erro desconhecido durante o login.', true);
            console.error("Erro no login:", error);
        } finally {
            // Reabilita o botão em caso de falha
            loginButton.disabled = false;
            loginButton.textContent = 'Entrar';
        }
    });
});