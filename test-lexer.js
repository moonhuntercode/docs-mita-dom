const _escaparHTML = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const _resaltarSintaxis = (codigo, lenguaje) => {
  let code = _escaparHTML(codigo);

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
          html += `<span class="${t.type}">${match[0]}</span>`;
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
};

const testCode = `import { Signal } from 'mita-dom';
const s = new Signal(0);
console.log(s.value);
function test() { return true; }`;

console.log(_resaltarSintaxis(testCode, 'javascript'));
