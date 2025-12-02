import { fetchWrapper, API_BASE_URL } from './api.js';

const ROLES_BASE_URL = `${API_BASE_URL}/role`;

export async function getAll(options = {}) {
    return await fetchWrapper(ROLES_BASE_URL, options);
}
