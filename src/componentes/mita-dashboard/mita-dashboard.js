// @ts-check
import html from './mita-dashboard.html?raw';
import css from './mita-dashboard.css?raw';
import { MitaElement } from '../../utils/MitaElement.js';
import { telemetryStore, limpiarTelemetria, eliminarLog } from '../../store/telemetryStore.js';

class MitaDashboard extends MitaElement {
    constructor() {
        super();
        this.filtroActual = 'ALL';
    }

    async render() {
        if (!this.shadowRoot) {
            this.attachShadow({ mode: 'open' });
        }
        this.shadowRoot.innerHTML = `<style>${css}</style>${html}`;
        
        this.renderizarLogs();
        this.configurarEventos();

        // Suscribir a los cambios en vivo del Store de Telemetría
        if (!this.suscripcion) {
            this.suscripcion = telemetryStore.suscribir(() => {
                this.renderizarLogs();
            });
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback?.();
        if (this.suscripcion) this.suscripcion();
    }

    configurarEventos() {
        this.shadowRoot.querySelectorAll('.btn-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.shadowRoot.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const id = e.target.id;
                if (id === 'btn-filter-all') this.filtroActual = 'ALL';
                if (id === 'btn-filter-error') this.filtroActual = 'ERROR';
                if (id === 'btn-filter-warn') this.filtroActual = 'WARN';
                if (id === 'btn-filter-info') this.filtroActual = 'INFO';
                
                this.renderizarLogs();
            });
        });

        this.shadowRoot.getElementById('btn-clear').addEventListener('click', async () => {
            await limpiarTelemetria();
            this.renderizarLogs();
        });

        // Event Delegation para los botones dentro de la lista de logs
        this.shadowRoot.getElementById('logs-list').addEventListener('click', async (e) => {
            const target = e.target;
            const logItem = target.closest('.log-item');
            if (!logItem) return;

            const idLocal = logItem.dataset.id;

            if (target.classList.contains('btn-copy')) {
                const logData = telemetryStore.get().logs.find(l => l.idLocal === idLocal);
                if (logData) {
                    const textToCopy = `[${logData.timestamp}] ${logData.nivel}\nURL: ${logData.url}\nMensaje: ${logData.mensaje}\n${logData.stackTrace ? 'Stack Trace:\n' + logData.stackTrace : ''}`;
                    await navigator.clipboard.writeText(textToCopy);
                    const originalText = target.textContent;
                    target.textContent = '✅ Copiado!';
                    setTimeout(() => target.textContent = originalText, 2000);
                }
            } else if (target.classList.contains('btn-delete')) {
                await eliminarLog(idLocal);
            }
        });
    }

    renderizarLogs() {
        const estado = telemetryStore.get();
        const logsList = this.shadowRoot.getElementById('logs-list');
        logsList.innerHTML = '';

        const logsFiltrados = this.filtroActual === 'ALL' 
            ? estado.logs 
            : estado.logs.filter(log => log.nivel === this.filtroActual);

        if (logsFiltrados.length === 0) {
            logsList.innerHTML = '<li class="log-item" style="text-align:center; opacity:0.5;">No hay logs para mostrar.</li>';
            return;
        }

        logsFiltrados.forEach(log => {
            const li = document.createElement('li');
            li.className = `log-item ${log.nivel}`;
            li.dataset.id = log.idLocal;
            
            const time = new Date(log.timestamp).toLocaleTimeString();
            const routeLink = log.url ? `<a href="${new URL(log.url).pathname}" target="_blank" class="log-link">${new URL(log.url).pathname}</a>` : '/';
            
            let stackHtml = '';
            if (log.stackTrace) {
                stackHtml = `
                    <details class="log-details">
                        <summary>Ver Stacktrace completo</summary>
                        <pre class="log-stack"><code>${log.stackTrace.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                    </details>
                `;
            }

            li.innerHTML = `
                <div class="log-header">
                    <span>${log.nivel} - ${time}</span>
                    <span style="font-size: 0.8rem;">Enlace: ${routeLink}</span>
                </div>
                <div class="log-msg">${log.mensaje}</div>
                ${stackHtml}
                <div class="log-actions">
                    <button class="btn-copy">📋 Copiar a Portapapeles</button>
                    <button class="btn-delete">🗑️ Eliminar</button>
                </div>
            `;
            logsList.appendChild(li);
        });
    }
}

customElements.define('mita-dashboard', MitaDashboard);
