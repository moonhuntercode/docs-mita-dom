// @ts-check
import { MitaElement } from '../../utils/MitaElement.js';
import { marked } from 'marked';
import { navegarA, crearGestorBitacoraPorHora } from 'mita-dom';
import { estadoPostActivo, BLOG_REGISTRY } from '../../store/blogStore.js';

import htmlTemplate from './mita-blog.html?raw';
import './mita-blog.css';

export const gestorBitacoraBlog = crearGestorBitacoraPorHora({
  nombreEstado: 'blog:copias_por_hora'
});

export class MitaBlog extends MitaElement {
  constructor() {
    super();
  }

  async render() {
    this.innerHTML = htmlTemplate;
    this.iniciarLogica();
  }

  iniciarLogica() {
    this.$index = this.querySelector('#blog-index');
    this.$container = this.querySelector('#blog-container');
    this.$btnBack = this.querySelector('#btn-back');
    this.$blogTitle = this.querySelector('#blog-title');
    this.$blogSubtitle = this.querySelector('#blog-subtitle');

    // Evento de Volver
    this.$btnBack.addEventListener('click', () => navegarA('/blog'));

    // Suscripción al estado del router/blog
    this.suscripcion = estadoPostActivo.suscribir(async (estado) => {
        if (estado.slug === 'index') {
            this.mostrarIndice();
        } else {
            await this.mostrarPost(estado.slug);
        }
    });
  }

  disconnectedCallback() {
      super.disconnectedCallback();
      if (this.suscripcion) this.suscripcion();
  }

  mostrarIndice() {
      this.$container.style.display = 'none';
      this.$btnBack.style.display = 'none';
      this.$index.style.display = 'grid';
      this.$blogTitle.textContent = '📰 MitaDOM Novedades';
      this.$blogSubtitle.textContent = 'Entérate de las últimas versiones, fixes y filosofías de la web reactiva.';
      
      this.$index.innerHTML = '';
      
      BLOG_REGISTRY.forEach(post => {
          const card = document.createElement('a');
          card.href = `/blog/${post.slug}`;
          card.className = 'blog-card';
          // Prevenimos reload para SPA routing
          card.addEventListener('click', (e) => {
              e.preventDefault();
              navegarA(card.pathname);
          });
          
          card.innerHTML = `
            <div class="blog-card-category">${post.categoria}</div>
            <h3 class="blog-card-title">${post.titulo}</h3>
            <p class="blog-card-excerpt">${post.subtitulo}</p>
            <div class="blog-card-footer">
                <span class="blog-card-date">📅 ${post.fecha}</span>
                <span class="blog-card-read">Leer artículo ➔</span>
            </div>
          `;
          this.$index.appendChild(card);
      });
  }

  async mostrarPost(slug) {
      const postInfo = BLOG_REGISTRY.find(p => p.slug === slug);
      if (!postInfo) {
          navegarA('/404');
          return;
      }

      this.$index.style.display = 'none';
      this.$container.style.display = 'block';
      this.$btnBack.style.display = 'block';
      this.$blogTitle.textContent = postInfo.titulo;
      this.$blogSubtitle.textContent = `${postInfo.categoria} • ${postInfo.fecha}`;
      
      this.$container.innerHTML = '<div class="spinner-loader" style="margin: 2rem auto;"></div>';
      
      try {
          const modulo = await postInfo.archivo();
          const markdownRAW = modulo.default;
          const copiasHtml = gestorBitacoraBlog
            .listarCopiasPorHora()
            .map(
              (snap) => `
              <li style="margin-bottom:0.75rem; padding:0.75rem; border:1px solid var(--color-borde, rgba(255,255,255,0.14)); border-radius:8px;">
                <strong>🕒 ${snap.fechaHora} — <code>${snap.version}</code></strong>: ${snap.tituloHito}
                <br /><small>✅ Checklist: ${snap.checklistCompletado}</small>
              </li>
            `
            )
            .join('');

          this.$container.innerHTML = `
            <section style="margin-bottom:1.5rem; padding:1rem; border-radius:10px; border:1px solid var(--color-borde, rgba(255,255,255,0.16)); background:rgba(99,102,241,0.08);">
              <header style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:0.5rem; margin-bottom:0.75rem;">
                <h3 style="margin:0;">🕒 Copias por Hora Combinadas (Changelogs + Checklist Vivo)</h3>
                <button type="button" id="btn-blog-add-hourly-snap" class="btn-primario" style="padding:0.45rem 0.85rem; border-radius:8px; cursor:pointer;">
                  + Guardar Nueva Copia por Hora
                </button>
              </header>
              <ul id="blog-hourly-list" style="list-style:none; margin:0; padding:0;">${copiasHtml}</ul>
            </section>
            ${marked.parse(markdownRAW)}
          `;

          const btnAddSnap = this.$container.querySelector('#btn-blog-add-hourly-snap');
          if (btnAddSnap) {
            btnAddSnap.addEventListener('click', () => {
              gestorBitacoraBlog.registrarNuevaCopiaPorHora({
                version: `v2.7.${gestorBitacoraBlog.listarCopiasPorHora().length}`,
                tituloHito: 'Copia por Hora manual generada desde /blog',
                mejoras: ['Sincronización de Changelogs, Checklist y Estado Local/File System.'],
                checklistCompletado: '15 / 15 Hitos Verificados (100%)'
              });
              this.mostrarPost(slug);
            });
          }
      } catch (err) {
          this.$container.innerHTML = `<h3 style="color:red;">Error cargando post</h3><p>${err.message}</p>`;
      }
  }
}

if (!customElements.get('mita-blog')) {
  customElements.define('mita-blog', MitaBlog);
}
