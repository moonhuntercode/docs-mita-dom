// @ts-check
/**
 * 🔍 Helper reutilizable para filtrar listas dentro de acordeones HTML5 (<details>).
 * Elimina la duplicación entre <mita-docs-nav> y <mita-lab-nav>.
 *
 * @param {Object} config
 * @param {HTMLInputElement | null} config.inputBuscador Input de búsqueda en vivo
 * @param {HTMLElement[]} config.acordeones Lista de nodos <details>
 * @param {HTMLElement | null} config.avisoVacio Elemento mostrado cuando no hay coincidencias
 * @param {(li: HTMLElement) => string} config.extraerTexto Función que devuelve el texto indexable de cada <li>
 * @returns {() => void} Función de limpieza para remover el listener
 */
export function conectarFiltroAcordeones({ inputBuscador, acordeones, avisoVacio, extraerTexto }) {
  if (!inputBuscador) return () => {};

  const onSearch = (event) => {
    const target = /** @type {HTMLInputElement} */ (event.target);
    const termino = target.value.trim().toLowerCase();
    let coincidenciasTotales = 0;

    acordeones.forEach((acordeon) => {
      const items = Array.from(acordeon.querySelectorAll('li'));
      let visiblesEnGrupo = 0;

      items.forEach((li) => {
        const texto = extraerTexto(li).toLowerCase();
        const coincide = !termino || texto.includes(termino);
        li.hidden = !coincide;
        if (coincide) {
          visiblesEnGrupo++;
          coincidenciasTotales++;
        }
      });

      acordeon.hidden = visiblesEnGrupo === 0;
      if (termino && visiblesEnGrupo > 0) {
        acordeon.setAttribute('open', '');
      }
    });

    if (avisoVacio) {
      avisoVacio.hidden = coincidenciasTotales > 0;
    }
  };

  inputBuscador.addEventListener('input', onSearch);
  return () => inputBuscador.removeEventListener('input', onSearch);
}
