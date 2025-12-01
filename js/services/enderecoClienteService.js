// Funções para interagir com a API de Endereços de Clientes

const enderecoClienteService = {
    // Retorna endereços, opcionalmente filtrando por clienteId
    async getEnderecos(clienteId = null) {
        let url = `${API_BASE_URL}/EnderecoClientes`;
        if (clienteId) {
            url += `?clienteId=${clienteId}`;
        }
        return await fetchWrapper(url, {
            method: 'GET',
        });
    },

    async getEnderecoById(id) {
        return await fetchWrapper(`${API_BASE_URL}/EnderecoClientes/${id}`, {
            method: 'GET',
        });
    },

    async createEndereco(enderecoData) {
        return await fetchWrapper(`${API_BASE_URL}/EnderecoClientes`, {
            method: 'POST',
            body: JSON.stringify(enderecoData),
        });
    },

    async updateEndereco(id, enderecoData) {
        return await fetchWrapper(`${API_BASE_URL}/EnderecoClientes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(enderecoData),
        });
    },

    async deleteEndereco(id) {
        return await fetchWrapper(`${API_BASE_URL}/EnderecoClientes/${id}`, {
            method: 'DELETE',
        });
    }
};
