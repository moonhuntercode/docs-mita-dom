// @ts-check
import { MitaElement } from '../../utils/MitaElement.js';
import styles from './mita-code-editor.css?inline';

/**
 * 💻 <mita-code-editor>
 * Un editor de código interactivo y auto-resaltado sin dependencias.
 */
export class MitaCodeEditor extends MitaElement {
  constructor() {
    super();
    this.codigoLimpio = '';
    this.lenguaje = 'javascript';
  }

  async render() {
    this.attachShadow({ mode: 'open' });

    const archivo = this.getAttribute('archivo') || 'codigo.js';
    this.lenguaje = this.getAttribute('lenguaje') || 'javascript';
    const esEditableInicial = this.hasAttribute('editable') && this.getAttribute('editable') !== 'false';
    this.modoEdicion = esEditableInicial;
    
    let codigoRaw = '';

    const codeNode = this.querySelector('code');
    const templateNode = this.querySelector('template');
    
    if (codeNode) {
      codigoRaw = codeNode.textContent || '';
    } else if (templateNode) {
      codigoRaw = templateNode.innerHTML;
    } else {
      codigoRaw = this.textContent || '';
    }

    this.codigoLimpio = this._limpiarIndentacion(codigoRaw);
    const codigoResaltado = this._resaltarSintaxis(this.codigoLimpio, this.lenguaje);

    this.shadowRoot.innerHTML = `
      <style>${styles}
        .editor-textarea { pointer-events: none; }
        .editor-textarea.editable { pointer-events: auto; background: rgba(0,0,0,0.1); }
      </style>

      <div class="editor-container">
        <div class="editor-header">
          <div class="mac-dots">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <span class="filename">${archivo}</span>
          <div class="header-actions">
            <button class="action-btn toggle-edit-btn" aria-label="Alternar edición">
              ${this.modoEdicion ? '🔒 Bloquear' : '✏️ Editar'}
            </button>
            <button class="action-btn format-btn" aria-label="Formatear código" style="display: ${this.modoEdicion ? 'flex' : 'none'}">✨ Formatear</button>
            <button class="action-btn copy-btn" aria-label="Copiar código">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span class="copy-text">Copiar</span>
            </button>
          </div>
        </div>
        <div class="editor-wrapper">
          <textarea class="editor-textarea ${this.modoEdicion ? 'editable' : ''}" spellcheck="false" aria-label="Editor de código" ${this.modoEdicion ? '' : 'readonly'}>${this.codigoLimpio}</textarea>
          <div class="editor-display">
            <pre><code id="codigo-renderizado">${codigoResaltado}</code></pre>
          </div>
        </div>
      </div>
    `;

    this._iniciarEventos();
  }

  _iniciarEventos() {
    const btnCopiar = this.shadowRoot.querySelector('.copy-btn');
    const spanTexto = this.shadowRoot.querySelector('.copy-text');
    const btnFormat = this.shadowRoot.querySelector('.format-btn');
    const btnToggleEdit = this.shadowRoot.querySelector('.toggle-edit-btn');
    const textarea = this.shadowRoot.querySelector('.editor-textarea');
    const renderizado = this.shadowRoot.querySelector('#codigo-renderizado');
    const display = this.shadowRoot.querySelector('.editor-display');

    btnToggleEdit.addEventListener('click', () => {
      this.modoEdicion = !this.modoEdicion;
      if (this.modoEdicion) {
        textarea.classList.add('editable');
        textarea.removeAttribute('readonly');
        btnToggleEdit.textContent = '🔒 Bloquear';
        btnFormat.style.display = 'flex';
      } else {
        textarea.classList.remove('editable');
        textarea.setAttribute('readonly', 'true');
        btnToggleEdit.textContent = '✏️ Editar';
        btnFormat.style.display = 'none';
      }
    });

    textarea.addEventListener('scroll', () => {
      display.scrollLeft = textarea.scrollLeft;
      display.scrollTop = textarea.scrollTop;
    });

    textarea.addEventListener('input', (e) => {
      if (!this.modoEdicion) return;
      this.codigoLimpio = e.target.value;
      renderizado.innerHTML = this._resaltarSintaxis(this.codigoLimpio, this.lenguaje);
    });

    textarea.addEventListener('keydown', (e) => {
      if (!this.modoEdicion) return;
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        textarea.dispatchEvent(new Event('input'));
      }
    });

    btnCopiar.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(this.codigoLimpio);
        spanTexto.textContent = '¡Copiado!';
        btnCopiar.classList.add('success');
        
        setTimeout(() => {
          spanTexto.textContent = 'Copiar';
          btnCopiar.classList.remove('success');
        }, 2000);
      } catch (err) {
        console.error('Error al copiar:', err);
        spanTexto.textContent = 'Error';
      }
    });

    btnFormat.addEventListener('click', () => {
      if (!this.modoEdicion) return;
      const codigoFormateado = this._formatearCodigo(this.codigoLimpio);
      textarea.value = codigoFormateado;
      textarea.dispatchEvent(new Event('input'));
    });
  }

  _formatearCodigo(codigo) {
    // Formateador súper básico para JS:
    // Elimina múltiples saltos de línea y arregla indentaciones de bloques {}
    let lineas = codigo.split('\n').map(l => l.trim());
    let resultado = '';
    let nivel = 0;
    
    for (let i = 0; i < lineas.length; i++) {
      let linea = lineas[i];
      if (linea.length === 0) {
        if (i > 0 && lineas[i-1] !== '') resultado += '\n';
        continue;
      }
      
      if (linea.match(/^[\}\]]/)) {
        nivel = Math.max(0, nivel - 1);
      }
      
      resultado += '  '.repeat(nivel) + linea + '\n';
      
      if (linea.match(/[\{\[]$/) && !linea.match(/[\}\]]$/)) {
        nivel++;
      }
    }
    return resultado.trimEnd();
  }

  _limpiarIndentacion(str) {
    if (!str) return '';
    const lineas = str.split('\n');
    if (lineas.length > 0 && lineas[0].trim() === '') lineas.shift();
    if (lineas.length > 0 && lineas[lineas.length - 1].trim() === '') lineas.pop();
    
    let minIndent = Infinity;
    lineas.forEach(line => {
      if (line.trim().length === 0) return;
      const indent = line.search(/\S|$/);
      if (indent < minIndent) minIndent = indent;
    });

    if (minIndent === Infinity || minIndent === 0) return lineas.join('\n');
    return lineas.map(line => line.substring(minIndent)).join('\n');
  }

  _escaparHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  _resaltarSintaxis(codigo, lenguaje) {
    let code = this._escaparHTML(codigo);

    if (lenguaje !== 'javascript' && lenguaje !== 'js' && lenguaje !== 'html' && lenguaje !== 'css') {
      return code; // Fallback sin resaltado
    }

    const tokens = [
      { type: 'string', regex: /^(?:&quot;.*?&quot;|&#039;.*?&#039;|`[\s\S]*?`)/ },
      { type: 'comment', regex: /^(?:\/\/.*|\/\*[\s\S]*?\*\/)/ },
      { type: 'control-keyword', regex: /^(?:if|else|for|while|do|return|try|catch|finally|switch|case|break|continue|await|async|yield|throw)\b/ },
      { type: 'keyword', regex: /^(?:import|export|class|extends|constructor|super|this|new|const|let|var|function|typeof|default|from|in|of|instanceof|void|delete)\b/ },
      { type: 'builtin', regex: /^(?:console|document|window|process|require|module|exports|global|setTimeout|setInterval|clearTimeout|clearInterval|Promise|Math|JSON|Object|Array|String|Number|Boolean|Date|Map|Set|Symbol|Error|RegExp)\b/ },
      { type: 'boolean', regex: /^(?:true|false|null|undefined|NaN|Infinity)\b/ },
      { type: 'function', regex: /^[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()/ },
      { type: 'property', regex: /^\.[a-zA-Z_$][a-zA-Z0-9_$]*/ },
      { type: 'number', regex: /^\b(?:0x[a-fA-F0-9]+|\d+(\.\d+)?)\b/ },
      { type: 'operator', regex: /^(?:=>|\+|-|\*|\/|%|={1,3}|!=?|!==?|&amp;|&lt;=?|&gt;=?|\|{1,2}|\?|:|\^|~)/ },
      { type: 'punctuation', regex: /^(?:[()[\]{}.,;])/ },
      { type: 'text', regex: /^[\s\S]/ }
    ];

    let html = '';
    let current = code;
    
    while (current.length > 0) {
      let matched = false;
      for (const t of tokens) {
        const match = current.match(t.regex);
        if (match) {
          if (t.type === 'text') {
            html += match[0];
          } else {
            html += `<span class="token ${t.type}">${match[0]}</span>`;
          }
          current = current.substring(match[0].length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        // Fallback infinito
        html += current[0];
        current = current.substring(1);
      }
    }
    
    return html;
  }
}

if (!customElements.get('mita-code-editor')) {
  customElements.define('mita-code-editor', MitaCodeEditor);
}
