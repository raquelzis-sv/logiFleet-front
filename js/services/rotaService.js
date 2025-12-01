// Funções para interagir com a API de Rotas

const rotaService = {
    async getRotas() {
        return await fetchWrapper(`${API_BASE_URL}/rota`, {
            method: 'GET',
        });
    },

    async getRotaById(id) {
        return await fetchWrapper(`${API_BASE_URL}/rota/${id}`, {
            method: 'GET',
        });
    },

    async createRota(rotaRequest) {
        // rotaRequest should be an object like:
        // { veiculoId: 1, motoristaId: 1, pedidosIds: [1, 2, 3] }
        return await fetchWrapper(`${API_BASE_URL}/rota`, {
            method: 'POST',
            body: JSON.stringify(rotaRequest),
        });
    },

    async updateRota(id, rotaData) {
        return await fetchWrapper(`${API_BASE_URL}/rota/${id}`, {
            method: 'PUT',
            body: JSON.stringify(rotaData),
        });
    },

    async deleteRota(id) {
        return await fetchWrapper(`${API_BASE_URL}/rota/${id}`, {
            method: 'DELETE',
        });
    },

    async marcarPedidoComoEntregue(rotaId, pedidoId) {
        return await fetchWrapper(`${API_BASE_URL}/rota/${rotaId}/pedidos/${pedidoId}/entregar`, {
            method: 'PUT'
        });
    }
};
