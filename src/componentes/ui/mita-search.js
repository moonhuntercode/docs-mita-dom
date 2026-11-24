import { MitaElement } from '../../utils/MitaElement.js';
import { SearchEngine } from '../../utils/SearchEngine.js';
import { navegarA } from 'mita-dom';
import htmlTemplate from './mita-search.html?raw';
import './mita-search.css';

export class MitaSearch extends MitaElement {
  constructor() {
    super();
    this.motorBusqueda = null;
    this._promesaMotor = null;
    this.debounceTimer = null;
    this.filtroActivo = 'all';
  }

  /**
   * ⚡ Carga diferida (Code Splitting) del índice de documentación Markdown.
   * Evita incluir ~380 KB de documentos en el bundle inicial `index.js`.
   */
  async asegurarMotorBusqueda() {
    if (this.motorBusqueda) return this.motorBusqueda;
    if (!this._promesaMotor) {
      this._promesaMotor = import('../mita-docs/docsRegistry.js').then(({ DOCS_MAP }) => {
        this.motorBusqueda = new SearchEngine(DOCS_MAP);
        return this.motorBusqueda;
      });
    }
    return this._promesaMotor;
  }

  async render() {
    this.innerHTML = htmlTemplate;
    this.iniciarLogica();
  }

  iniciarLogica() {
    this.$wrapper = this.querySelector('#search-wrapper');
    this.$input = this.querySelector('#search-input');
    this.$dropdown = this.querySelector('#search-dropdown');
    this.$results = this.querySelector('#search-results');
    this.$filters = this.querySelectorAll('.filter-tag');
    this.$btnClose = this.querySelector('#search-close-btn');

    if (this.$btnClose) {
      this.$btnClose.addEventListener('click', () => {
        this.$btnClose.textContent = 'Cerrando...';
        setTimeout(() => {
          this.cerrarDropdown();
          this.$btnClose.textContent = 'Cerrar ✕';
          this.$input.blur();
        }, 150);
      });
    }

    this.$input.addEventListener('focus', () => {
      this.$wrapper.classList.add('is-focused');
      this.abrirDropdown();
      // Precargamos el índice al enfocar para que el primer tecleo sea instantáneo
      this.asegurarMotorBusqueda().catch(() => {});
    });

    const onDocMouseDown = (e) => {
      if (!this.contains(e.target)) {
        this.cerrarDropdown();
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    this.registrarLimpieza(() => document.removeEventListener('mousedown', onDocMouseDown));

    const onWindowKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.$input.focus();
      }
      if (e.key === 'Escape') {
        this.cerrarDropdown();
        this.$input.blur();
      }
    };
    window.addEventListener('keydown', onWindowKeyDown);
    this.registrarLimpieza(() => window.removeEventListener('keydown', onWindowKeyDown));

    this.$input.addEventListener('input', (e) => {
      const valor = e.target.value;

      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.realizarBusqueda(valor);
      }, 300);
    });
    this.registrarLimpieza(() => clearTimeout(this.debounceTimer));

    this.$input.addEventListener('search', (e) => {
      if (!e.target.value) {
        this.realizarBusqueda('');
      }
    });

    this.$filters.forEach((tag) => {
      tag.addEventListener('click', (e) => {
        this.$filters.forEach((f) => f.classList.remove('active'));
        e.target.classList.add('active');
        this.filtroActivo = e.target.dataset.filter;
        this.realizarBusqueda(this.$input.value);
        this.$input.focus();
      });
    });
  }

  abrirDropdown() {
    this.$dropdown.style.display = 'flex';
    if (!this.$input.value) {
      this.$results.innerHTML = '<p class="search-empty">Empieza a escribir para buscar...</p>';
    } else {
      this.realizarBusqueda(this.$input.value);
    }
  }

  cerrarDropdown() {
    this.$dropdown.style.display = 'none';
    this.$wrapper.classList.remove('is-focused');
  }

  async realizarBusqueda(query) {
    if (!query || query.trim().length < 2) {
      this.$results.innerHTML = '<p class="search-empty">Empieza a escribir para buscar...</p>';
      return;
    }

    if (!this.motorBusqueda) {
      this.$results.innerHTML = '<p class="search-empty">⏳ Cargando índice de documentación...</p>';
    }

    const motor = await this.asegurarMotorBusqueda();
    const todosLosResultados = motor.buscar(query);

    const resultados = todosLosResultados.filter((res) => {
      if (this.filtroActivo === 'all') return true;
      return res.categoria === this.filtroActivo;
    });

    if (resultados.length === 0) {
      this.$results.innerHTML = `<p class="search-empty">No se encontraron resultados para "${query}" en esta categoría.</p>`;
      return;
    }

    const fragmento = document.createDocumentFragment();

    resultados.forEach((res) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'search-result-item';
      btn.innerHTML = `
        <span class="search-result-title">📄 ${res.titulo}</span>
        <span class="search-result-snippet">${res.extracto}</span>
      `;

      btn.addEventListener('click', () => {
        this.cerrarDropdown();
        navegarA('/docs/' + res.idDoc);
      });

      fragmento.appendChild(btn);
    });

    this.$results.innerHTML = '';
    this.$results.appendChild(fragmento);
  }
}

if (!customElements.get('mita-search')) {
  customElements.define('mita-search', MitaSearch);
}
