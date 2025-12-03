import { fetchWrapper, API_BASE_URL } from './api.js';

const API_URL = `${API_BASE_URL}/ItemPedido`;

export const getAll = async () => {
    return await fetchWrapper(API_URL, { method: 'GET' });
};

export const getById = async (id) => {
    return await fetchWrapper(`${API_URL}/${id}`, { method: 'GET' });
};

export const create = async (itemPedido) => {
    return await fetchWrapper(API_URL, {
        method: 'POST',
        body: JSON.stringify(itemPedido),
    });
};

export const update = async (id, itemPedido) => {
    return await fetchWrapper(`${API_URL}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(itemPedido),
    });
};

export const remove = async (id) => {
    return await fetchWrapper(`${API_URL}/${id}`, { method: 'DELETE' });
};
