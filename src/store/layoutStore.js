// @ts-check
import { crearEstadoGlobal } from 'mita-dom';

/**
 * 📦 Store del Layout de la Aplicación
 * Gestiona el estado visual de elementos estructurales como el Sidebar.
 */
export const estadoSidebar = crearEstadoGlobal({
    abierto: false
});
