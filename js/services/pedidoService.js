// Funções para interagir com a API de Pedidos

const pedidoService = {
    async getPedidos() {
        return await fetchWrapper(`${API_BASE_URL}/pedido`, {
            method: 'GET',
        });
    },

    async getPedidosPendentes() {
        return await fetchWrapper(`${API_BASE_URL}/pedido/pendentes`, {
            method: 'GET',
        });
    },
    
    async getPedidoById(id) {
        return await fetchWrapper(`${API_BASE_URL}/pedido/${id}`, {
            method: 'GET',
        });
    },

    async createPedido(pedidoData) {
        return await fetchWrapper(`${API_BASE_URL}/pedido`, {
            method: 'POST',
            body: JSON.stringify(pedidoData),
        });
    },

    async updatePedido(id, pedidoData) {
        return await fetchWrapper(`${API_BASE_URL}/pedido/${id}`, {
            method: 'PUT',
            body: JSON.stringify(pedidoData),
        });
    },

    async deletePedido(id) {
        return await fetchWrapper(`${API_BASE_URL}/pedido/${id}`, {
            method: 'DELETE',
        });
    }
};
