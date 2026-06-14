# 💾 Persistencia Avanzada (IndexedDB)

En MitaDOM, por defecto, los Signals utilizan `localStorage` como motor de persistencia síncrono si se provee la opción `persistKey`. Sin embargo, `localStorage` tiene límites de almacenamiento (5MB) y es **síncrono**, lo que significa que bloquea el hilo principal durante la lectura/escritura de grandes objetos.

Para solventar esto, hemos implementado una integración directa y transparente con **IndexedDB**.

## ¿Cómo funciona el Adapter Asíncrono?
MitaDOM ha sido diseñado con la opción `storageAdapter` en el constructor de `Signal`. Esto permite inyectar cualquier proveedor de almacenamiento (IndexedDB, Firebase, etc.). Lo fascinante es que MitaDOM **entiende nativamente las Promesas**. 

Si el adapter retorna una Promesa al leer (`getItem`), el Signal esperará la resolución y luego mutará el estado inicial sin bloquear el UI.

## Uso Básico

Hemos creado un adaptador oficial en `src/utils/db.js` llamado `IndexedDBAdapter`.

```javascript
import { Signal } from 'mita-dom';
import { IndexedDBAdapter } from '../utils/db.js';

export const estadoAppGlobal = new Signal({ visitas: 0 }, {
    persistKey: 'mita_estado_global', 
    storageAdapter: IndexedDBAdapter // 👈 ¡Inyección directa!
});
```

### Ventajas de esta Arquitectura
- **HMR Amigable:** Al ser asíncrono y delegar el I/O al navegador, la recarga en caliente de Vite (HMR) no sufre bloqueos al inyectar nuevos módulos que evalúen el Store.
- **Rendimiento:** Ideal para persistir datos complejos como caché de búsquedas, historiales largos o estados complejos del dashboard.
- **Transparencia:** Para los componentes que se suscriben al `Signal`, todo sigue siendo idéntico. No necesitan saber que los datos provienen de IndexedDB.

## 🚀 Web APIs Estables y Production-Ready

En esta arquitectura moderna, dependemos puramente de la plataforma web sin capas intermedias. Aquí listamos las APIs que usamos activamente:

| Web API | Uso en el Proyecto | Soporte |
| :--- | :--- | :--- |
| **Custom Elements v1** | Base de `MitaElement` y toda la UI. | Global |
| **Shadow DOM v1** | Encapsulamiento CSS en `<mita-code-editor>`, `<mita-search>`, etc. | Global |
| **IndexedDB API** | Persistencia asíncrona de Signals globales en `db.js`. | Global |
| **Intersection Observer** | (Próximo) Lazy loading de módulos y componentes complejos. | Global |
| **History API** | Router SPA avanzado (`pushState`, `popstate`). | Global |
| **CSS Custom Properties** | Tematización dinámica (Oscuro/Claro) sin recargar CSS. | Global |
| **Fetch API** | Solicitudes de datos mock en `DemoEstados`. | Global |

¡La web es suficientemente poderosa por sí misma!
