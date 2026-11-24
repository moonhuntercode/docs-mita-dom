// @ts-check
import { crearEstadoCompartido } from 'mita-dom';

/**
 * 🧪 Estado Compartido de la Lección Activa del Laboratorio
 * Conecta el portal <mita-lab-nav> (dentro del <aside id="sidebar">)
 * con la vista principal <demo-laboratorio-signals>.
 */
export const estadoLeccionActiva = crearEstadoCompartido(
  'lab:leccion_activa',
  'compartir',
  {
    persistirLocal: true,
    descripcion: 'Lección actualmente seleccionada en el Sandbox de /laboratorio.',
    reglas: 'Controlada desde los acordeones de <mita-lab-nav> en el <aside id="sidebar">.'
  }
);
