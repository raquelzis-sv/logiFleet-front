export const API_BASE_URL = 'https://localhost:7188/api';

// Funções auxiliares para chamadas de API
export async function fetchWrapper(url, options) {
    const token = localStorage.getItem('authToken');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw { status: response.status, data: errorData };
    }

    // Retorna a resposta bruta se não houver conteúdo
    if (response.status === 204) {
        return;
    }
    
    return response.json();
}
