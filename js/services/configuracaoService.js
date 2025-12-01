// Funções para interagir com a API de Configurações do Sistema

const configuracaoService = {
    async getConfiguracoes() {
        return await fetchWrapper(`${API_BASE_URL}/configuracaosistema`, {
            method: 'GET',
        });
    },

    async getConfiguracaoById(id) {
        return await fetchWrapper(`${API_BASE_URL}/configuracaosistema/${id}`, {
            method: 'GET',
        });
    },

    async createConfiguracao(configuracaoData) {
        return await fetchWrapper(`${API_BASE_URL}/configuracaosistema`, {
            method: 'POST',
            body: JSON.stringify(configuracaoData),
        });
    },

    async updateConfiguracao(id, configuracaoData) {
        return await fetchWrapper(`${API_BASE_URL}/configuracaosistema/${id}`, {
            method: 'PUT',
            body: JSON.stringify(configuracaoData),
        });
    },

    async deleteConfiguracao(id) {
        return await fetchWrapper(`${API_BASE_URL}/configuracaosistema/${id}`, {
            method: 'DELETE',
        });
    }
};
