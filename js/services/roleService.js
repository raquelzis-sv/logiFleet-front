// Funções para interagir com a API de Roles (Perfis)

const roleService = {
    async getRoles() {
        return await fetchWrapper(`${API_BASE_URL}/role`, {
            method: 'GET',
        });
    }
};
