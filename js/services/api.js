export const API_BASE_URL = 'https://localhost:7188/api';

// Funções auxiliares para chamadas de API
export async function fetchWrapper(url, options = {}) {
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
        let errorData;
        try {
            // Tenta primeiro como JSON, que é o formato mais comum para erros estruturados
            errorData = await response.json();
        } catch (jsonError) {
            // Se falhar, lê como texto. Útil para BadRequests que retornam só uma string.
            const errorText = await response.text();
            errorData = { message: errorText || response.statusText };
        }
        throw { status: response.status, data: errorData };
    }

    // Retorna a resposta bruta se não houver conteúdo
    if (response.status === 204) {
        return;
    }
    
    return response.json();
}
