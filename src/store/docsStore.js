// @ts-check
import { Signal } from 'mita-dom';

/**
 * 📚 Estado Global de la Documentación
 * Permite que cualquier componente en la SPA sepa o decida qué documento Markdown se está visualizando.
 * Esto habilita patrones tipo "Teleport/Portal", donde un componente en el Sidebar
 * controla la vista principal.
 */
export const estadoDocActivo = new Signal('readme');
