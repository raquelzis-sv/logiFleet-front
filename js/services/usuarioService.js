import { fetchWrapper, API_BASE_URL } from './api.js';

const USUARIO_BASE_URL = `${API_BASE_URL}/usuario`;

export async function getAll(options = {}) {
    return await fetchWrapper(USUARIO_BASE_URL, options);
}

export async function getById(id, options = {}) {
    return await fetchWrapper(`${USUARIO_BASE_URL}/${id}`, options);
}

export async function create(usuarioData, options = {}) {
    return await fetchWrapper(USUARIO_BASE_URL, {
        method: 'POST',
        body: JSON.stringify(usuarioData),
        ...options
    });
}

export async function update(id, usuarioData, options = {}) {
    return await fetchWrapper(`${USUARIO_BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(usuarioData),
        ...options
    });
}

export async function remove(id, options = {}) {
    return await fetchWrapper(`${USUARIO_BASE_URL}/${id}`, {
        method: 'DELETE',
        ...options
    });
}

