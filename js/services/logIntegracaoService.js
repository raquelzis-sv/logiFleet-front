import { fetchWrapper, API_BASE_URL } from './api.js';

const LOGS_BASE_URL = `${API_BASE_URL}/logintegracao`;

export async function getAll(options = {}) {
    return await fetchWrapper(LOGS_BASE_URL, options);
}
