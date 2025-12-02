import { fetchWrapper } from '../api.js';
import { API_BASE_URL } from '../api.js';

const CLIENTES_BASE_URL = `${API_BASE_URL}/Cliente`;

export async function getAllClientes() {
    return fetchWrapper(CLIENTES_BASE_URL);
}

export async function getClienteById(id) {
    return fetchWrapper(`${CLIENTES_BASE_URL}/${id}`);
}

export async function createCliente(cliente) {
    return fetchWrapper(CLIENTES_BASE_URL, {
        method: 'POST',
        body: JSON.stringify(cliente),
    });
}

export async function updateCliente(id, cliente) {
    return fetchWrapper(`${CLIENTES_BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cliente),
    });
}

export async function deleteCliente(id) {
    return fetchWrapper(`${CLIENTES_BASE_URL}/${id}`, {
        method: 'DELETE',
    });
}