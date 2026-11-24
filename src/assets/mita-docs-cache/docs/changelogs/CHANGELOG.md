# 📜 Changelog Consolidado de MitaDOM (hasta v2.8.0)

> Auto-consolidado el `2026-11-24` desde `changelogs/*.md` mediante `npm run docs:auto`.

---

<!-- Fuente: changelogs/2026-11-24-v2.8.0.md -->
# 📝 Changelog v2.8.0 — 2026-11-24 (Ciclo de Vida Completo, Solid 2.0 Async Graph, `sinRastrear`, Subpath Exports y Laboratorios v2.8)

- **Fecha de lanzamiento oficial:** `2026-11-24`
- **Versión:** `v2.8.0` (SemVer **MINOR** — 100% retrocompatible con `v2.7.0`, `0` breaking changes)
- **Autor:** Victor Code (Bolivia) — `mita-dom`
- **Informe Técnico Complementario:** [INFORME_TECNICO_V2.8.0_2026-11-24.md](../docs/referencia/INFORME_TECNICO_V2.8.0_2026-11-24.md)
- **Laboratorio Interactivo:** `/laboratorio` (Lecciones **16** y **17** en vivo)

---

## 📊 Resumen Ejecutivo: `v2.7.0` vs `v2.8.0`

| Capacidad | `v2.7.0` (`2026-11-22`) | `v2.8.0` (`2026-11-24`) |
| :--- | :--- | :--- |
| **Ciclo de Vida `MitaElement`** | `render()` + `disconnectedCallback()` manual | Flujo completo garantizado: `alCrear()` → `alAntesDeRenderizar()` → `render()` (Error Boundary) → `alMontar()` → `alCambiarProp()` → `alActualizar()` → auto-limpieza + `alDesmontar()` + `obtenerCicloDeVida()` |
| **Reactividad Asíncrona** | `crearFetcherConCacheYEstados` (manual) | **Solid 2.0 Async Graph**: `crearMemoAsincrono()` (auto-cancela *race conditions* con `AbortSignal` + `LONG_HOLD`) + `crearEstadoVinculado()` (Angular 20 `linkedSignal`) |
| **Mutaciones y Streaming** | Server Actions simples | `crearEstadoOptimistaConRollback()` (React 19) + `crearFuncionServidor()` + `crearFuncionServidorEnVivo()` (`live()` `async function*` / SSE) |
| **Control de Rastreo y Logs** | Consola siempre verbosa en tests/CI | `sinRastrear(fn)` (`untrack`) contra bucles infinitos + **consola silenciosa por defecto** en `VITEST`/`CI`/`production` (`{ debug: true }` opcional) |
| **Estrategias de Render** | Configuración por objeto | Cambio en **1 línea**: `definirEstrategiaRenderRuta()` y `cambiarEstrategiaRender()` (`CSR`/`SSR`/`SSG`/`HYBRID`/`RESUMABLE`) |
| **Imports Granulares** | Solo entrada monolítica `'mita-dom'` | **8 Subpath Exports**: `mita-dom/signals`, `mita-dom/async`, `mita-dom/rust`, `mita-dom/ssr`, `mita-dom/props`, `mita-dom/element`, `mita-dom/ui`, `mita-dom/devtools` |
| **DX para Agentes IA** | Documentación humana únicamente | `emitirDiagnosticoAgente()` + `skills/reactivity-diagnostics/SKILL.md` empaquetada en NPM |
| **Build & Testing Ecosistema** | Terser + Legacy (`4.1s`, warnings) | Vite 8 Oxc nativo (`448ms`), Rolldown `codeSplitting` (`< 71 kB`), Vitest 5 `vmThreads`, `0` warnings |

---

## 🔄 Cambios Detallados con Ejemplos **Antes vs Después**

### 1. 🧬 Ciclo de Vida Unificado en `MitaElement` (`alCrear`, `render`, `alMontar`, `alCambiarProp`, `alDesmontar`)

Se unificó el ciclo de vida oficial para evitar dobles renders manuales y fugas de memoria. Además se agregaron `this.vincularTexto()`, `this.solicitarActualizacion(motivo)` y `this.obtenerCicloDeVida()`.

#### ❌ Antes (`v2.7.0`)
```js
import { MitaElement, crearEstadoLocal, vincularTexto } from 'mita-dom';

export class MiContador extends MitaElement {
  constructor() {
    super();
    this._limpiezas = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this.contador = crearEstadoLocal(0);
    this.innerHTML = '<button class="btn">0</button>';
    const stop = vincularTexto(this.contador, this.querySelector('.btn'), (n) => `Clics: ${n}`);
    this._limpiezas.push(stop);
  }

  disconnectedCallback() {
    this._limpiezas.forEach((fn) => fn());
    this.contador.destroy();
  }
}
```

#### ✅ Después (`v2.8.0`)
```js
import { MitaElement, crearEstadoLocal } from 'mita-dom';

export class MiContador extends MitaElement {
  static get observedAttributes() {
    return ['color-acento'];
  }

  // 1. Antes del DOM: inicializa Signals
  alCrear() {
    this.contador = crearEstadoLocal(0);
  }

  // 2. Pinta Light DOM una sola vez (protegido por Error Boundary automático)
  render() {
    this.innerHTML = '<button type="button" class="btn">0</button>';
  }

  // 3. DOM garantizado: enlaza texto y eventos con limpieza automática al desmontar
  alMontar() {
    this.vincularTexto(this.contador, '.btn', (n) => `Clics: ${n}`);

    const btn = this.querySelector('.btn');
    const alClick = () => this.contador.set(this.contador.get() + 1);
    btn?.addEventListener('click', alClick);
    this.registrarLimpieza(() => btn?.removeEventListener('click', alClick));
  }

  // 4. Reacción granular a atributos observados en camelCase
  alCambiarProp(prop, _antes, valorNuevo) {
    if (prop === 'colorAcento') {
      this.querySelector('.btn')?.style.setProperty('border-color', valorNuevo);
    }
  }

  // 5. Inspección instantánea de salud del ciclo de vida
  inspeccionar() {
    return this.obtenerCicloDeVida();
    // => { etiqueta: 'mi-contador', fase: 'montado', montado: true, renderizado: true, limpiezasPendientes: 2 }
  }

  // 6. Limpieza adicional opcional (todas las suscripciones registradas ya fueron liberadas)
  alDesmontar() {
    this.contador.destroy();
  }
}
```

---

### 2. ⚡ Solid 2.0 Async Graph (`crearMemoAsincrono`) + Angular 20 `linkedSignal` (`crearEstadoVinculado`)

Permite escribir cascadas asíncronas declarativas sin condiciones de carrera (*race conditions*), manteniendo el valor anterior (*stale*) mientras carga el nuevo y reiniciando selecciones hijas automáticamente cuando cambia el padre.

#### ❌ Antes (`v2.7.0`)
```js
let abortCtrl = null;
departamento.suscribir(async (dep) => {
  if (abortCtrl) abortCtrl.abort();
  abortCtrl = new AbortController();
  try {
    const res = await fetch(`/api/ciudades?dep=${dep}`, { signal: abortCtrl.signal });
    const lista = await res.json();
    ciudades.set(lista);
    ciudadActiva.set(lista[0] || '');
  } catch (err) {
    if (err.name !== 'AbortError') console.error(err);
  }
});
```

#### ✅ Después (`v2.8.0`)
```js
import { crearEstadoLocal } from 'mita-dom/signals';
import { crearMemoAsincrono, crearEstadoVinculado } from 'mita-dom/async';

const departamento = crearEstadoLocal('Santa Cruz');

// Cancela automáticamente requests viejos con AbortSignal y detecta LONG_HOLD
const ciudades = crearMemoAsincrono(
  async (signalAbort) => {
    const dep = departamento.get();
    const res = await fetch(`/api/ciudades?dep=${encodeURIComponent(dep)}`, { signal: signalAbort });
    return res.json();
  },
  { valorInicial: [], umbralEsperaProlongadaMs: 2500, nombre: 'ciudades:bolivia' }
);

// linkedSignal: seleccionable por el usuario, se resetea solo si cambia la lista padre
const ciudadActiva = crearEstadoVinculado(
  () => ciudades.estado.get().valor || [],
  (lista) => lista[0] || ''
);
```

---

### 3. 📡 Optimistic Rollback (React 19) + Live Server Functions (`async function*` / SSE)

Mutaciones instantáneas con reversión garantizada si el backend falla, y streams reactivos en tiempo real directos a Signals.

#### ❌ Antes (`v2.7.0`)
```js
const anterior = likes.get();
likes.set(anterior + 1);
try {
  const confirmado = await apiGuardarLike();
  likes.set(confirmado);
} catch (err) {
  likes.set(anterior); // Rollback manual repetido en cada botón
}
```

#### ✅ Después (`v2.8.0`)
```js
import {
  crearEstadoOptimistaConRollback,
  crearFuncionServidor,
  crearFuncionServidorEnVivo
} from 'mita-dom/async';

// 1. Optimistic UI + Rollback automático en caso de error de red/SQL
const likes = crearEstadoOptimistaConRollback(25);
await likes.aplicarConServidor(likes.valor() + 1, () => apiGuardarLike());

// 2. Server Function RPC con metadatos de servidor
const guardarPedido = crearFuncionServidor('pedidos/crear', async (payload) => {
  return { ok: true, id: Date.now(), ...payload };
});

// 3. Live Stream (async function* / SSE conectado a Signal)
const pedidosEnVivo = crearFuncionServidorEnVivo('cocina/pedidos', async function* () {
  yield '🧾 Pedido #208 recibido';
  yield '🔥 En parrilla (Keperí)';
  yield '✅ Listo para entregar';
});
await pedidosEnVivo.iniciar();
```

---

### 4. 🙈 `sinRastrear(fn)` (`untrack`) y Consola Silenciosa en Tests / Producción

Evita suscripciones accidentales dentro de `crearEfecto()` y mantiene las salidas de Vitest / CI / Producción 100% limpias sin truncamiento de logs.

#### ❌ Antes (`v2.7.0`)
```js
// Riesgo de bucle infinito si un efecto lee y muta el mismo Signal o lee un contador auxiliar
crearEfecto(() => {
  const total = filtro.get();
  const auditoria = contadorAuditoria.get(); // ❌ Suscribe el efecto también a contadorAuditoria
  contadorAuditoria.set(auditoria + 1);      // 💥 Auto-disparo / ruido en consola
});
```

#### ✅ Después (`v2.8.0`)
```js
import { crearEstadoLocal, crearEfecto, sinRastrear } from 'mita-dom/signals';

const filtro = crearEstadoLocal('remoto');
const contadorAuditoria = crearEstadoLocal(0);

// Solo se ejecuta cuando cambia `filtro`; leer/mutar `contadorAuditoria` NO dispara el efecto
const detener = crearEfecto(() => {
  const valorFiltro = filtro.get();
  sinRastrear(() => {
    contadorAuditoria.set(contadorAuditoria.get() + 1);
  });
  console.debug('Filtro aplicado:', valorFiltro);
});

// Consola silenciosa por defecto en VITEST/CI/production; activa trazas solo cuando las pidas:
const estadoConTraza = crearEstadoLocal(0, { debug: true });
```

---

### 5. 🌐 Cambio de Estrategia de Render en 1 Línea (`CSR` / `SSR` / `SSG` / `HYBRID` / `RESUMABLE`)

#### ❌ Antes (`v2.7.0`)
```js
// Requería crear e instanciar manualmente un controlador completo por ruta y reconfigurarlo
```

#### ✅ Después (`v2.8.0`)
```js
import { definirEstrategiaRenderRuta, cambiarEstrategiaRender } from 'mita-dom/async';

// Declaración inicial (1 línea)
definirEstrategiaRenderRuta('/empleos', 'SSR', { cacheSegundos: 60 });

// Cambio en caliente o por entorno (CSR | SSR | SSG | HYBRID | RESUMABLE)
const resultado = cambiarEstrategiaRender('/empleos', 'RESUMABLE', { cacheSegundos: 120 });
// resultado.detalles.servidorExpress => instrucciones listas para Express 5
```

---

### 6. 📦 Subpath Exports Granulares (Mejor Tree-Shaking y Organización)

#### ❌ Antes (`v2.7.0`)
```js
// Todo pasaba por el barril raíz:
import { crearEstadoLocal, crearEfecto } from 'mita-dom';
```

#### ✅ Después (`v2.8.0` — compatible con ambos estilos)
```js
import { crearEstadoLocal, crearEfecto, sinRastrear } from 'mita-dom/signals';
import { crearMemoAsincrono, crearEstadoVinculado, cambiarEstrategiaRender } from 'mita-dom/async';
import { MitaElement } from 'mita-dom/element';
import { crearEstadoReactivoInmutable, crearAmbitoConLimpiezaAutomatica } from 'mita-dom/rust';
import { renderizarVistaUniversal, MitaMeta } from 'mita-dom/ssr';
import { pasarPropsAElemento, leerPropsDeElemento } from 'mita-dom/props';
import { crearControladorPaginacion, crearFormularioReactivoConSignals } from 'mita-dom/ui';
import { ejecutarConsejeroMitaDoc, calcularRecomendacionSemVer } from 'mita-dom/devtools';
```

---

### 7. 🤖 Built to Be Written by Agents (`emitirDiagnosticoAgente` + `SKILL.md`)

```js
import { emitirDiagnosticoAgente } from 'mita-dom/async';

const diag = emitirDiagnosticoAgente('MITA_LECTURA_SIN_RASTREO', {
  origen: '<mi-tarjeta> -> render()',
  silencioso: true
});
// => { codigo: 'MITA_LECTURA_SIN_RASTREO', solucion: '...', guiaAgente: 'skills/reactivity-diagnostics/SKILL.md' }
```

---

## 🧪 Verificación QA Real (`2026-11-24`)

- **`mita-dom@2.8.0`**: `69/69` tests en verde (`11` suites), `0` errores ESLint, `0` errores Stylelint, `npm pack --dry-run` limpio (`skills/`, `bin/`, `types/`, `dist/`).
- **`docs-mita-dom` (`example-mita-spa-01-js@2.8.0`)**: `17` laboratorios interactivos vivos, Vite 8 Oxc build `< 500ms`, Rolldown `codeSplitting` (`index.js` `< 75 kB`), `0` warnings de bundle, `0` warnings de Vitest `vmThreads`, `npm run test:vercel` 100% paridad NPM.

---

<!-- Fuente: changelogs/2026-11-22-v2.7.0.md -->
# 📝 Changelog v2.7.0 — 2026-11-22 (Claridad, Estado Compartido y Auto-Limpieza)

- **Fecha de lanzamiento:** `2026-11-22`
- **Autor:** Victor Code (Bolivia) — `mita-dom`
- **Enfoque:** Hacer que crear estados, compartir datos entre varios componentes y renderizar UI condicional sea **explícito, legible, libre de memory leaks y fácil de aprender** (aunque sea ligeramente más verboso cuando aporta claridad).

---

## 📊 Resumen Comparativo: Antes (`v2.6.0`) vs Ahora (`v2.7.0`)

| Necesidad | Antes (`v2.6.0`) | Ahora (`v2.7.0`) |
| --- | --- | --- |
| Reaccionar a varios Signals a la vez | Múltiples `.suscribir()` manuales + desuscribir uno por uno | `const detener = crearEfecto(() => { ... })` con auto-rastreo |
| Compartir datos entre 2+ componentes | Exportar variables sueltas o pasar props / imports circulares | `crearEstadoCompartido('nombre', valor, { persistirLocal, descripcion, reglas })` + `obtenerEstadoCompartido('nombre')` |
| Auditar estados locales en Admin | No existía inventario central | `listarEstadosCompartidos()` retorna nombre, reglas, clave `localStorage` y suscriptores |
| Estado calculado fluido | `new SignalDerivado(sig, fn)` (y `.derivar()` faltaba en runtime) | `const total = items.derivar((arr) => ...)` |
| Cancelar una suscripción | Guardar referencia a la función para `desuscribir(fn)` | `const salir = sig.suscribir(cb); salir();` |
| Render condicional legible | 5 parámetros posicionales difíciles de recordar | `renderCondicional({ estado, contenedor, cuando, mostrar, sino })` + cleanup |
| Cambiar solo texto sin XSS | `sig.suscribir((v) => { nodo.textContent = v; })` | `vincularTexto(sig, nodo, (v) => ...)` |
| Limpieza en Web Components | Escribir `disconnectedCallback()` repetitivo en cada clase | `this.escucharEstado()`, `this.mostrarSi()`, `this.registrarLimpieza()` (auto-limpieza) |

---

## ✨ Detalle de Mejoras con Ejemplos (Antes vs Después)

### 1. `crearEfecto(fn)` — Auto-rastreo de dependencias + función `detener()`

Cualquier `signal.get()` ejecutado dentro de `crearEfecto()` se suscribe automáticamente. Al invocar `detener()`, se liberan todas las suscripciones sin fugas de memoria.

```js
// ❌ ANTES (v2.6.0): suscripción manual duplicada por cada Signal
const recalcular = () => {
  totalEl.textContent = `Bs. ${precio.get() * cantidad.get()}`;
};
precio.suscribir(recalcular);
cantidad.suscribir(recalcular);
// Y luego debías recordar desuscribir ambos manualmente:
precio.desuscribir(recalcular);
cantidad.desuscribir(recalcular);

// ✅ AHORA (v2.7.0): 1 solo efecto limpio con limpieza automática
import { crearEstadoLocal, crearEfecto } from 'mita-dom';

const precio = crearEstadoLocal(35);
const cantidad = crearEstadoLocal(2);

const detener = crearEfecto(() => {
  totalEl.textContent = `Bs. ${precio.get() * cantidad.get()}`;
});

cantidad.set(4); // Re-ejecuta automáticamente -> "Bs. 140"
detener();       // Libera ambos Signals de una sola vez
```

---

### 2. Estados Compartidos entre 2 o más Componentes (`crearEstadoCompartido` / `obtenerEstadoCompartido` / `listarEstadosCompartidos` / `eliminarEstadoCompartido`)

Resuelve el patrón más común en aplicaciones reales (por ejemplo: un **Panel de Administración** controlando un **Tablón de Anuncios de Empleo** y un **Componente de KPIs**).

```js
// Paso 1: Definir el estado compartido (ej: src/store/empleosStore.js)
import { crearEstadoCompartido } from 'mita-dom';

export const configEmpleos = crearEstadoCompartido(
  'empleos:configuracion',
  {
    habilitado: true,
    requiereLogin: false,
    terminosCondiciones: 'Oferta laboral real según normativa boliviana.'
  },
  {
    persistirLocal: true, // Guarda en localStorage["mita_estado_empleos:configuracion"]
    descripcion: 'Controla visibilidad, términos y reglas del módulo de empleos.',
    reglas: 'Lectura pública; modificación exclusiva del rol ADMIN.'
  }
);

// Paso 2: Componente A (Admin) muta el estado compartido sin importar referencias internas
import { obtenerEstadoCompartido } from 'mita-dom';

const cfgAdmin = obtenerEstadoCompartido('empleos:configuracion');
cfgAdmin.patch({ habilitado: false });

// Paso 3: Componente B (Tablón Público) reacciona instantáneamente
const cfgPublico = obtenerEstadoCompartido('empleos:configuracion');
const salir = cfgPublico.suscribir((estado) => {
  console.log('¿Módulo habilitado?:', estado.habilitado);
});

// Paso 4: Auditoría en vivo desde la sección de Administración
import { listarEstadosCompartidos } from 'mita-dom';
console.table(listarEstadosCompartidos());
```

---

### 3. `Signal.prototype.derivar(fn)` — Estados Calculados de Solo Lectura

Método fluido implementado directamente en `Signal` (antes declarado en tipos pero ausente en runtime).

```js
import { crearEstadoLocal } from 'mita-dom';

const anuncios = crearEstadoLocal([
  { id: 1, titulo: 'Cocinero', estado: 'activo' },
  { id: 2, titulo: 'Mesero', estado: 'pausado' }
]);

// Se recalcula SOLO cuando cambia `anuncios` y bloquea mutaciones manuales (.set() lanza Error)
const totalActivos = anuncios.derivar(
  (lista) => lista.filter((item) => item.estado === 'activo').length
);

console.log(totalActivos.get()); // 1
anuncios.set([...anuncios.get(), { id: 3, titulo: 'Cajero', estado: 'activo' }]);
console.log(totalActivos.get()); // 2
```

---

### 4. `Signal.prototype.suscribir(callback)` ahora retorna `desuscribir()`

```js
// ❌ ANTES
const onCambio = (val) => console.log(val);
miSignal.suscribir(onCambio);
miSignal.desuscribir(onCambio);

// ✅ AHORA
const desuscribir = miSignal.suscribir((val) => console.log(val));
desuscribir(); // Limpieza directa en una línea
```

---

### 5. `renderCondicional` Declarativo + Limpieza (`detener()`)

Monta y destruye nodos reales del DOM (sin `display: none`) cuando cambia la evaluación booleana. Mantiene 100% compatibilidad con la firma posicional de 5 argumentos.

```js
// ❌ ANTES (5 argumentos posicionales difíciles de leer)
renderCondicional(configEmpleos, nodo, (c) => c.habilitado, () => `<form>...</form>`, () => `<p>Pausado</p>`);

// ✅ AHORA (Objeto declarativo legible + recibe `state` + retorna función de limpieza)
import { renderCondicional } from 'mita-dom';

const detener = renderCondicional({
  estado: configEmpleos,
  contenedor: this.querySelector('#zona-formulario'),
  cuando: (cfg) => cfg.habilitado === true,
  mostrar: (cfg) => `<form><p>${cfg.terminosCondiciones}</p><button>Publicar</button></form>`,
  sino: () => `<p>Módulo desactivado temporalmente por administración.</p>`,
  siempreActualizar: false // opcional: poner true si quieres re-renderizar al cambiar texto dentro del mismo estado booleano
});
```

---

### 6. `vincularTexto(signal, nodo, formateador)` — Granular Light DOM Seguro

Actualiza únicamente `textContent` preservando exactamente el mismo nodo en memoria y eliminando riesgo XSS.

```js
import { crearEstadoLocal, vincularTexto } from 'mita-dom';

const visitas = crearEstadoLocal(0);
const detenerTexto = vincularTexto(
  visitas,
  document.querySelector('#contador-visitas'),
  (n) => `Visitas registradas: ${n}`
);

visitas.set(15); // Muta SOLO el TextNode -> "Visitas registradas: 15"
detenerTexto();
```

---

### 7. `MitaElement`: `registrarLimpieza()`, `escucharEstado()` y `mostrarSi()`

Evita fugas de memoria por diseño: todo lo registrado con estos métodos se desuscribe automáticamente en `disconnectedCallback()`.

```js
import { MitaElement, obtenerEstadoCompartido } from 'mita-dom';

export class PanelAnuncios extends MitaElement {
  alMontar() {
    const config = obtenerEstadoCompartido('empleos:configuracion');
    this.innerHTML = `<section id="zona-anuncios"></section>`;

    // Auto-desuscrito al salir del DOM (0 boilerplate en alDesmontar)
    this.mostrarSi({
      estado: config,
      contenedor: this.querySelector('#zona-anuncios'),
      cuando: (cfg) => cfg.habilitado,
      mostrar: () => `<form id="form-empleo">Formulario Activo</form>`,
      sino: () => `<p>Módulo pausado por Admin.</p>`
    });
  }
}
```

---

## 🐛 Correcciones Técnicas Críticas

- **Prevención de bucle infinito en `Signal.notificar()`:** al recorrer suscriptores sobre `Array.from(this.suscriptores)` en lugar de iterar directamente el `Set`, se elimina el loop infinito de JavaScript cuando `crearEfecto()` limpia y vuelve a registrar dependencias dentro de una notificación.
- **Sincronización de tipos TypeScript (`types/index.d.ts`):** actualizadas todas las firmas de `Signal`, `SignalDerivado`, `crearEfecto`, estados compartidos, `renderCondicional`, `vincularTexto` y `MitaElement`.

---

## 📚 Documentación Relacionada

- Informe completo con fecha de hoy: `docs/referencia/INFORME_ESTADOS_Y_SIGNALS_2026-11-22.md`
- Tutorial Maestro, Checklist, Casos de Uso y Seguimiento: `docs/referencia/TUTORIAL_MAESTRO_CHECKLIST_Y_SEGUIMIENTO_2026-11-22.md`
- Bitácora de Errores y Aprendizaje del Sistema: `docs/referencia/BITACORA_ERRORES_Y_APRENDIZAJE_2026-11-22.md`
- Guía de CLI `npx mita` y Rust Memory Guard: `docs/referencia/GUIA_CLI_Y_RUST_MEMORY_GUARD_2026-11-22.md`
- Guía de SSR, SSG, Hybrid, Auth FormBuilder y Cookies: `docs/referencia/GUIA_RENDER_SSR_SSG_AUTH_Y_COOKIES_2026-11-22.md`
- Referencia auto-generada desde el código fuente: `docs/referencia/AUTO_API_REFERENCIA.md`
- Suites de pruebas de esta versión: `test/signals-v27.test.js`, `test/chat-y-filtros.test.js`, `test/ssr-auth-cookies.test.js`, `test/rust-guard-y-cli.test.js`

---

### 8. Protección de Memoria Estilo Rust (`rustGuard.js`) + Sintaxis Verbosa Ultra-Clara

- **`crearEstadoReactivoInmutable` + `leerEstadoInmutable` (`&T`) + `mutarEstadoConHistorial` (`&mut T`)**: congela instantáneas con `Object.freeze` recursivo para bloquear mutaciones directas accidentales y guarda historial auditable con motivo de cambio.
- **`crearAmbitoConLimpiezaAutomatica` (RAII `Drop`)**: agrupa suscripciones, efectos, listeners DOM e intervalos y los destruye con `.liberarMemoriaCompleta()`, bloqueando *Use-After-Free*.
- **`simularComandoCliMita` + `bin/mita.js`**: generador de componentes, stores, páginas universales y diagnóstico `npx mita doctor`.
- **`crearGestorConsentimiento` Auto-Administrable**: incluye `actualizarTerminosYPoliticas()`, `exportarSnapshotNube()` e `importarSnapshotNube()`.

---

### 9. Estrategias Universales de Renderizado (`ssr.js`) + Auth `FormBuilder` (`formBuilder.js`)

- **`renderizarVistaUniversal()` + `MitaMeta`**: soporte unificado para estrategias `CSR`, `SSR`, `SSG` e `Hybrid` con Islas (`mita-client="only"` / `mita-server="only"`) e hidratación selectiva.
- **`crearFormularioAuth()` + `crearControlSpam()`**: formularios accesibles con validación por campo, bloqueo anti-spam con cooldown, detección de enlaces/duplicados y filtro de palabras prohibidas.

---

### 10. UI Paginación, Data Fetching, Chat Gate (3s) y Moderación (`uiModeracionYComunidad.js`)

- **`crearPaginadorReactivo()` + `crearRecursoPaginado()`**: paginación declarativa con caché LRU y prefetch inteligente para minimizar lecturas innecesarias a base de datos.
- **`crearGestorComunidadYModeracion()`**: usuarios invitados sin registro previo, huella persistente local, modal de aceptación de normas para entrar a chat/grupos con cuenta regresiva de 3 segundos, prohibición case-insensitive de anuncios con palabras clave (como `"DC"` / `"dc"`), baneo individual y cola de aprobación manual ON/OFF.

---

### 11. Framework Opinionado: Props Reactivas, `@defer` y Signal Forms (`propsYDefer.js`)

- **`pasarPropsAElemento()` / `leerPropsDeElemento()` + `obtenerUrlImagenCientifico()`**: paso de objetos complejos (inspirado en `react.dev/learn/passing-props-to-a-component`) sobre Light DOM nativo.
- **`renderizarVistaDiferida()` (`@defer`) y `crearFormularioReactivoConSignals()`**: carga diferida por viewport/interacción/idle con estados `placeholder`/`loading`/`error` y formularios reactivos por campo (inspirados en Angular Signals).

---

### 12. CRUD Multi-Categoría, Fullstack Express+ORM y Herramientas Dev (`crudCategorias.js`, `fullstackYDevtools.js`)

- **`crearGestorCrudMultiCategoria()` + `crearGestorEstrategiaPorVista()`**: CRUD completo multi-categoría con control granular de estrategia de render por ruta.
- **`crearAccionServidorExpress()` + `crearRecursoFetchControlado()`**: Server Actions con diferenciación explícita entre petición manual por clic vs carga automática, más `analizarSaludDocumentacionMita()`, `calcularRecomendacionSemVer()`, `crearGestorBitacoraPorHora()` y `PALETAS_CSS3_MITA`.

---

### 13. Optimización de Empaquetado NPM (`package.json`)

- Inclusión explícita de `bin/` (`npx mita`), `types/index.d.ts` y `skills/reactivity-diagnostics/SKILL.md` en `"files"`.
- Exclusión de assets pesados no utilizados (`src/svg/**`) y pruebas internas (`src/**/*.test.js`), reduciendo el tarball NPM en ~85%.

---

### 14. Ciclo de Vida Completo `MitaElement` + Async Graph (`Solid 2.0`, `Angular 20`, `React 19`, `Vue Vapor`, `Qwik`)

- **`MitaElement` unificado y legible:** orden garantizado `alCrear()` → `alAntesDeRenderizar()` → `render()` (con Error Boundary `fallbackUI`/`alError`) → `alMontar()` → `alCambiarProp()` / `alCambiarAtributo()` → `alActualizar()` → Auto-Limpieza + `alDesmontar()`, más `this.vincularTexto()`, `this.solicitarActualizacion()` y `this.obtenerCicloDeVida()`.
- **`src/core/asyncGraph.js`:** `crearMemoAsincrono()` (Solid 2.0 Async Graph + cancelación de race conditions + `LONG_HOLD`), `crearEstadoVinculado()` (Angular 20 `linkedSignal`), `crearEstadoOptimistaConRollback()` (React 19 / Solid 2.0), `crearFuncionServidor()`, `crearFuncionServidorEnVivo()` (`live()` `async function*` SSE), `definirEstrategiaRenderRuta()` / `cambiarEstrategiaRender()` en 1 línea (`CSR`, `SSR`, `SSG`, `HYBRID`, `RESUMABLE`) y `emitirDiagnosticoAgente()` con Agent Repair Guide `skills/reactivity-diagnostics/SKILL.md`.
- **Documentación Nueva:** `GUIA_CICLO_DE_VIDA_Y_SOLID2_ASYNC_GRAPH_2026-11-23.md`, `GUIA_EXPRESS_ROUTING_DATA_FETCHING_Y_ALIAS_FOOD_SHOW_2026-11-23.md` y `GUIA_GIT_FLOW_PR_GH_CLI_Y_RELEASE_ECOSISTEMA_2026-11-23.md`.

---

### 15. `sinRastrear()` (`untrack`), Corrección de Bucle `LONG_HOLD`, Router sin `EnvironmentTeardownError` y Referencia estilo `react.dev/reference/react`

- **`sinRastrear(fn)` en `src/core/signals.js`:** permite leer/mutar estados internos dentro de `crearEfecto()` sin auto-suscribirse (equivalente a `untrack()` de SolidJS).
- **Fix Crítico en `crearMemoAsincrono()`:** al envolver los `estado.patch()` internos en `sinRastrear()`, se eliminó el bucle de re-ejecución cuando `timerLongHold` marcaba `esperaProlongada: true`.
- **Auto-Documentación Categorizada (`scripts/auto-docs.js`) + Glosario A–Z:** `AUTO_API_REFERENCIA.md` ahora agrupa los 22 módulos por categorías estilo `react.dev/reference/react` con mapa rápido de equivalencias, sección **Para Profundizar** y nueva guía `REFERENCIA_COMPLETA_REACT_A_MITADOM_GLOSARIO_Y_PROFUNDIZACION_2026-11-23.md`.
- **Code Splitting Vite 8 / Rolldown (Cero Warnings `> 500 kB`):** documentado el patrón de carga diferida + `rolldownOptions.output.codeSplitting` + verificación automática `test:bundle` sin alterar `chunkSizeWarningLimit`.
- **Subpath Exports + Consola Limpia en Tests/Prod + CI GitHub Actions:** exportados `mita-dom/signals`, `mita-dom/async`, `mita-dom/rust`, `mita-dom/ssr`, `mita-dom/props`, `mita-dom/element`, `mita-dom/ui` y `mita-dom/devtools`; logs de `crearEstadoLocal`/`crearEstadoGlobal` silenciados automáticamente en test/CI/producción (opt-in `{ debug: true }`); añadido `.github/workflows/ci.yml`.
- **Vite 8 Oxc Nativo (`[PLUGIN_TIMINGS]`):** documentado por qué cambiar `minify: 'terser'` → `minify: true` (Oxc en Rust) y activar `@vitejs/plugin-legacy` bajo demanda (`MITA_LEGACY=true`) acelera el build y elimina el aviso de callbacks JS lentos.

---

<!-- Fuente: changelogs/2026-09-08-v2.6.0.md -->
# v2.6.0 (2026-09-08) - "Titanium Core: Profiler & Resilience"

## 🚀 Nuevas Funcionalidades (Features)
- **Patrón "Result" Nativo (Rust/Go style):** Hemos introducido `mitaResult` para manejar el flujo asíncrono y síncrono de los ciclos de vida del Web Component sin depender de frágiles `try/catch`. Ahora tu DOM no explotará si un componente falla al renderizar.
- **Error Boundaries Robustos:** Los componentes ahora interceptan automáticamente fallos de renderizado aislando la vista fallida en un `Fallback UI` inyectado en Shadow DOM sin tumbar toda tu SPA.
- **Mita Telemetry & Local Profiler:** 
  - Se agregó soporte para batching de telemetría de rendimiento y errores en `localStorage` con huella "Zero-Network" para no afectar usuarios con conexiones 3G.
  - Nuevo comando en consola `mita.profile()`: Diagnostica rápidamente interacciones lentas (>50ms) y cuellos de botella en la renderización de la SPA.
- **Event Delegation Automático:** MitaDOM ahora mide silenciosamente cada click y evento del DOM, permitiendo detectar cuellos de botella reales sin modificar tu código fuente (solo disponible al importar `telemetry`).

## 🛠️ Correcciones y Mejoras de DX (Fixes & Chores)
- **Linter Integrado (DX):** Agregados `console.warn` inteligentes si MitaDOM detecta anti-patrones como abuso de `innerHTML` o renders por debajo de 50ms repetitivos.
- **Limpieza Interna:** Removidas las referencias huérfanas como `options` en la sobrecarga prohibida de `attachShadow()`.
- **Simplificación del Fallback UI:** Se eliminó el botón "Copiar Error" del fallback por defecto para mantener la ligereza del Framework (<7kB gzip).
- Mejorada la advertencia nativa que prohíbe el uso de `Shadow DOM` para mantener la Triada de CSS (Light DOM + `@scope`).

## ⚠️ Notas de Actualización
No hay "Breaking Changes" directos en la API de exportación (se mantiene compatibilidad hacia atrás), pero el comportamiento por defecto de errores asíncronos no capturados dentro de componentes mutará silenciosamente a una vista *Fallback* en lugar de crashear el stack trace de la app.

---

<!-- Fuente: changelogs/2026-09-08-v2.5.3.md -->
# 📝 Registro de Cambios - v2.5.3 (2026-09-08)

## 🚀 Novedades (Production Ready)
- Refactorización de la Documentación (División Aprende vs Referencia).
- Nuevo Profiler de Interacción: Medición de Latencia de Botones (INP).
- Sistema de Control de Acceso Granular (Vistas Ocultas).
- Nuevos Componentes UI: `<mita-code-editor>` y `<mita-loader>`.

## 🐛 Corrección de Errores (Codebase Fixes)
- [Router] Corregido error crítico de bloqueo al fallar la carga lazy de chunks.
- [MitaElement] Integración de `try/catch` para Error Boundaries locales y prevención de caída del DOM tree.
- [Profiler] Optimización de almacenamiento en `estadoProfiler` para separar `renderizados` de `interacciones` y evitar saturación de memoria.

## 🛠️ Modificaciones Arquitectónicas
- Migración de `ComputedSignal` a `SignalDerivado` para mejorar claridad semántica.
- Re-estructuración del directorio de `docs/` copiando los estándares de la industria.

---
*Generado automáticamente mediante `npm run changelog`*

---

<!-- Fuente: changelogs/2026-08-26-v2.5.2.md -->
# 📝 Registro de Cambios - v2.5.2 (2026-08-26)

## 🚀 Novedades (Production Ready)
- Refactorización de la Documentación (División Aprende vs Referencia).
- Nuevo Profiler de Interacción: Medición de Latencia de Botones (INP).
- Sistema de Control de Acceso Granular (Vistas Ocultas).
- Nuevos Componentes UI: `<mita-code-editor>` y `<mita-loader>`.

## 🐛 Corrección de Errores (Codebase Fixes)
- [Router] Corregido error crítico de bloqueo al fallar la carga lazy de chunks.
- [MitaElement] Integración de `try/catch` para Error Boundaries locales y prevención de caída del DOM tree.
- [Profiler] Optimización de almacenamiento en `estadoProfiler` para separar `renderizados` de `interacciones` y evitar saturación de memoria.

## 🛠️ Modificaciones Arquitectónicas
- Migración de `ComputedSignal` a `SignalDerivado` para mejorar claridad semántica.
- Re-estructuración del directorio de `docs/` copiando los estándares de la industria.

---
*Generado automáticamente mediante `npm run changelog`*

---

<!-- Fuente: changelogs/2026-08-26-v2.5.0.md -->
# 📝 Registro de Cambios - v2.5.0 (2026-08-26)

## 🚀 Novedades (Production Ready)
- Refactorización de la Documentación (División Aprende vs Referencia).
- Nuevo Profiler de Interacción: Medición de Latencia de Botones (INP).
- Sistema de Control de Acceso Granular (Vistas Ocultas).
- Nuevos Componentes UI: `<mita-code-editor>` y `<mita-loader>`.

## 🐛 Corrección de Errores (Codebase Fixes)
- [Router] Corregido error crítico de bloqueo al fallar la carga lazy de chunks.
- [MitaElement] Integración de `try/catch` para Error Boundaries locales y prevención de caída del DOM tree.
- [Profiler] Optimización de almacenamiento en `estadoProfiler` para separar `renderizados` de `interacciones` y evitar saturación de memoria.

## 🛠️ Modificaciones Arquitectónicas
- Migración de `ComputedSignal` a `SignalDerivado` para mejorar claridad semántica.
- Re-estructuración del directorio de `docs/` copiando los estándares de la industria.

---
*Generado automáticamente mediante `npm run changelog`*

---

<!-- Fuente: changelogs/2026-06-14-v2.3.0.md -->
# 📝 Registro de Cambios - v2.3.0 (2026-06-14)

## 🚀 Novedades (Production Ready)
- Refactorización de la Documentación (División Aprende vs Referencia).
- Nuevo Profiler de Interacción: Medición de Latencia de Botones (INP).
- Sistema de Control de Acceso Granular (Vistas Ocultas).
- Nuevos Componentes UI: `<mita-code-editor>` y `<mita-loader>`.

## 🐛 Corrección de Errores (Codebase Fixes)
- [Router] Corregido error crítico de bloqueo al fallar la carga lazy de chunks.
- [MitaElement] Integración de `try/catch` para Error Boundaries locales y prevención de caída del DOM tree.
- [Profiler] Optimización de almacenamiento en `estadoProfiler` para separar `renderizados` de `interacciones` y evitar saturación de memoria.

## 🛠️ Modificaciones Arquitectónicas
- Migración de `ComputedSignal` a `SignalDerivado` para mejorar claridad semántica.
- Re-estructuración del directorio de `docs/` copiando los estándares de la industria.

---
*Generado automáticamente mediante `npm run changelog`*
