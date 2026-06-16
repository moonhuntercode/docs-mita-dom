// Motor de búsqueda en memoria (Vanilla JS) sin dependencias
// Escanea archivos Markdown puros

export class SearchEngine {
  constructor(docsMap) {
    this.docs = [];
    this.iniciarIndice(docsMap);
  }

  iniciarIndice(docsMap) {
    // docsMap es un objeto { idDoc: { idDoc, categoria, contenido } }
    for (const [id, item] of Object.entries(docsMap)) {
      const contenido = item.contenido;
      // Extraemos el título principal (H1 o H2) para mostrarlo en los resultados
      const matchTitulo = contenido.match(/^#+\s+(.*)$/m);
      const titulo = matchTitulo ? matchTitulo[1] : id.replace(/_/g, ' ').toUpperCase();

      this.docs.push({
        id,
        titulo,
        categoria: item.categoria,
        contenido: contenido.toLowerCase(),
        contenidoOriginal: contenido // Para extraer el snippet original con mayúsculas/minúsculas
      });
    }
  }

  buscar(query) {
    if (!query || query.trim().length < 2) return [];

    const busqueda = query.toLowerCase().trim();
    const resultados = [];

    for (const doc of this.docs) {
      const indice = doc.contenido.indexOf(busqueda);
      if (indice !== -1) {
        // Extraer un snippet alrededor de la coincidencia
        const inicio = Math.max(0, indice - 40);
        const fin = Math.min(doc.contenidoOriginal.length, indice + busqueda.length + 40);
        
        let extracto = doc.contenidoOriginal.substring(inicio, fin);
        
        // Limpiamos saltos de línea y formateamos un poco
        extracto = extracto.replace(/\n/g, ' ').trim();
        if (inicio > 0) extracto = '...' + extracto;
        if (fin < doc.contenidoOriginal.length) extracto = extracto + '...';

        // Resaltar la palabra clave encontrada con un <mark> tag
        const regexResaltado = new RegExp(`(${query})`, 'gi');
        const extractoResaltado = extracto.replace(regexResaltado, '<mark>$1</mark>');

        resultados.push({
          idDoc: doc.id,
          categoria: doc.categoria,
          titulo: doc.titulo,
          extracto: extractoResaltado
        });
      }
    }

    return resultados;
  }
}
