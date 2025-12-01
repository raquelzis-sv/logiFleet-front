// Funções para interagir com a API de Veículos

const veiculoService = {
    async getVeiculos() {
        return await fetchWrapper(`${API_BASE_URL}/veiculo`, {
            method: 'GET',
        });
    },

    async getVeiculosDisponiveis() {
        return await fetchWrapper(`${API_BASE_URL}/veiculo/DisponiveisParaRota`, {
            method: 'GET',
        });
    },

    async getVeiculoById(id) {
        return await fetchWrapper(`${API_BASE_URL}/veiculo/${id}`, {
            method: 'GET',
        });
    },

    async createVeiculo(veiculoData) {
        return await fetchWrapper(`${API_BASE_URL}/veiculo`, {
            method: 'POST',
            body: JSON.stringify(veiculoData),
        });
    },

    async updateVeiculo(id, veiculoData) {
        return await fetchWrapper(`${API_BASE_URL}/veiculo/${id}`, {
            method: 'PUT',
            body: JSON.stringify(veiculoData),
        });
    },

    async deleteVeiculo(id) {
        return await fetchWrapper(`${API_BASE_URL}/veiculo/${id}`, {
            method: 'DELETE',
        });
    }
};
