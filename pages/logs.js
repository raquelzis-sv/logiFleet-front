function initLogsPage() {
    console.log('[Logs] initLogsPage started.');

    const tableBody = document.querySelector('#logs-table tbody');

    if (!tableBody) {
        console.error('[Logs] Tabela de logs não encontrada.');
        return;
    }

    const loadLogs = async () => {
        try {
            const logs = await logIntegracaoService.getLogs();
            tableBody.innerHTML = '';
            if (logs.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum log encontrado.</td></tr>';
                return;
            }
            // Ordena do mais recente para o mais antigo
            logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // ... (código anterior da função loadLogs)
            logs.forEach(log => {
                const row = document.createElement('tr');
                const isSuccess = log.status === 'Sucesso';
                const statusClass = isSuccess ? 'status-concluida' : 'status-falha';
                // Define o ícone com base no status
                const statusIcon = isSuccess ? 'check_circle' : 'cancel';

                row.innerHTML = `
                    <td>${log.id}</td>
                    <td>${new Date(log.timestamp).toLocaleString()}</td>
                    <td>${log.tipoIntegracao}</td>
                    <td>
                        <span class="status ${statusClass}">
                            <span class="material-icons">${statusIcon}</span> 
                            ${log.status}
                        </span>
                    </td>
                    <td><pre>${log.detalhes}</pre></td>
                `;
                tableBody.appendChild(row);
            });
            // ... (restante do código)
        } catch (error) {
            console.error('[Logs] Erro ao carregar logs:', error);
            tableBody.innerHTML = `<tr><td colspan="5">Erro ao carregar logs.</td></tr>`;
        }
    };

    loadLogs();

    return () => {
        console.log('[Logs] Destroying page...');
    };
}
