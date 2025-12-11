import { fetchWrapper, API_BASE_URL } from './api.js';

const PEDIDOS_BASE_URL = `${API_BASE_URL}/pedido`;

export async function getAll(options = {}) {
    return await fetchWrapper(PEDIDOS_BASE_URL, options);
}

export async function getQuantidade(options = {}) {
    const pedidos = await getAll(options);
    return pedidos.length;
}

export async function getPedidosPendentes(options = {}) {
    return await fetchWrapper(`${PEDIDOS_BASE_URL}/pendentes`, options);
}

export async function getMeusPedidos(options = {}) {
    return await fetchWrapper(`${PEDIDOS_BASE_URL}/meus-pedidos`, options);
}

export async function getById(id, options = {}) {
    return await fetchWrapper(`${PEDIDOS_BASE_URL}/${id}`, options);
}

export async function create(pedidoData, options = {}) {
    return await fetchWrapper(PEDIDOS_BASE_URL, {
        method: 'POST',
        body: JSON.stringify(pedidoData),
        ...options
    });
}

export async function update(id, pedidoData, options = {}) {
    return await fetchWrapper(`${PEDIDOS_BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(pedidoData),
        ...options
    });
}

export async function remove(id, options = {}) {
    return await fetchWrapper(`${PEDIDOS_BASE_URL}/${id}`, {
        method: 'DELETE',
        ...options
    });
}
