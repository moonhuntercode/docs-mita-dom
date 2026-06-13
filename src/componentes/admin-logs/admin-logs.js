// @ts-check
import { MitaElement } from '../../utils/MitaElement.js';
import { logService } from '../../services/logService.js';
import html from './admin-logs.html?raw';
import './admin-logs.css';

export class MitaAdminLogs extends MitaElement {
  constructor() {
    super();
    this.logs = [];
    this.filtroActual = 'TODOS';
  }

  async render() {
    this.innerHTML = html;
    await this.cargarDatos();
    this.configurarFiltros();
    this.configurarBotones();
  }

  async cargarDatos() {
    this.logs = await logService.getAll();
    // Ordenar del más reciente al más antiguo
    this.logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    this.pintarTabla();
  }

  pintarTabla() {
    const $tbody = this.querySelector('#tabla-body');
    if (!$tbody) return;

    const logsFiltrados = this.logs.filter(log => {
      if (this.filtroActual === 'TODOS') return true;
      if (this.filtroActual === 'ERROR') return log.nivel === 'ERROR';
      if (this.filtroActual === 'INFO') return log.nivel === 'INFO' || log.nivel === 'WARN';
      return true;
    });

    if (logsFiltrados.length === 0) {
      $tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No hay logs registrados.</td></tr>`;
      return;
    }

    $tbody.innerHTML = logsFiltrados.map(log => `
      <tr>
        <td>${log.id}</td>
        <td class="nivel-${log.nivel}">${log.nivel}</td>
        <td>${new Date(log.timestamp).toLocaleString()}</td>
        <td>${log.mensaje}</td>
        <td><pre style="font-size: 0.8em; margin:0;">${log.datosExtra ? JSON.stringify(log.datosExtra) : '-'}</pre></td>
      </tr>
    `).join('');
  }

  configurarFiltros() {
    const botones = this.querySelectorAll('.filtros button');
    botones.forEach(btn => {
      btn.addEventListener('click', (e) => {
        botones.forEach(b => b.classList.remove('activo'));
        // @ts-ignore
        e.target.classList.add('activo');
        
        // @ts-ignore
        const id = e.target.id;
        if (id === 'btn-filtro-todos') this.filtroActual = 'TODOS';
        else if (id === 'btn-filtro-errores') this.filtroActual = 'ERROR';
        else if (id === 'btn-filtro-info') this.filtroActual = 'INFO';
        
        this.pintarTabla();
      });
    });
  }

  configurarBotones() {
    const btnLimpiar = this.querySelector('#btn-limpiar-logs');
    if (btnLimpiar) {
      btnLimpiar.addEventListener('click', async () => {
        const confirmar = window.confirm('¿Estás seguro de que quieres limpiar TODA la base de datos de logs?');
        if (confirmar) {
          const exito = await logService.clearAll();
          if (exito) {
            this.logs = [];
            this.pintarTabla();
            console.info('Logs limpiados exitosamente');
          } else {
            alert('Hubo un error al limpiar la base de datos.');
          }
        }
      });
    }
  }
}

if (!customElements.get('demo-admin-logs')) {
  customElements.define('demo-admin-logs', MitaAdminLogs);
}
