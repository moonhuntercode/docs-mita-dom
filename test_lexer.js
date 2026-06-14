const code = `import { Signal } from 'mita-dom';
const nombreUsuario = new Signal("Invitado");
// Leer el valor
console.log(nombreUsuario.value);
nombreUsuario.set("Victor Code");`;

function _escaparHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function _resaltarSintaxis(codigo, lenguaje) {
  let code = _escaparHTML(codigo);

  const tokens = [
    { type: 'string', regex: /^(?:&quot;.*?&quot;|&#039;.*?&#039;|`[\s\S]*?`)/ },
    { type: 'comment', regex: /^(?:\/\/.*|\/\*[\s\S]*?\*\/)/ },
    { type: 'control-keyword', regex: /^(?:if|else|for|while|return|try|catch|switch|case|break|continue|await|async)\b/ },
    { type: 'keyword', regex: /^(?:import|export|class|extends|constructor|super|this|new|const|let|var|function|typeof|default|from)\b/ },
    { type: 'boolean', regex: /^(?:true|false|null|undefined)\b/ },
    { type: 'function', regex: /^[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()/ },
    { type: 'number', regex: /^\b\d+(\.\d+)?\b/ },
    { type: 'operator', regex: /^(?:\+|-|\*|\/|%|={1,3}|!|&amp;|&lt;|&gt;|\|{1,2})/ },
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

console.log(_resaltarSintaxis(code, 'javascript'));
