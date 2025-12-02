import { fetchWrapper, API_BASE_URL } from './api.js';

const CONFIG_BASE_URL = `${API_BASE_URL}/configuracaosistema`;

export async function getAll(options = {}) {
    return await fetchWrapper(CONFIG_BASE_URL, options);
}

export async function getById(id, options = {}) {
    return await fetchWrapper(`${CONFIG_BASE_URL}/${id}`, options);
}

export async function create(configuracaoData, options = {}) {
    return await fetchWrapper(CONFIG_BASE_URL, {
        method: 'POST',
        body: JSON.stringify(configuracaoData),
        ...options
    });
}

export async function update(id, configuracaoData, options = {}) {
    return await fetchWrapper(`${CONFIG_BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(configuracaoData),
        ...options
    });
}

export async function remove(id, options = {}) {
    return await fetchWrapper(`${CONFIG_BASE_URL}/${id}`, {
        method: 'DELETE',
        ...options
    });
}
