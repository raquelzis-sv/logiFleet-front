import { fetchWrapper, API_BASE_URL } from './api.js';

const ROTAS_BASE_URL = `${API_BASE_URL}/rota`;

export async function getAll(options = {}) {
    return await fetchWrapper(ROTAS_BASE_URL, options);
}

export async function getQuantidade(options = {}) {
    return fetchWrapper(`${CLIENTES_BASE_URL}/quantidade`, options);
}

export async function getById(id, options = {}) {
    return await fetchWrapper(`${ROTAS_BASE_URL}/${id}`, options);
}

export async function create(rotaRequest, options = {}) {
    // rotaRequest should be an object like:
    // { veiculoId: 1, motoristaId: 1, pedidosIds: [1, 2, 3] }
    return await fetchWrapper(ROTAS_BASE_URL, {
        method: 'POST',
        body: JSON.stringify(rotaRequest),
        ...options
    });
}

export async function update(id, rotaData, options = {}) {
    return await fetchWrapper(`${ROTAS_BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(rotaData),
        ...options
    });
}

export async function remove(id, options = {}) {
    return await fetchWrapper(`${ROTAS_BASE_URL}/${id}`, {
        method: 'DELETE',
        ...options
    });
}

export async function marcarPedidoComoEntregue(rotaId, pedidoId, options = {}) {
    return await fetchWrapper(`${ROTAS_BASE_URL}/${rotaId}/pedidos/${pedidoId}/entregar`, {
        method: 'PUT',
        ...options
    });
}
