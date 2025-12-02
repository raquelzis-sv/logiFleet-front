// Logs de Integração é uma tela de apenas leitura
import * as logIntegracaoService from '../js/services/logIntegracaoService.js';

function initLogsPage() {
    const tableBody = document.getElementById('logs-table-body');

    function renderTable(logs) {
        tableBody.innerHTML = '';
        if (!logs || logs.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum log encontrado.</td></tr>';
            return;
        }
        logs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${log.id}</td>
                <td>${log.apiNome}</td>
                <td>${log.endpoint}</td>
                <td>${new Date(log.dataHora).toLocaleString()}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    async function loadLogs() {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Carregando...</td></tr>';
        try {
            const logs = await logIntegracaoService.getAll();
            renderTable(logs);
        } catch (error) {
            console.error('Erro ao carregar logs:', error);
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Erro ao carregar os dados.</td></tr>';
        }
    }

    loadLogs();

    const destroy = () => {
        console.log("Limpando página de logs.");
    };
    return destroy;
}
window.initLogsPage = initLogsPage;