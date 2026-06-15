// @ts-check
import { crearEstadoLocal } from 'mita-dom';

/**
 * 📡 Estado Global (aunque usemos Local para aislamiento) para la sección Blog.
 * Guarda el slug activo. Si es 'index' o nulo, muestra la lista de posts.
 */
export const estadoPostActivo = crearEstadoLocal({
    slug: 'index'
});

/**
 * 📚 Registro Oficial de Artículos del Blog
 * Controla la metadata (Títulos, categorías, fechas y el slug para el routing).
 */
export const BLOG_REGISTRY = [
    {
        slug: 'por-que-no-usar-frameworks',
        titulo: 'Filosofía: ¿Por qué NO usar un Framework?',
        subtitulo: 'Entendiendo el control real sobre el DOM y el ecosistema web nativo.',
        categoria: 'Arquitectura',
        fecha: '14 de Junio, 2026',
        archivo: () => import('../assets/por-que-no-usar-frameworks.md?raw')
    },
    {
        slug: 'mindset-web-dev',
        titulo: 'El Mindset del Desarrollador Web Moderno',
        subtitulo: 'Volviendo a los fundamentos de la web para crear aplicaciones ultrarrápidas.',
        categoria: 'Filosofía',
        fecha: '10 de Junio, 2026',
        archivo: () => import('../assets/mindset-web-dev.md?raw')
    },
    {
        slug: 'hitos-ui-hmr',
        titulo: 'Hitos en MitaDOM: UI y HMR Dinámico',
        subtitulo: 'Cómo construimos un HMR propio sin depender de librerías masivas.',
        categoria: 'Novedades',
        fecha: '12 de Junio, 2026',
        archivo: () => import('../assets/hitos-ui-hmr.md?raw')
    },
    {
        slug: 'novedades-v2',
        titulo: 'Novedades de MitaDOM v2.0',
        subtitulo: 'Signals nativos, Router sin dependencias y soporte SSR.',
        categoria: 'Novedades',
        fecha: '13 de Junio, 2026',
        archivo: () => import('../assets/novedades-v2.md?raw')
    }
];
