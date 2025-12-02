import { fetchWrapper, API_BASE_URL } from './api.js';

const ENDERECOS_BASE_URL = `${API_BASE_URL}/EnderecoClientes`;

// Retorna endereços, opcionalmente filtrando por clienteId
export async function getAll(clienteId = null, options = {}) {
    let url = ENDERECOS_BASE_URL;
    if (clienteId) {
        url += `?clienteId=${clienteId}`;
    }
    return await fetchWrapper(url, options);
}

export async function getById(id, options = {}) {
    return await fetchWrapper(`${ENDERECOS_BASE_URL}/${id}`, options);
}

export async function create(enderecoData, options = {}) {
    return await fetchWrapper(ENDERECOS_BASE_URL, {
        method: 'POST',
        body: JSON.stringify(enderecoData),
        ...options
    });
}

export async function update(id, enderecoData, options = {}) {
    return await fetchWrapper(`${ENDERECOS_BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(enderecoData),
        ...options
    });
}

export async function remove(id, options = {}) {
    return await fetchWrapper(`${ENDERECOS_BASE_URL}/${id}`, {
        method: 'DELETE',
        ...options
    });
}
