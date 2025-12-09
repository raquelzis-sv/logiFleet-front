import { fetchWrapper, API_BASE_URL } from './api.js';

const CLIENTES_BASE_URL = `${API_BASE_URL}/Cliente`;

export async function getAll(options = {}) {
    return fetchWrapper(CLIENTES_BASE_URL, options);
}

export async function getQuantidade(options = {}) {
    return fetchWrapper(`${CLIENTES_BASE_URL}/quantidade`, options);
}

export async function getById(id, options = {}) {
    return fetchWrapper(`${CLIENTES_BASE_URL}/${id}`, options);
}

export async function create(cliente, options = {}) {
    return fetchWrapper(CLIENTES_BASE_URL, {
        method: 'POST',
        body: JSON.stringify(cliente),
        ...options
    });
}

export async function update(id, cliente, options = {}) {
    return fetchWrapper(`${CLIENTES_BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cliente),
        ...options
    });
}

export async function remove(id, options = {}) {
    return fetchWrapper(`${CLIENTES_BASE_URL}/${id}`, {
        method: 'DELETE',
        ...options
    });
}