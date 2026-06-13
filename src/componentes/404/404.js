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
