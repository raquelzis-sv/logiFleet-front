import { fetchWrapper, API_BASE_URL } from './api.js';

const MANUTENCAO_BASE_URL = `${API_BASE_URL}/manutencao`;

export async function getAll(options = {}) {
    return await fetchWrapper(MANUTENCAO_BASE_URL, options);
}

export async function getById(id, options = {}) {
    return await fetchWrapper(`${MANUTENCAO_BASE_URL}/${id}`, options);
}

export async function create(manutencaoData, options = {}) {
    return await fetchWrapper(MANUTENCAO_BASE_URL, {
        method: 'POST',
        body: JSON.stringify(manutencaoData),
        ...options
    });
}

// A função de update não existia, mas é padrão. Adicionando.
export async function update(id, manutencaoData, options = {}) {
    return await fetchWrapper(`${MANUTENCAO_BASE_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(manutencaoData),
        ...options
    });
}

export async function finalizarManutencao(id, finalizacaoData, options = {}) {
    return await fetchWrapper(`${MANUTENCAO_BASE_URL}/${id}/Finalizar`, {
        method: 'PUT',
        body: JSON.stringify(finalizacaoData),
        ...options
    });
}

export async function remove(id, options = {}) {
    return await fetchWrapper(`${MANUTENCAO_BASE_URL}/${id}`, {
        method: 'DELETE',
        ...options
    });
}
