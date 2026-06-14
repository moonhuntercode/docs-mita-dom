// @ts-check
import { MitaElement } from '../../utils/MitaElement.js';
import { marked } from 'marked';

import htmlTemplate from './mita-blog.html?raw';
import './mita-blog.css';

// Importamos los Posts como raw strings
import postMindset from '../../assets/mindset-web-dev.md?raw';
import postHitos from '../../assets/hitos-ui-hmr.md?raw';
import postV2 from '../../assets/novedades-v2.md?raw';

export class MitaBlog extends MitaElement {
  constructor() {
    super();
  }

  async render() {
    this.innerHTML = htmlTemplate;
    this.iniciarLogica();
  }

  iniciarLogica() {
    const $container = this.querySelector('#blog-container');
    
    // Convertimos el Markdown a HTML y lo insertamos de golpe
    // Combinamos los posts, separándolos con una línea horizontal
    const combinedMarkdown = postMindset + '\n\n---\n\n' + postHitos + '\n\n---\n\n' + postV2;
    $container.innerHTML = marked.parse(combinedMarkdown);
  }
}

if (!customElements.get('mita-blog')) {
  customElements.define('mita-blog', MitaBlog);
}
