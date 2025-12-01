// Funções para interagir com a API de Clientes

const clienteService = {
    async getClientes() {
        return await fetchWrapper(`${API_BASE_URL}/cliente`, {
            method: 'GET',
        });
    },

    async getClienteById(id) {
        return await fetchWrapper(`${API_BASE_URL}/cliente/${id}`, {
            method: 'GET',
        });
    },

    async createCliente(clienteData) {
        return await fetchWrapper(`${API_BASE_URL}/cliente`, {
            method: 'POST',
            body: JSON.stringify(clienteData),
        });
    },

    async updateCliente(id, clienteData) {
        return await fetchWrapper(`${API_BASE_URL}/cliente/${id}`, {
            method: 'PUT',
            body: JSON.stringify(clienteData),
        });
    },

    async deleteCliente(id) {
        return await fetchWrapper(`${API_BASE_URL}/cliente/${id}`, {
            method: 'DELETE',
        });
    }
};
