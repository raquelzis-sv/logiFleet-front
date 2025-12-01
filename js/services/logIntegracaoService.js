// Funções para interagir com a API de Logs de Integração

const logIntegracaoService = {
    async getLogs() {
        return await fetchWrapper(`${API_BASE_URL}/logintegracao`, {
            method: 'GET',
        });
    }
};
