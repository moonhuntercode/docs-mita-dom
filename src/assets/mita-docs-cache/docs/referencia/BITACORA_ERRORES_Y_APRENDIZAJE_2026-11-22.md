# 🧠 Bitácora de Errores Reales y Cómo Aprende el Sistema (`mita-dom` v2.7 — 2026-11-22)

> **Principio de Ingeniería:** *"Cada bug encontrado en producción o laboratorio debe convertirse en una defensa automática dentro del núcleo de `mita-dom` y en un test de regresión permanente."*

---

## 1. 🔄 Error 1: Bucle Infinito `RangeError: Invalid array length` en `Signal.notificar()`

- **Qué ocurrió:** Cuando `crearEfecto()` se ejecutaba dentro de `Signal.notificar()`, el efecto limpiaba su suscripción previa (`Set.delete`) y volvía a suscribirse (`Set.add`) sobre el mismo `Set` mientras `this.suscriptores.forEach()` seguía iterando. En V8 (Node.js y Chrome), eliminar y re-insertar un elemento durante `Set.prototype.forEach` provoca un ciclo infinito.
- **Cómo aprendió la librería:**
  - En `src/core/signals.js`, `notificar()` ahora toma una instantánea estática inmutable antes de iterar: `Array.from(this.suscriptores).forEach(...)`.
  - Se agregó el test unitario permanente en `test/signals-v27.test.js` que encadena múltiples `crearEfecto()` y mutaciones consecutivas.

---

## 2. 🎨 Error 2: Colisión de Selectores Globales (`header`, `nav`, `main`, `footer`) en Light DOM

- **Qué ocurrió:** Al usar **Light DOM** (sin Shadow DOM) para máxima velocidad y compatibilidad CSS, las reglas globales en `src/style.css` que estilaban etiquetas desnudas (`header { position: sticky; grid-area: header; }` y `nav { flex-direction: column; }`) afectaron a todos los `<header>` y `<nav>` internos de las tarjetas del `/laboratorio` y `/docs`, rompiendo las vistas en Mobile y Desktop.
- **Cómo aprendió el sistema:**
  - **Regla de Oro Light DOM:** El layout global solo puede seleccionar IDs o hijos directos del shell (`header#main-header`, `main#app-container`, `body > footer`, `#sidebar > nav`).
  - Todos los componentes encapsulan sus estilos con `@scope (nombre-componente) { ... }` y `min-width: 0` + `overflow-wrap: anywhere` en bloques `<code>`.

---

## 3. 💧 Error 3: Fugas de Memoria (Memory Leaks) y Mutaciones Directas Silenciosas

- **Qué ocurrió:** En aplicaciones SPA grandes, era fácil cometer dos errores clásicos de JavaScript:
  1. Hacer `const user = estado.get(); user.rol = 'ADMIN';` mutando la referencia en memoria sin disparar reactividad ni validaciones.
  2. Registrar `signal.suscribir(...)` o `setInterval(...)` al montar una vista y olvidar desuscribirlos en `disconnectedCallback()`.
- **Cómo aprendió `mita-dom` (Robando el modelo de Rust 🦀):**
  - Se creó `src/core/rustGuard.js`:
    - **Borrow Checker Inmutable (`leerEstadoInmutable`)**: congela recursivamente los objetos (`Object.freeze`). Si alguien intenta `lectura.rol = 'ADMIN'`, recibe un `TypeError` inmediato en lugar de un bug silencioso.
    - **RAII Ownership & Auto-Drop (`crearAmbitoConLimpiezaAutomatica`)**: agrupa Signals, efectos, eventos DOM y timers bajo el componente propietario y los destruye al 100% con `.liberarMemoriaCompleta()`, bloqueando además cualquier intento de *Use-After-Free*.

---

## 4. 🖥️ Error 4: Caída en Node.js (SSR / SSG) por `HTMLElement is not defined`

- **Qué ocurrió:** Al importar componentes `MitaElement` en un servidor Node.js puro para SSR o SSG, Node fallaba inmediatamente porque `window` y `HTMLElement` solo existen en el navegador.
- **Cómo aprendió la librería:**
  - `src/core/mitaElement.js` define un *shim* isomórfico automático (`globalThis.HTMLElement = class {}`) cuando se ejecuta en Node.js.
  - `src/core/ssr.js` incorpora `renderizarVistaUniversal()` con soporte para **Islas** (`mita-client="only"` se vacía en el servidor; `mita-server="only"` omite `render()` en el cliente).

---

## 5. 🧪 Tabla Resumen: Error → Defensa Automática → Test

| Error Histórico | Defensa Integrada en `mita-dom` | Test que lo Vigila |
| --- | --- | --- |
| Ciclo infinito en `Set.forEach` | Snapshot `Array.from(this.suscriptores)` | `test/signals-v27.test.js` |
| Mutación directa `state.get().x = 1` | `leerEstadoInmutable()` (`Object.freeze` recursivo) | `test/rust-guard-y-cli.test.js` |
| Fuga de suscripciones/timers al desmontar | `crearAmbitoConLimpiezaAutomatica().liberarMemoriaCompleta()` | `test/rust-guard-y-cli.test.js` |
| Crash en Node.js SSR por `HTMLElement` | Shim isomórfico en `mitaElement.js` + `renderizarVistaUniversal` | `test/ssr-auth-cookies.test.js` |
| Enlaces `/docs/...` huérfanos sin `.md` | `scripts/sync-docs.js` + test de integridad de rutas | `test/integridad-rutas.test.js` |
