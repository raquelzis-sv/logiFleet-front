// js/services/itemPedidoService.js
import { fetchWrapper } from './api.js';
const API_URL = 'https://localhost:7188/api/ItemPedido'; // Make sure the port is correct

const itemPedidoService = {
    async getItensPedido(semPedido = false) {
        let url = API_URL;
        if (semPedido) {
            url += '?semPedido=true';
        }
        return fetchWrapper(url);
    },

    async createItemPedido(itemData) {
        return fetchWrapper(API_URL, {
            method: 'POST',
            body: JSON.stringify(itemData)
        });
    },

    async deleteItemPedido(id) {
        return fetchWrapper(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
    }
};


// isso pode dar problema pq esta fora do padrao dos outros mas pode funcionar
export async function getQuantidade(options = {}) {
    return fetchWrapper(`${CLIENTES_BASE_URL}/quantidade`, options);
}

export default itemPedidoService;