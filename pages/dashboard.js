// Função de inicialização para a página de dashboard
function initDashboardPage() {
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