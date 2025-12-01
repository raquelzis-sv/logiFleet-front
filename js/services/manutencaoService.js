// Funções para interagir com a API de Manutenções

const manutencaoService = {
    async getManutencoes() {
        return await fetchWrapper(`${API_BASE_URL}/manutencao`, {
            method: 'GET',
        });
    },

    async getManutencaoById(id) {
        return await fetchWrapper(`${API_BASE_URL}/manutencao/${id}`, {
            method: 'GET',
        });
    },

    async createManutencao(manutencaoData) {
        return await fetchWrapper(`${API_BASE_URL}/manutencao`, {
            method: 'POST',
            body: JSON.stringify(manutencaoData),
        });
    },

    async finalizarManutencao(id, finalizacaoData) {
        return await fetchWrapper(`${API_BASE_URL}/manutencao/${id}/Finalizar`, {
            method: 'PUT',
            body: JSON.stringify(finalizacaoData),
        });
    },

    async deleteManutencao(id) {
        return await fetchWrapper(`${API_BASE_URL}/manutencao/${id}`, {
            method: 'DELETE',
        });
    }
};
