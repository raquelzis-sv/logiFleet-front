import { fetchWrapper, API_BASE_URL } from './api.js';

// Funções para interagir com a API de Veículos

export async function getAll(options = {}) {
    return await fetchWrapper(`${API_BASE_URL}/veiculo`, {
        method: 'GET',
        ...options
    });
}

export async function getQuantidade(options = {}) {
    const veiculos = await getAll(options);
    return veiculos.length;
}

export async function getVeiculosDisponiveis(options = {}) {
    return await fetchWrapper(`${API_BASE_URL}/veiculo/DisponiveisParaRota`, {
        method: 'GET',
        ...options
    });
}

export async function getById(id, options = {}) {
    return await fetchWrapper(`${API_BASE_URL}/veiculo/${id}`, {
        method: 'GET',
        ...options
    });
}

export async function create(veiculoData, options = {}) {
    return await fetchWrapper(`${API_BASE_URL}/veiculo`, {
        method: 'POST',
        body: JSON.stringify(veiculoData),
        ...options
    });
}

export async function update(id, veiculoData, options = {}) {
    return await fetchWrapper(`${API_BASE_URL}/veiculo/${id}`, {
        method: 'PUT',
        body: JSON.stringify(veiculoData),
        ...options
    });
}

export async function remove(id, options = {}) {
    return await fetchWrapper(`${API_BASE_URL}/veiculo/${id}`, {
        method: 'DELETE',
        ...options
    });
}
