// @ts-check
import { MitaElement } from '../../utils/MitaElement.js';

const template = `
<style>
  :host {
    display: grid;
    grid-template-columns: 250px 1fr;
    min-height: 80vh;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    margin: 2rem 0;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }
  
  aside {
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
    padding: 1.5rem;
  }

  aside h3 {
    margin-top: 0;
    font-size: 1.1rem;
    color: var(--primary-color);
  }

  nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  nav li {
    margin-bottom: 0.5rem;
  }

  nav a {
    color: var(--text-color);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  nav a:hover {
    color: var(--primary-color);
  }

  main {
    background: var(--bg-primary);
    padding: 2rem;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    :host {
      grid-template-columns: 1fr;
    }
    aside {
      border-right: none;
      border-bottom: 1px solid var(--border-color);
    }
  }
</style>

<aside>
  <h3>Panel de Control</h3>
  <nav>
    <ul>
      <li><a href="/perfil" data-mita-link>Mi Perfil (Nested Route)</a></li>
      <li><a href="/admin/logs" data-mita-link>Auditoría (Guard)</a></li>
    </ul>
  </nav>
  
  <div style="margin-top: 2rem; padding: 1rem; background: var(--bg-tertiary); border-radius: 8px; font-size: 0.85rem;">
    <strong>💡 Advanced Layouts</strong><br>
    Este menú lateral está encapsulado en un <code>&lt;mita-layout-dashboard&gt;</code>. El contenido de la derecha es inyectado dinámicamente mediante un <code>&lt;slot&gt;</code> nativo. Igual que <code>+layout.svelte</code>, pero nativo.
  </div>
</aside>

<main>
  <!-- OUTLET NATIVO -->
  <slot></slot>
</main>
`;

export class MitaLayoutDashboard extends MitaElement {
  async render() {
    // Usamos attachShadow para encapsular estilos y habilitar el <slot> nativo correctamente.
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    this.shadowRoot.innerHTML = template;
  }
}

if (!customElements.get('mita-layout-dashboard')) {
  customElements.define('mita-layout-dashboard', MitaLayoutDashboard);
}
