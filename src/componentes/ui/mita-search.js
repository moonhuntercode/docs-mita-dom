import { MitaElement } from '../../utils/MitaElement.js';
import { SearchEngine } from '../../utils/SearchEngine.js';
import { navegarA } from 'mita-dom';
import htmlTemplate from './mita-search.html?raw';
import './mita-search.css';
import { DOCS_MAP } from '../mita-docs/docsRegistry.js';

export class MitaSearch extends MitaElement {
  constructor() {
    super();
    this.motorBusqueda = new SearchEngine(DOCS_MAP);
    this.debounceTimer = null;
    this.filtroActivo = 'all';
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

    // Manejar Cierre Explicito
    if (this.$btnClose) {
      this.$btnClose.addEventListener('click', () => {
        this.$btnClose.textContent = "Cerrando...";
        setTimeout(() => {
          this.cerrarDropdown();
          this.$btnClose.textContent = "Cerrar ✕";
          this.$input.blur();
        }, 150);
      });
    }

    // Manejar Focus / Blur
    this.$input.addEventListener('focus', () => {
      this.$wrapper.classList.add('is-focused');
      this.abrirDropdown();
    });

    // Usar mousedown en document para detectar clics fuera del buscador
    document.addEventListener('mousedown', (e) => {
      if (!this.contains(e.target)) {
        this.cerrarDropdown();
      }
    });

    // Escuchar atajo global Ctrl+K
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.$input.focus();
      }
      if (e.key === 'Escape') {
        this.cerrarDropdown();
        this.$input.blur();
      }
    });

    // Escuchar input con debounce
    this.$input.addEventListener('input', (e) => {
      const valor = e.target.value;
      
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.realizarBusqueda(valor);
      }, 300);
    });

    // Escuchar cuando el usuario borra todo usando la X nativa del input[type="search"]
    this.$input.addEventListener('search', (e) => {
      if (!e.target.value) {
        this.realizarBusqueda('');
      }
    });

    // Filtros Rápidos
    this.$filters.forEach(tag => {
      tag.addEventListener('click', (e) => {
        this.$filters.forEach(f => f.classList.remove('active'));
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
      this.$results.innerHTML = '<div class="search-empty">Empieza a escribir para buscar...</div>';
    } else {
      this.realizarBusqueda(this.$input.value);
    }
  }

  cerrarDropdown() {
    this.$dropdown.style.display = 'none';
    this.$wrapper.classList.remove('is-focused');
  }

  realizarBusqueda(query) {
    if (!query || query.trim().length < 2) {
      this.$results.innerHTML = '<div class="search-empty">Empieza a escribir para buscar...</div>';
      return;
    }

    const todosLosResultados = this.motorBusqueda.buscar(query);
    
    // Aplicar filtro si no es 'all'
    const resultados = todosLosResultados.filter(res => {
      if (this.filtroActivo === 'all') return true;
      return res.categoria === this.filtroActivo;
    });

    if (resultados.length === 0) {
      this.$results.innerHTML = '<div class="search-empty">No se encontraron resultados para "' + query + '" en esta categoría.</div>';
      return;
    }

    // Renderizar resultados
    const fragmento = document.createDocumentFragment();
    
    resultados.forEach(res => {
      const btn = document.createElement('button');
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

// Registrar el Custom Element
customElements.define('mita-search', MitaSearch);
