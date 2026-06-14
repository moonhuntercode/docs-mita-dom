const mdFiles = import.meta.glob('../../assets/mita-docs-cache/**/*.md', { query: '?raw', import: 'default', eager: true });

export const DOCS_MAP = {};

for (const path in mdFiles) {
  // Ignorar la carpeta dist para no duplicar READMEs o documentación procesada
  if (path.includes('dist/')) continue;
  
  // Extraer el nombre del archivo sin extensión para usarlo como ID
  const partes = path.split('/');
  const archivo = partes[partes.length - 1];
  const idDoc = archivo.replace(/\.md$/i, '').toLowerCase();
  
  // Almacenar el contenido RAW en el mapa
  DOCS_MAP[idDoc] = mdFiles[path];
}
