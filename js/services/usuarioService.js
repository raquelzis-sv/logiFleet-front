// Funções para interagir com a API de Usuários

const usuarioService = {
    async getUsuarios() {
        return await fetchWrapper(`${API_BASE_URL}/usuario`, {
            method: 'GET',
        });
    },

    async getUsuarioById(id) {
        return await fetchWrapper(`${API_BASE_URL}/usuario/${id}`, {
            method: 'GET',
        });
    },

    async createUsuario(usuarioData) {
        return await fetchWrapper(`${API_BASE_URL}/usuario`, {
            method: 'POST',
            body: JSON.stringify(usuarioData),
        });
    },

    async updateUsuario(id, usuarioData) {
        return await fetchWrapper(`${API_BASE_URL}/usuario/${id}`, {
            method: 'PUT',
            body: JSON.stringify(usuarioData),
        });
    },

    async deleteUsuario(id) {
        return await fetchWrapper(`${API_BASE_URL}/usuario/${id}`, {
            method: 'DELETE',
        });
    }
};
