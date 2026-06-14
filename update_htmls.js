import fs from 'fs';
const files = [
  'src/componentes/formulario/formulario.html',
  'src/componentes/acerca/demo-acerca.html',
  'src/componentes/demo-shopping-list/demo-shopping-list.html',
  'src/componentes/configuracion/demo-config.html',
  'src/componentes/admin-logs/admin-logs.html',
  'src/componentes/perfil/perfil.html'
];

for(let file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<mita-code-editor([^>]*)>\n([\s\S]*?)<\/mita-code-editor>/g, (match, attrs, code) => {
      // Don't wrap if already wrapped
      if (code.includes('<pre><code>')) return match;
      return `<mita-code-editor${attrs}>\n  <pre><code>${code}</code></pre>\n</mita-code-editor>`;
    });
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
