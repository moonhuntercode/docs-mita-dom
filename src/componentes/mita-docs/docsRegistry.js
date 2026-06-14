// Importamos todos los archivos MD automáticamente gracias a Vite Glob Imports
const mdFiles = import.meta.glob('@mita-docs/**/*.md', { query: '?raw', import: 'default', eager: true });

export const DOCS_MAP = {};

for (const path in mdFiles) {
  // Ignorar carpetas como node_modules, dist si llegaran a filtrarse
  if (path.includes('node_modules') || path.includes('dist')) continue;
  
  // Extraer el nombre del archivo sin extensión para usarlo como ID
  const partes = path.split('/');
  const archivo = partes[partes.length - 1];
  const idDoc = archivo.replace(/\.md$/i, '').toLowerCase();
  
  // Almacenar el contenido RAW en el mapa
  DOCS_MAP[idDoc] = mdFiles[path];
}
