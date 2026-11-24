# 📖 Glosario Oficial de Arquitectura, CLI `npx mita`, Signals y Protección Rust (`v2.7.0`)

Este glosario reúne **todos los conceptos, comandos del CLI y primitivas de `mita-dom`** con definiciones claras y ejemplos directos para que cualquier desarrollador domine la librería sin ambigüedades.

---

## 1. 🛠️ Glosario Completo del CLI (`npx mita`)

El CLI de `mita-dom` (`bin/mita.js` y `simularComandoCliMita`) combina lo mejor de **Angular CLI**, **Vue/Vite**, **SolidJS** y **Rust Cargo**:

| Comando CLI | Alias Corto | Qué Genera o Ejecuta |
| --- | --- | --- |
| `npx mita generate component <Nombre>` | `npx mita g c <Nombre>` | Crea un Web Component en **Light DOM** (`src/componentes/<kebab>/<kebab>.js`) con `crearAmbitoConLimpiezaAutomatica`, hoja CSS encapsulada con `@scope (<kebab>)` y su archivo de pruebas unitarias `test/<kebab>.test.js`. |
| `npx mita generate store <Nombre>` | `npx mita g s <Nombre>` | Crea un Store compartido (`src/store/<nombre>Store.js`) protegido por **Rust Borrow Checker** (`crearEstadoReactivoInmutable`, `leerEstadoInmutable`, `mutarEstadoConHistorial`) y persistencia en `localStorage`. |
| `npx mita generate page <Nombre> --hybrid` | `npx mita g p <Nombre> --hybrid` | Crea una página universal (`src/pages/<kebab>.js`) con soporte para `SSR`, `SSG`, `Hybrid (Islands)` o `CSR/SPA` y gestión automática de `<head>` con `MitaMeta.useHead()`. |
| `npx mita doctor` | `npx mita check` | Ejecuta el diagnóstico arquitectónico inspirado en `cargo check` y `flutter doctor`: verifica que no exista `attachShadow()`, que no haya `persistKey` duplicados, que los componentes liberen memoria con RAII `Drop` y que el CSS sea Mobile-First con `@scope`. |
| `npx mita g c <Nombre> --dry-run` | — | Previsualiza en consola los archivos que el CLI generaría sin escribirlos en el disco. |

---

## 2. 📡 Glosario de Signals y Estados Reactivos

- **`crearEstadoLocal(valorInicial)`**: Crea un `Signal` privado que vive únicamente dentro de la instancia actual de un Web Component (ej. pestaña activa, contador local).
- **`crearEstadoCompartido(nombreUnico, valorInicial, { persistirLocal, descripcion, reglas })`**: Crea o recupera un `Signal` compartido por nombre entre 2 o más componentes hermanos/lejanos sin *Props Drilling*. Si `persistirLocal: true`, sincroniza automáticamente con `localStorage`.
- **`obtenerEstadoCompartido(nombreUnico)`**: Conecta cualquier componente a un estado compartido ya registrado.
- **`listarEstadosCompartidos()`**: Devuelve un array auditable con todos los estados compartidos activos, su número de suscriptores, su `persistKey` y sus reglas de negocio.
- **`signal.derivar(fnCalculo)`**: Crea un `SignalDerivado` de solo lectura que se recalcula automáticamente solo cuando el `Signal` padre cambia (ej. filtrar anuncios activos o calcular un subtotal con IVA).
- **`crearEfecto(fn)`**: Rastrea automáticamente todos los Signals leídos con `.get()` dentro de `fn`, vuelve a ejecutarse cuando cualquiera de ellos muta y devuelve una función `detener()` para limpiar las suscripciones.
- **`vincularTexto(signal, nodoHtml, formateador)`**: Actualiza **únicamente `nodoHtml.textContent`** cuando cambia el Signal, conservando exactamente el mismo `TextNode` en memoria y previniendo vulnerabilidades XSS.

---

## 3. 🦀 Glosario de Protección de Memoria Estilo Rust (`rustGuard.js`)

- **Borrow Checker Inmutable (`&T` — `leerEstadoInmutable(signal)`)**: Devuelve el valor del Signal congelado recursivamente con `Object.freeze`. Si intentas hacer `lectura.propiedad = 'nuevo'` directamente sin pasar por el canal autorizado, lanza un `TypeError` inmediato evitando bugs silenciosos.
- **Préstamo Mutable con Auditoría (`&mut T` — `mutarEstadoConHistorial(signal, cambios, motivo)`)**: Modifica el estado de forma atómica, vuelve a congelar la nueva instantánea y registra en una bitácora auditable (`obtenerHistorialDeMutaciones(signal)`) la fecha, el valor anterior, el valor nuevo y el motivo del cambio.
- **Ownership & RAII `Drop` (`crearAmbitoConLimpiezaAutomatica(nombrePropietario)`)**: Patrón *Resource Acquisition Is Initialization*. El ámbito es dueño de todos los `.vincularSignalConLimpieza()`, `.ejecutarEfectoConLimpieza()`, `.escucharEventoDomConLimpieza()` y `.programarIntervaloConLimpieza()`. Cuando el componente sale del DOM (`disconnectedCallback`), una sola llamada a **`.liberarMemoriaCompleta()`** destruye el 100% de los recursos y bloquea cualquier uso posterior (*Use-After-Free*).

---

## 4. 🌐 Glosario de Estrategias de Renderizado Universal (`ssr.js` + `crudCategorias.js`)

- **Light DOM (Cero Shadow DOM)**: `mita-dom` prohíbe `attachShadow()`. Todos los Web Components renderizan sobre el DOM estándar del documento y aíslan su CSS usando la regla nativa `@scope (mi-componente) { ... }` de CSS3.
- **Render Condicional Real (`renderCondicional` / `renderizarSiSeCumpleCondicion`)**: En vez de ocultar paneles sensibles o formularios con `display: none` (lo cual deja nodos expuestos en el inspector del navegador y consume memoria), `mita-dom` **monta y destruye físicamente** los nodos del DOM cuando cambia la condición booleana.
- **`SSR` (Server-Side Rendering)**: El servidor Node.js ejecuta `onInit()` y `render()` en cada petición HTTP, entregando HTML completo con SEO (`MitaMeta.renderSSRHead()`).
- **`SSG` (Static Site Generation)**: El HTML se pre-genera en tiempo de compilación (*Build Time*) e inyecta `window.__MITA_SSG__ = true` para servir páginas instantáneas desde un CDN.
- **`Hybrid` + Arquitectura de Islas (`Islands Architecture`)**:
  - **`mita-server="only"`**: El componente se renderiza en el servidor y el navegador **jamás vuelve a ejecutar su `render()`**, ahorrando 100% de CPU en cabeceras o artículos estáticos.
  - **`mita-client="only"`**: El servidor vacía el interior de la etiqueta (`<mi-widget mita-client="only"></mi-widget>`) para que solo se monte e hidrate en el navegador del usuario.
- **`CSR / SPA` (Client-Side Rendering)**: El servidor entrega un contenedor ligero y el navegador renderiza toda la vista en el cliente (ideal para paneles privados `/admin`).
- **`crearControladorEstrategiaPorVista()`**: Permite activar, desactivar o cambiar en caliente el modo (`hybrid`, `ssr`, `ssg`, `csr`) de cualquier ruta específica (`/inicio`, `/empleos`, `/docs`, `/admin`).
