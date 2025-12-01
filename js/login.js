// URL do endpoint de login
const LOGIN_URL = "http://localhost:5011/api/Auth/login";

// Função utilitária para exibir mensagens de feedback
function showMessage(text, isError = false) {
    const messageBox = document.getElementById('messageBox');
    messageBox.innerHTML = text;
    // Remove classes de cor e ocultação para redefinir o estado
    messageBox.classList.remove('hidden', 'bg-red-100', 'text-red-800', 'bg-green-100', 'text-green-800');

    if (isError) {
        // Estilo para erro
        messageBox.classList.add('bg-red-100', 'text-red-800');
    } else {
        // Estilo para sucesso/informação
        messageBox.classList.add('bg-green-100', 'text-green-800');
    }
    messageBox.classList.remove('hidden');
}

// Função que realiza a requisição de login para o backend
async function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        showMessage("Por favor, preencha todos os campos.", true);
        return;
    }

    // Mensagem de carregamento
    showMessage("Tentando fazer login...", false); 

    // ATENÇÃO: Mudança para 'username' conforme o seu exemplo CURL
    const loginData = {
        username: email, // Usando o valor do campo 'email' do formulário como 'username' para o backend
        password: password
    };

    try {
        const response = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: {
                // Ajustando o header para corresponder ao exemplo CURL
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(loginData)
        });

        if (response.ok) {
            const data = await response.json();
            // Assumimos que o token de autenticação está no campo 'token' do JSON de resposta
            const authToken = data.token; 
            const username = data.username;
            const iduser = data.iduser;

            if (authToken) {
                // Salva o token no localStorage
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('username', username);
                localStorage.setItem('iduser', iduser);
                
                // Mensagem de sucesso antes do redirecionamento
                showMessage("Login efetuado com sucesso! Redirecionando para a página principal...", false);
                console.log("Token de autenticação salvo:", authToken);
                
                // CORREÇÃO: Redireciona usando o caminho relativo: sobe um nível (..) e entra em paginaPrincipal/
                window.location.href = 'index.html';

            } else {
                showMessage("Sucesso no login, mas o token não foi encontrado na resposta do servidor.", true);
                console.error("Token não encontrado na resposta:", data);
            }
        } else {
            // Trata falhas de autenticação (400, 401, 403) ou outros erros do servidor
            let errorText = `Erro no login: Status ${response.status}.`;
            try {
                // Tenta obter uma mensagem de erro mais detalhada do corpo da resposta (se for JSON)
                const errorData = await response.json();
                
                // Tenta exibir a mensagem do servidor ou o status
                if (errorData.message) {
                     errorText = `Falha no Login: ${errorData.message}`;
                } else if (errorData.error) {
                     errorText = `Falha no Login: ${errorData.error}`;
                } else if (response.status === 401 || response.status === 403) {
                     errorText = "Credenciais inválidas. Tente novamente.";
                }
                
            } catch (e) {
                // Ignora se a resposta não for JSON
            }
            showMessage(errorText, true);
            console.error("Falha na resposta do servidor:", response.status, errorText);
        }

    } catch (error) {
        // Trata erros de rede (CORS, servidor inalcançável, porta errada, etc.)
        showMessage(`Erro de conexão. Verifique se o backend está ativo e acessível em ${LOGIN_URL}.`, true);
        console.error("Erro de rede/fetch:", error);
    }
}

// Simula a ação de cadastro
function handleRegister() {
    showMessage("Redirecionando para a página de Cadastro...", false);
}