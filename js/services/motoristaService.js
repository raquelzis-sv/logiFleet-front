import { fetchWrapper, API_BASE_URL } from './api.js';

const MOTORISTAS_BASE_URL = `${API_BASE_URL}/Motorista`;

export async function getAll(options = {}) {
    return fetchWrapper(MOTORISTAS_BASE_URL, options);
}

export async function getById(id, options = {}) {
    return fetchWrapper(`${MOTORISTAS_BASE_URL}/${id}`, options);
}

export async function create(motorista, options = {}) {
    return fetchWrapper(MOTORISTAS_BASE_URL, {
        method: 'POST',
        body: JSON.stringify(motorista),
        ...options
    });
}

export async function update(id, motorista, options = {}) {
    return fetchWrapper(`${MOTORISTAS_BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(motorista),
        ...options
    });
}

export async function remove(id, options = {}) {
    return fetchWrapper(`${MOTORISTAS_BASE_URL}/${id}`, {
        method: 'DELETE',
        ...options
    });
}
