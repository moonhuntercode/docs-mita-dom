// @ts-check
import {
  Signal,
  crearEstadoCompartido,
  crearGestorConsentimiento,
  crearGestorGamificacionLectura
} from 'mita-dom';
import { setItemDB } from '../utils/db.js';
import seedFsDb from '../assets/mita-docs-db.json';

/**
 * 📚 Estado Global del Documento Activo en /docs
 */
export const estadoDocActivo = new Signal('readme');

/**
 * 🏆 Gestor Compartido de Gamificación de Lectura, Resaltado de Texto y Analíticas de Precisión
 */
export const gestorGamificacionDocs = crearGestorGamificacionLectura({
  nombreEstado: 'docs:gamificacion_lectura'
});

/**
 * 🔍 Preferencias Visuales del Lector (Tamaño de letra A-/A/A+ y Modo Lectura Cómoda)
 */
export const estadoPreferenciasLectura = crearEstadoCompartido(
  'ui:preferencias_lectura',
  {
    fontSizePx: 16,
    modoComodo: false
  },
  {
    persistirLocal: true,
    descripcion: 'Tamaño de fuente (14px a 24px) y modo de lectura amigable en /docs.',
    reglas: 'Accesible para todos los lectores desde la barra superior de documentación.'
  }
);

/**
 * 🛡️ Estado de Administración de Documentación (Dashboard solo para Admin + Auto-guardado)
 */
export const estadoAdminDocs = crearEstadoCompartido(
  'docs:admin_config',
  {
    esAdmin: false,
    autoGuardado: true,
    ultimaSincronizacionFs: seedFsDb?.sincronizadoEn || '2026-11-22',
    mensajeEstado: 'Sincronizado con src/assets/mita-docs-db.json'
  },
  {
    persistirLocal: true,
    descripcion: 'Controla el acceso al Dashboard exclusivo de Admin en /docs y el auto-guardado.',
    reglas: 'El Dashboard y los botones de edición/backup solo se montan en el DOM cuando esAdmin === true.'
  }
);

/**
 * 🍪 Gestor Auto-Administrable de Términos, Cookies y Guía en la Nube compartido con /docs
 */
export const gestorPoliticasDocs = crearGestorConsentimiento({
  nombreEstado: 'docs:politicas_terminos',
  persistirLocal: true,
  versionTerminos: seedFsDb?.politicasTerminos?.versionTerminos || '2026-11-22',
  textoTerminos: seedFsDb?.politicasTerminos?.textoTerminos,
  urlGuiaNube: seedFsDb?.politicasTerminos?.urlGuiaNube
});

const docsInicialesFs = seedFsDb?.documentosLocales || {};

/**
 * 🗄️ Base de Datos Local Auto-Administrable de Documentación
 * Hidratada inicialmente desde `src/assets/mita-docs-db.json` (File System del repositorio)
 * y respaldada en `localStorage` + `IndexedDB`.
 */
export const estadoDocsLocales = crearEstadoCompartido(
  'docs:locales_db',
  docsInicialesFs,
  {
    persistirLocal: true,
    descripcion: 'Documentos Markdown creados o editados localmente y sincronizados con File System.',
    reglas: 'Auto-administrable desde el Dashboard Admin en /docs con respaldo en localStorage, IndexedDB y File System.'
  }
);

/**
 * Ajusta el tamaño de letra de la documentación entre 14px y 24px.
 * @param {number} deltaPx Ejemplo: `-2`, `+2`, o `0` para restaurar a `16px`.
 */
export function ajustarTamanoLetraDocs(deltaPx) {
  const actual = estadoPreferenciasLectura.get().fontSizePx || 16;
  const nuevo = deltaPx === 0 ? 16 : Math.min(24, Math.max(14, actual + deltaPx));
  estadoPreferenciasLectura.patch({ fontSizePx: nuevo });
  return nuevo;
}

/**
 * Construye el payload completo para sincronizar con `src/assets/mita-docs-db.json` o descargar backup `.json`.
 */
export function construirSnapshotFileSystem() {
  const politicas = gestorPoliticasDocs.estado.get();
  return {
    version: '2.7.0',
    sincronizadoEn: new Date().toISOString().split('T')[0],
    descripcion: 'Snapshot de la Base de Datos Local de Documentación y Políticas sincronizado con el File System del repositorio Git.',
    politicasTerminos: {
      versionTerminos: politicas.versionTerminos,
      textoTerminos: politicas.textoTerminos,
      urlGuiaNube: politicas.urlGuiaNube
    },
    documentosLocales: estadoDocsLocales.get() || {}
  };
}

/**
 * 🔄 Sincroniza la DB Local con el archivo físico `src/assets/mita-docs-db.json` del repositorio
 * a través del middleware de Vite (`/__mita_fs_sync`), para que en cada `git pull` esté disponible.
 */
export async function sincronizarDbLocalConFileSystem() {
  const snapshot = construirSnapshotFileSystem();
  const fechaHoy = snapshot.sincronizadoEn;

  if (typeof indexedDB !== 'undefined') {
    setItemDB('mita_docs_locales_backup', snapshot.documentosLocales).catch(() => {});
  }

  try {
    if (typeof fetch === 'function') {
      const res = await fetch('/__mita_fs_sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot)
      });
      if (res.ok) {
        estadoAdminDocs.patch({
          ultimaSincronizacionFs: fechaHoy,
          mensajeEstado: '✅ Sincronizado en vivo con src/assets/mita-docs-db.json (File System)'
        });
        return { ok: true, modo: 'filesystem', snapshot };
      }
    }
  } catch {
    // En entorno estático o test sin servidor dev activo, mantiene respaldo local
  }

  estadoAdminDocs.patch({
    ultimaSincronizacionFs: fechaHoy,
    mensajeEstado: '💾 Guardado en DB Local (localStorage + IndexedDB). Usa Backup Manual para exportar .json.'
  });
  return { ok: true, modo: 'local', snapshot };
}

/**
 * Guarda o actualiza un documento Markdown en la DB Local y auto-sincroniza con File System si autoGuardado está activo.
 * @param {string} idDoc
 * @param {{ titulo: string, categoria: string, contenido: string }} payload
 */
export function guardarDocEnDbLocal(idDoc, payload) {
  const clave = String(idDoc || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  if (!clave) return null;

  const actual = estadoDocsLocales.get() || {};
  const registro = {
    idDoc: clave,
    titulo: String(payload.titulo || clave).trim(),
    categoria: String(payload.categoria || 'local').trim().toLowerCase(),
    contenido: String(payload.contenido || '').trim(),
    actualizadoEn: new Date().toISOString().split('T')[0]
  };

  const nuevoMapa = { ...actual, [clave]: registro };
  estadoDocsLocales.set(nuevoMapa);

  if (typeof indexedDB !== 'undefined') {
    setItemDB('mita_docs_locales_backup', nuevoMapa).catch(() => {});
  }

  if (estadoAdminDocs.get().autoGuardado) {
    sincronizarDbLocalConFileSystem().catch(() => {});
  }

  return registro;
}

/**
 * Restaura un documento a su versión original eliminando el override de la DB Local.
 * @param {string} idDoc
 */
export function eliminarDocDeDbLocal(idDoc) {
  const clave = String(idDoc || '').trim().toLowerCase();
  const actual = { ...(estadoDocsLocales.get() || {}) };
  if (clave in actual) {
    delete actual[clave];
    estadoDocsLocales.set(actual);
    if (typeof indexedDB !== 'undefined') {
      setItemDB('mita_docs_locales_backup', actual).catch(() => {});
    }
    if (estadoAdminDocs.get().autoGuardado) {
      sincronizarDbLocalConFileSystem().catch(() => {});
    }
  }
}

/**
 * 📤 Importa un archivo de backup `.json` en la DB Local y en el gestor de Términos.
 * @param {Record<string, any>} jsonSnapshot
 */
export function restaurarBackupEnDbLocal(jsonSnapshot) {
  if (!jsonSnapshot || typeof jsonSnapshot !== 'object') return false;
  if (jsonSnapshot.documentosLocales && typeof jsonSnapshot.documentosLocales === 'object') {
    estadoDocsLocales.set(jsonSnapshot.documentosLocales);
  }
  if (jsonSnapshot.politicasTerminos) {
    gestorPoliticasDocs.actualizarTerminosYPoliticas(jsonSnapshot.politicasTerminos);
  }
  estadoAdminDocs.patch({
    mensajeEstado: '📤 Backup JSON restaurado exitosamente en DB Local.'
  });
  return true;
}
