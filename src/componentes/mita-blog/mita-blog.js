// @ts-check
import { MitaElement } from '../../utils/MitaElement.js';
import { marked } from 'marked';
import { navegarA } from 'mita-dom';
import { estadoPostActivo, BLOG_REGISTRY } from '../../store/blogStore.js';

import htmlTemplate from './mita-blog.html?raw';
import './mita-blog.css';

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
          this.$container.innerHTML = marked.parse(markdownRAW);
      } catch (err) {
          this.$container.innerHTML = `<h3 style="color:red;">Error cargando post</h3><p>${err.message}</p>`;
      }
  }
}

if (!customElements.get('mita-blog')) {
  customElements.define('mita-blog', MitaBlog);
}
