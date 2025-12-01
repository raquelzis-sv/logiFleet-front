// Funções para interagir com a API de Motoristas

const motoristaService = {
    async getMotoristas() {
        return await fetchWrapper(`${API_BASE_URL}/motorista`, {
            method: 'GET',
        });
    },

    async getMotoristaById(id) {
        return await fetchWrapper(`${API_BASE_URL}/motorista/${id}`, {
            method: 'GET',
        });
    },

    async createMotorista(motoristaData) {
        return await fetchWrapper(`${API_BASE_URL}/motorista`, {
            method: 'POST',
            body: JSON.stringify(motoristaData),
        });
    },

    async updateMotorista(id, motoristaData) {
        return await fetchWrapper(`${API_BASE_URL}/motorista/${id}`, {
            method: 'PUT',
            body: JSON.stringify(motoristaData),
        });
    },

    async deleteMotorista(id) {
        return await fetchWrapper(`${API_BASE_URL}/motorista/${id}`, {
            method: 'DELETE',
        });
    }
};
