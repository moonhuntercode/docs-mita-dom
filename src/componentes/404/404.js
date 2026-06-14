import { navegarA } from 'mita-dom';

export class Mita404 extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .error-404 {
          text-align: center;
          padding: 4rem 1rem;
          background: var(--color-superficie);
          border-radius: var(--borde-radio);
          border: 1px solid #ff5252;
        }
        .error-404 h2 { font-size: 3rem; color: #ff5252; margin-bottom: 1rem; }
        .error-404 p { color: var(--color-texto); font-size: 1.2rem; margin-bottom: 2rem; }
        .btn-volver {
          background: var(--color-primario);
          color: #000;
          padding: 0.8rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          font-size: 1.1rem;
        }
      </style>
      <div class="error-404">
        <h2>404</h2>
        <p>¡Vaya! Te has perdido en la galaxia. La ruta que buscas no existe.</p>
        
        <div class="demo-wrapper" style="text-align: left; margin: 2rem auto; max-width: 800px;">
          <!-- Editor de Código -->
          <mita-code-editor archivo="router.js" lenguaje="javascript">
            <pre><code>
import { rutaActual } from 'mita-dom';

// Interceptamos los cambios de la Navigation API
rutaActual.suscribir(ruta => {
  const isMatch = rutasValidas.includes(ruta);
  
  // Regla de Oro: El Catch-All (404) DEBE ser la última condición
  if (!isMatch) {
    Logger.error('Ruta no encontrada:', ruta);
    
    // Forzamos el renderizado del componente 404 de forma limpia
    $error404.style.display = 'block';
    return;
  }
});
            </code></pre>
          </mita-code-editor>
          
          <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 0 0 8px 8px; font-size: 0.95rem; border: 1px solid var(--border-color); border-top: none;">
            <p style="margin: 0;"><strong>Buenas Prácticas Frontend:</strong> Un buen componente 404 no solo muestra un error visual, sino que se asegura de <strong>no bloquear el hilo principal</strong> ni romper el historial del navegador (<code>window.history</code>). Al evaluar la ruta desconocida al <em>final</em> del router, protegemos la aplicación (Catch-All).</p>
          </div>
        </div>

        <button class="btn-volver">Volver al Inicio Seguro</button>
      </div>
    `;

    this.querySelector('.btn-volver')?.addEventListener('click', () => {
      navegarA('/');
    });
  }
}
if (!customElements.get('demo-404')) {
  customElements.define('demo-404', Mita404);
}
