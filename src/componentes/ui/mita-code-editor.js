// @ts-check
import { MitaElement } from '../../utils/MitaElement.js';
import htmlTemplate from './mita-code-editor.html?raw';
import './mita-code-editor.css';

/**
 * 💻 <mita-code-editor>
 * Un editor de código interactivo y auto-resaltado estilo VS Code.
 * Ahora en Light DOM para mejor compatibilidad global.
 */
export class MitaCodeEditor extends MitaElement {
  constructor() {
    super();
    this.codigoLimpio = '';
    this.lenguaje = 'javascript';
    this.modoEdicion = false;
    this.esEditableGlobal = false;
  }

  async render() {
    // 1. Extraer atributos
    const archivo = this.getAttribute('archivo') || 'codigo.js';
    this.lenguaje = this.getAttribute('lenguaje') || 'javascript';
    // Por defecto bloqueado, salvo que tenga editable="true"
    this.esEditableGlobal = this.getAttribute('editable') === 'true';
    this.modoEdicion = this.esEditableGlobal;
    
    // 2. Extraer código antes de reemplazar el innerHTML
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

    // 3. Renderizar Light DOM usando el template externo
    this.innerHTML = htmlTemplate;

    // 4. Inicializar UI
    const elFilename = this.querySelector('#ui-filename');
    const btnToggleEdit = this.querySelector('.toggle-edit-btn');
    const textarea = this.querySelector('.mita-editor-textarea');
    const renderizado = this.querySelector('#codigo-renderizado');
    const btnFormat = this.querySelector('.format-btn');

    if (elFilename) elFilename.textContent = archivo;
    
    // Solo mostrar el botón de edición si el componente permite ser editable
    if (!this.esEditableGlobal && btnToggleEdit) {
      // @ts-ignore
      btnToggleEdit.style.display = 'none';
    }

    if (textarea) {
      // @ts-ignore
      textarea.value = this.codigoLimpio;
      if (this.modoEdicion) {
        textarea.classList.add('editable');
        textarea.removeAttribute('readonly');
        if (btnToggleEdit) btnToggleEdit.textContent = '🔒 Bloquear';
        if (btnFormat) {
          // @ts-ignore
          btnFormat.style.display = 'flex';
        }
      }
    }

    if (renderizado) {
      renderizado.innerHTML = this._resaltarSintaxis(this.codigoLimpio, this.lenguaje);
    }

    // 5. Asignar Eventos
    this._iniciarEventos();
  }

  _iniciarEventos() {
    const btnCopiar = this.querySelector('.copy-btn');
    const spanTexto = this.querySelector('.copy-text');
    const btnFormat = this.querySelector('.format-btn');
    const btnToggleEdit = this.querySelector('.toggle-edit-btn');
    const textarea = this.querySelector('.mita-editor-textarea');
    const renderizado = this.querySelector('#codigo-renderizado');
    const display = this.querySelector('.mita-editor-display');

    if (btnToggleEdit && textarea && btnFormat) {
      btnToggleEdit.addEventListener('click', () => {
        this.modoEdicion = !this.modoEdicion;
        if (this.modoEdicion) {
          textarea.classList.add('editable');
          textarea.removeAttribute('readonly');
          btnToggleEdit.textContent = '🔒 Bloquear';
          // @ts-ignore
          btnFormat.style.display = 'flex';
        } else {
          textarea.classList.remove('editable');
          textarea.setAttribute('readonly', 'true');
          btnToggleEdit.textContent = '✏️ Editar';
          // @ts-ignore
          btnFormat.style.display = 'none';
        }
      });
    }

    if (textarea && display) {
      textarea.addEventListener('scroll', () => {
        display.scrollLeft = textarea.scrollLeft;
        display.scrollTop = textarea.scrollTop;
      });

      textarea.addEventListener('input', (e) => {
        if (!this.modoEdicion) return;
        // @ts-ignore
        this.codigoLimpio = e.target.value;
        if (renderizado) {
          renderizado.innerHTML = this._resaltarSintaxis(this.codigoLimpio, this.lenguaje);
        }
      });

      textarea.addEventListener('keydown', (e) => {
        if (!this.modoEdicion) return;
        // @ts-ignore
        if (e.key === 'Tab') {
          e.preventDefault();
          // @ts-ignore
          const start = textarea.selectionStart;
          // @ts-ignore
          const end = textarea.selectionEnd;
          // @ts-ignore
          textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
          // @ts-ignore
          textarea.selectionStart = textarea.selectionEnd = start + 2;
          textarea.dispatchEvent(new Event('input'));
        }
      });
    }

    if (btnCopiar && spanTexto) {
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
    }

    if (btnFormat && textarea) {
      btnFormat.addEventListener('click', () => {
        if (!this.modoEdicion) return;
        const codigoFormateado = this._formatearCodigo(this.codigoLimpio);
        // @ts-ignore
        textarea.value = codigoFormateado;
        textarea.dispatchEvent(new Event('input'));
      });
    }
  }

  _formatearCodigo(codigo) {
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

    if (lenguaje !== 'javascript' && lenguaje !== 'js' && lenguaje !== 'html' && lenguaje !== 'css' && lenguaje !== 'typescript' && lenguaje !== 'ts') {
      return code; // Fallback sin resaltado
    }

    // Tokens mejorados
    const tokens = [
      { type: 'string', regex: /^(?:&quot;.*?&quot;|&#039;.*?&#039;|`[\s\S]*?`)/ },
      { type: 'comment', regex: /^(?:\/\/.*|\/\*[\s\S]*?\*\/)/ },
      { type: 'control-keyword', regex: /^(?:if|else|for|while|do|return|try|catch|finally|switch|case|break|continue|await|async|yield|throw)\b/ },
      { type: 'keyword', regex: /^(?:import|export|class|extends|constructor|super|this|new|const|let|var|function|typeof|default|from|in|of|instanceof|void|delete|interface|type)\b/ },
      { type: 'builtin', regex: /^(?:console|document|window|process|require|module|exports|global|setTimeout|setInterval|clearTimeout|clearInterval|Promise|Math|JSON|Object|Array|String|Number|Boolean|Date|Map|Set|Symbol|Error|RegExp|HTMLElement|customElements)\b/ },
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
