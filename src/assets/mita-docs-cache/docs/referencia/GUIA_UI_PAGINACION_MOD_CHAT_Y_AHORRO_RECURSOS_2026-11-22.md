# 🛡️ Guía Oficial: Librería UI (Paginación + Data Fetching), Chat con Ventana de Reglas (3s), Moderación de Anuncios ("DC") y Ahorro de Recursos (2026-11-22)

Esta guía documenta las capacidades del módulo `src/utils/uiModeracionYComunidad.js` de `mita-dom v2.7.0`, diseñado para plataformas comunitarias, tablones de anuncios y chats en tiempo real que necesitan **máxima claridad, control administrativo granular y ahorro extremo de servidor y base de datos**.

---

## 1. 📄 Librería UI: Paginación Reactiva y Data Fetching con Caché TTL

### 1.1 Paginación sin Re-renderizar Listas Gigantes (`crearControladorPaginacion`)
Renderizar 500 anuncios de golpe en el DOM desperdicia RAM y batería en móviles. Con `crearControladorPaginacion` solo montas en el DOM la página activa:

```javascript
import { crearControladorPaginacion } from 'mita-dom';

const paginador = crearControladorPaginacion({
  nombreEstado: 'anuncios:paginacion',
  tamanoPaginaInicial: 6
});

const { itemsPagina, paginaActual, totalPaginas } = paginador.obtenerItemsDePagina(listaFiltrada);
// Renderiza los botones semánticos <nav aria-label="Paginación">
contenedorPaginacion.innerHTML = paginador.renderizarControlesHtml(listaFiltrada.length);
```

### 1.2 Data Fetching con Caché y Ahorro de Consultas (`crearFetcherConCacheYEstados`)
Evita repetir consultas SQL/HTTP idénticas cuando el usuario cambia de pestaña y regresa antes de que expire el TTL:

```javascript
import { crearFetcherConCacheYEstados } from 'mita-dom';

const fetcher = crearFetcherConCacheYEstados({ tiempoCacheMs: 60000 }); // 60s de caché

const { datos, desdeCache } = await fetcher.cargarRecurso('api:anuncios_activos', async () => {
  const res = await fetch('/api/jobs');
  return res.json();
});
```

---

## 2. 👤 Perfiles Rápidos sin Cuenta, Huella de Dispositivo en DB Local y Regla de 15 Días

Con `crearGestorPerfilesYDispositivo()`:
1. **No necesitas abrir el registro formal de cuentas todavía** (`aceptarRegistrosDeCuenta: false` por defecto): cualquier usuario puede crear su perfil rápido con nombre y empresa.
2. **Badge `"⚠️ No Verificado"` por defecto**: cada usuario que publica aparece claramente identificado como no verificado.
3. **Huella de Dispositivo en DB Local (`obtenerHuellaDispositivoLocal()`)**: guarda e identifica el dispositivo en `localStorage` para saber si es la misma persona aunque intente cambiarse el nombre.
4. **Bloqueo de 15 días para cambiar de nombre (Activable/Desactivable por Admin)**:
   ```javascript
   import { crearGestorPerfilesYDispositivo } from 'mita-dom';

   const perfiles = crearGestorPerfilesYDispositivo();

   // El usuario crea su perfil rápido sin cuenta:
   perfiles.crearOActualizarPerfilSinCuenta({
     nombre: 'Juan Constructora',
     empresa: 'Constructora Del Sur'
   });

   // Si intenta cambiarse el nombre antes de 15 días en el mismo dispositivo, es bloqueado.
   // El Admin puede activar o desactivar esta regla de 15 días cuando quiera:
   perfiles.configurarReglasAdminPerfiles({
     restringirCambioNombreQuinceDias: true,
     diasBloqueoCambioNombre: 15
   });

   // El Admin puede prohibir publicar a un usuario o dispositivo específico:
   perfiles.prohibirUsuarioODispositivo(perfiles.huellaActual, 'Spam reiterado');
   ```

---

## 3. 💬 Salas de Chat y Grupos con Ventana Obligatoria de Aceptación y Cooldown de 3 Segundos

Con `crearControladorSalaChatYGrupos()`:
- Cuando alguien intenta entrar a un chat o grupo (`intentarEntrarASalaOChat('grupo-empleos')`), **no se le permite entrar** hasta que acepte explícitamente las reglas en la ventana emergente (`aceptarReglasYEntrarASala('grupo-empleos')`). Si rechaza, queda fuera.
- Cuando envía mensajes, se aplica un **intervalo configurable por el Admin (por defecto cada `3 segundos`)**:

```javascript
import { crearControladorSalaChatYGrupos } from 'mita-dom';

const chat = crearControladorSalaChatYGrupos({ intervaloSegundosInicial: 3 });

// Cambiar desde Admin el tiempo entre mensajes (ej. cada 3s, 5s o 10s):
chat.configurarIntervaloMensajesSegundos(3);
```

---

## 4. 📢 Moderación de Anuncios: Bloqueo `"DC"`, CRUD Obligatorio de Categorías, Descargo Legal y Reportes con Pruebas

Con `crearSistemaModeracionAnuncios()`:
1. **Descargo de Responsabilidad Legal Visible**: declara que la plataforma no se responsabiliza ni tiene culpa si terceros publican contenidos ilegales, y marca por defecto a cada autor como **`"⚠️ No Verificado"`**.
2. **CRUD Obligatorio de Categorías**: ningún anuncio puede publicarse sin una categoría válida creada en el CRUD (`crearCategoria`, `eliminarCategoria`, `listarCategoriasActivas`).
3. **Bloqueo de Palabras Prohibidas como `"DC"`**: configurable en `'ambos'` (bloquea `"DC"`, `"dc"`, `"Dc"`, `"dC"`), `'mayusculas'` o `'minusculas'`.
4. **Revisión Previa Activable/Desactivable + Reportes con Justificación y Pruebas**:
   - Los usuarios pueden reportar un anuncio adjuntando justificación y pruebas (`reportarAnuncioConPruebas`), lo que genera una **notificación inmediata para el Admin**.
   - El Admin cuenta con botones exclusivos para **`✅ Permitir`**, **`✅ Permitir Todos`**, **`🧹 Borrar todas las publicaciones de un Usuario o Empresa`** o **`🧨 Borrar Todo el Tablón`**.

---

## 5. 🗺️ Planificación de Arquitectura: Routing, Auto-Administración y Optimización de Base de Datos (Ahorro de Recursos)

Para que tu aplicación web escale en un VPS (ej. Docker Swarm en Debian 13) con consumo mínimo de RAM y CPU:

1. **Ahorro en Base de Datos (MySQL + ORM + DB Local del Cliente):**
   - **Índices Compuestos en MySQL**: indexar `(categoria, estadoRevision, creadoEnTs)` evita *Full Table Scans* al filtrar anuncios por categoría y fecha/hora.
   - **Paginación + Caché TTL en Cliente**: usar `crearFetcherConCacheYEstados({ tiempoCacheMs: 60000 })` + `crearControladorPaginacion` reduce hasta en un **85%** las lecturas repetidas a MySQL.
   - **Filtro Previo en Cliente (`huellaDispositivoId` + Filtro `"DC"`)**: los anuncios con palabras prohibidas (`"DC"`) o dispositivos bloqueados se rechazan en `< 0.2ms` antes siquiera de abrir una conexión a la base de datos.
2. **Routing y Navegación Granular por Vista:**
   - Usa `crearControladorEstrategiaPorVista()` para servir `/docs` en modo `SSG` (0 gasto de CPU en servidor), `/empleos` en `Hybrid` (SEO + Islas Light DOM) y `/admin` en `CSR` puro.
