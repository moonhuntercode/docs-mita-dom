const mdFiles = import.meta.glob('../../assets/mita-docs-cache/**/*.md', { query: '?raw', import: 'default', eager: true });

export const DOCS_MAP = {};

for (const path in mdFiles) {
  // Ignorar la carpeta dist para no duplicar READMEs o documentación procesada
  if (path.includes('dist/')) continue;
  
  // Extraer el nombre del archivo sin extensión para usarlo como ID
  const partes = path.split('/');
  const archivo = partes[partes.length - 1];
  const idDoc = archivo.replace(/\.md$/i, '').toLowerCase();
  
  // Extraer categoría de la ruta
  let categoria = 'todos';
  if (partes.length >= 3) {
      const parentDir = partes[partes.length - 2].toLowerCase();
      if (parentDir !== 'mita-docs-cache' && parentDir !== 'docs') {
          categoria = parentDir;
      }
  }

  // Almacenar el objeto completo en el mapa
  DOCS_MAP[idDoc] = {
      idDoc: idDoc,
      categoria: categoria,
      contenido: mdFiles[path]
  };
}
