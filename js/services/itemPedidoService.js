import { fetchWrapper, API_BASE_URL } from './api.js';

// Funções para interagir com a API de Itens de Pedido

export async function getAll(pedidoId, options = {}) {
    return await fetchWrapper(`${API_BASE_URL}/itempedido/pedido/${pedidoId}`, {
        method: 'GET',
        ...options
    });
}

export async function getById(id, options = {}) {
    return await fetchWrapper(`${API_BASE_URL}/itempedido/${id}`, {
        method: 'GET',
        ...options
    });
}

export async function create(itemData, options = {}) {
    return await fetchWrapper(`${API_BASE_URL}/itempedido`, {
        method: 'POST',
        body: JSON.stringify(itemData),
        ...options
    });
}

export async function update(id, itemData, options = {}) {
    return await fetchWrapper(`${API_BASE_URL}/itempedido/${id}`, {
        method: 'PUT',
        body: JSON.stringify(itemData),
        ...options
    });
}

export async function remove(id, options = {}) {
    return await fetchWrapper(`${API_BASE_URL}/itempedido/${id}`, {
        method: 'DELETE',
        ...options
    });
}
