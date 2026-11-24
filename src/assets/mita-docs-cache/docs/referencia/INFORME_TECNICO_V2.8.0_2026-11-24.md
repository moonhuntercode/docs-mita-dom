# 📘 Informe Técnico Oficial MitaDOM `v2.8.0` — Sintaxis, Arquitectura y 17 Laboratorios

- **Fecha del Informe:** `2026-11-24`
- **Versión Documentada:** `mita-dom@2.8.0` (publicada en NPM) + `docs-mita-dom@2.8.0` + `food-show-1@2.2.0`
- **Estado QA:** `100% Verde` (`0` errores ESLint/Stylelint/CSS muerto, `0` warnings Vite/Vitest/NPM)
- **Changelog Relacionado:** [changelogs/2026-11-24-v2.8.0.md](../../changelogs/2026-11-24-v2.8.0.md)

---

## 1. 🎯 Resumen de Arquitectura y Métricas Reales (`2026-11-24`)

MitaDOM `v2.8.0` consolida lo mejor de **Solid 2.0**, **Angular 20**, **React 19**, **Qwik** y **Rust** sobre **Web Components Nativos en Light DOM** con `0` dependencias de runtime y CSS3 puro (`@scope` + Grid Mobile-First).

| Indicador Técnico | Resultado Verificado (`2026-11-24`) | Mejora Respecto a `v2.7.0` |
| :--- | :--- | :--- |
| **Bundle Core (`mita-dom/dist/mita-dom.js`)** | `141.54 kB` (`41.55 kB` gzip) | `0` dependencias externas, `8` Subpath Exports tree-shakeables |
| **Build SPA (`docs-mita-dom` con Vite 8 Oxc)** | `~448 ms` | **9x más rápido** (antes `4.1s` con Terser + `@vitejs/plugin-legacy`) |
| **Chunk Principal SPA (`index.js`)** | `~70 kB` (`~22 kB` gzip) | **-85% de peso** (antes `493.78 kB` monolítico; `0` warnings `> 500 kB`) |
| **Dependencias Eliminadas (SPA)** | `-139` paquetes | Eliminados `terser`, `@vitejs/plugin-legacy` y `core-js@3.51.0` (`0` warnings) |
| **Suite de Tests (`mita-dom`)** | `69/69` tests (`11` suites) | Incluye ciclo de vida completo, Async Graph, `sinRastrear` y consola silenciosa |
| **Suite de Tests (`docs-mita-dom`)** | `12/12` suites (`Vitest 5 vmThreads`) | `0` warnings `jsdom created N times`, `0` `EnvironmentTeardownError` |
| **Paridad Producción Vercel** | `npm run test:vercel` (`100%`) | Verifica cada símbolo importado en `src/` contra `node_modules/mita-dom` |

---

## 2. 🧩 Guía Completa de Sintaxis `v2.8.0` (Copiar y Pegar)

### 2.1. Imports Granulares por Subpath Exports

Puedes seguir importando todo desde `'mita-dom'` o usar los **8 Subpath Exports oficiales** para máxima claridad y tree-shaking:

```js
// 1. Signals, Efectos y Control de Rastreo
import {
  crearEstadoLocal,
  crearEstadoCompartido,
  obtenerEstadoCompartido,
  listarEstadosCompartidos,
  crearEfecto,
  sinRastrear,
  vincularTexto,
  renderCondicional
} from 'mita-dom/signals';

// 2. Solid 2.0 Async Graph, Angular linkedSignal, React 19 Optimistic, Estrategias 1-Línea y Agentes IA
import {
  crearMemoAsincrono,
  crearEstadoVinculado,
  crearEstadoOptimistaConRollback,
  crearFuncionServidor,
  crearFuncionServidorEnVivo,
  definirEstrategiaRenderRuta,
  cambiarEstrategiaRender,
  emitirDiagnosticoAgente
} from 'mita-dom/async';

// 3. Clase Base con Ciclo de Vida Completo (Light DOM + Error Boundary)
import { MitaElement } from 'mita-dom/element';

// 4. Protección de Memoria Estilo Rust (Borrow Checker + RAII Drop)
import {
  crearEstadoReactivoInmutable,
  leerEstadoInmutable,
  mutarEstadoConHistorial,
  crearAmbitoConLimpiezaAutomatica
} from 'mita-dom/rust';

// 5. Render Universal (SSR / SSG / Hybrid Islands / CSR) y Metadatos SEO
import { renderizarVistaUniversal, MitaMeta } from 'mita-dom/ssr';

// 6. Motor de Props para Web Components (React.dev)
import { pasarPropsAElemento, leerPropsDeElemento } from 'mita-dom/props';

// 7. Controles UI, @defer, Signal Forms, Paginación, Auth, Chat y Moderación
import {
  renderizarVistaDiferida,
  crearFormularioReactivoConSignals,
  crearControladorPaginacion,
  crearControladorFetchingPorModo,
  crearControladorAuth,
  crearGestorConsentimiento
} from 'mita-dom/ui';

// 8. DevTools, Profiler, Mita Doc Advisor y SemVer Advisor
import {
  ejecutarConsejeroMitaDoc,
  calcularRecomendacionSemVer
} from 'mita-dom/devtools';
```

### 2.2. Anatomía Oficial de un Componente (`MitaElement` v2.8.0)

```js
import { MitaElement } from 'mita-dom/element';
import { crearEstadoLocal, crearEfecto, sinRastrear } from 'mita-dom/signals';
import html from './tarjeta-empleo.html?raw';
import './tarjeta-empleo.css';

export class TarjetaEmpleo extends MitaElement {
  static get observedAttributes() {
    return ['titulo', 'destacado'];
  }

  // Fase 1: Constructor (crea Signals; aún no existe DOM hijo)
  alCrear() {
    this.postulaciones = crearEstadoLocal(0);
    this.auditoriaInterna = crearEstadoLocal(0);
  }

  // Fase 2 (opcional): Validación previa al pintado
  alAntesDeRenderizar() {
    this.setAttribute('role', 'article');
  }

  // Fase 3: Pinta Light DOM una sola vez (envuelto en Error Boundary automático)
  render() {
    this.innerHTML = html;
  }

  // Fase 4: DOM listo — enlaza TextNodes, efectos y listeners (auto-limpiados)
  alMontar() {
    this.vincularTexto(this.postulaciones, '.out-postulaciones', (n) => `${n} postulantes`);

    const stopEfecto = crearEfecto(() => {
      const total = this.postulaciones.get();
      // sinRastrear evita que mutar auditoriaInterna vuelva a disparar este efecto
      sinRastrear(() => {
        this.auditoriaInterna.set(this.auditoriaInterna.get() + 1);
      });
      this.dataset.postulaciones = String(total);
    });
    this.registrarLimpieza(stopEfecto);

    const btn = this.querySelector('.btn-postular');
    const alClick = () => this.postulaciones.set(this.postulaciones.get() + 1);
    btn?.addEventListener('click', alClick);
    this.registrarLimpieza(() => btn?.removeEventListener('click', alClick));
  }

  // Fase 5: Reacciona a atributos observados en camelCase sin re-renderizar todo
  alCambiarProp(prop, _antes, valorNuevo) {
    if (prop === 'titulo') {
      const h3 = this.querySelector('h3');
      if (h3) h3.textContent = valorNuevo;
    }
  }

  // Fase 6 (opcional): Hook ante errores de renderizado
  fallbackUI(error) {
    return `<p role="alert">Error seguro en tarjeta: ${error.message}</p>`;
  }

  // Fase 7: Al remover del DOM (las suscripciones registradas ya fueron limpiadas)
  alDesmontar() {
    this.postulaciones.destroy();
    this.auditoriaInterna.destroy();
  }
}

if (!customElements.get('tarjeta-empleo')) {
  customElements.define('tarjeta-empleo', TarjetaEmpleo);
}
```

### 2.3. Async Graph + Live SSE + Optimistic Rollback + Estrategia en 1 Línea

```js
import { crearEstadoLocal } from 'mita-dom/signals';
import {
  crearMemoAsincrono,
  crearEstadoVinculado,
  crearEstadoOptimistaConRollback,
  crearFuncionServidorEnVivo,
  cambiarEstrategiaRender
} from 'mita-dom/async';

const filtroCiudad = crearEstadoLocal('Santa Cruz');

// Promesa reactiva con cancelación automática (AbortSignal) y estado stale
const empleosAsync = crearMemoAsincrono(async (abortSignal) => {
  const ciudad = filtroCiudad.get();
  const r = await fetch(`/api/v2/empleos?ciudad=${encodeURIComponent(ciudad)}`, { signal: abortSignal });
  return r.json();
}, { valorInicial: [], umbralEsperaProlongadaMs: 2000 });

// Selección hija vinculada al resultado asíncrono
const empleoSeleccionado = crearEstadoVinculado(
  () => empleosAsync.estado.get().valor || [],
  (lista) => lista[0] || null
);

// Like instantáneo con rollback automático si Express/MySQL retorna error
const favoritos = crearEstadoOptimistaConRollback(10);
await favoritos.aplicarConServidor(favoritos.valor() + 1, async () => {
  const r = await fetch('/api/v2/favoritos', { method: 'POST' });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()).total;
});

// Streaming reactivo (async function* / SSE)
const feedLive = crearFuncionServidorEnVivo('empleos/live', async function* () {
  yield { evento: 'nuevo_empleo', titulo: 'Frontend MitaDOM — Santa Cruz' };
});
await feedLive.iniciar();

// Cambiar modo de render de una ruta en 1 sola línea
cambiarEstrategiaRender('/empleos', 'HYBRID', { cacheSegundos: 60 });
```

### 2.4. Consola Silenciosa vs Modo Debug Explícito

En `v2.8.0`, los logs internos de mutación de Signals se silencian automáticamente en `Vitest`, `CI` y `production` para evitar saturar terminales y pipelines. Si necesitas trazar un estado puntual durante depuración local:

```js
// Opción A: Por Signal individual
const carrito = crearEstadoLocal([], { debug: true });

// Opción B: Global durante una sesión de diagnóstico
globalThis.__MITA_DEBUG__ = true;
```

---

## 3. 🧪 Mapa Completo de los 17 Laboratorios Interactivos (`/laboratorio`)

Cada laboratorio cuenta con editor split editable a la izquierda y demostración real en Light DOM a la derecha dentro de `docs-mita-dom`:

| # | Clave (`data-leccion`) | Lección Interactiva | APIs y Conceptos Practicados |
| :-: | :--- | :--- | :--- |
| 1 | `compartir` | Flujo Gráfico + 3 Componentes | `crearEstadoCompartido`, `obtenerEstadoCompartido`, comunicación sin *props drilling* |
| 2 | `condicional` | `renderCondicional` Declarativo | `renderCondicional`, `this.mostrarSi`, desmontaje real del DOM (sin `display: none`) |
| 3 | `local` | Estado Local + `vincularTexto` | `crearEstadoLocal`, mutación granular de `TextNode` (`0` XSS) |
| 4 | `efectos` | `crearEfecto` + `.derivar` + Inspector | `crearEfecto`, `.derivar()`, `listarEstadosCompartidos()` |
| 5 | `reusables` | Componentes 100% Re-usables | Atributos HTML → `this.props`, instancias aisladas, `this.emit()` |
| 6 | `comparativa` | Antes vs Después (Evolución) | Comparación directa de código legacy vs Signals declarativos |
| 7 | `chat` | Chat Anti-Spam + Modal Novedades | `crearControlSpam`, `filtrarColeccion`, `<mita-dialog>` |
| 8 | `estrategias` | Estrategias SSR, SSG, Hybrid y SPA | `renderizarVistaUniversal`, `MitaMeta`, Islas `mita-client="only"` |
| 9 | `authcookies` | Auth FormBuilder + Cookies y Analíticas | `crearControladorAuth`, `crearFormularioReusable`, `crearGestorConsentimiento` |
| 10 | `rustguard` | Rust Memory Guard + CLI + Tests | `crearEstadoReactivoInmutable` (`&T`), `mutarEstadoConHistorial` (`&mut T`), RAII Drop, `npx mita` |
| 11 | `crudvistas` | CRUD Multi-Categoría + Modos por Vista | `crearControladorCrudCategorias`, `crearControladorEstrategiaPorVista` |
| 12 | `comunidad` | UI Paginación + Chat Gate (3s) + Moderación `"DC"` | `crearControladorPaginacion`, `crearControladorSalaChatYGrupos`, `crearSistemaModeracionAnuncios` |
| 13 | `props` | Pasar Props: Avatar y Científicos (`react.dev`) | `pasarPropsAElemento`, `leerPropsDeElemento`, `CIENTIFICOS_DEMO` |
| 14 | `angular` | Angular Tutorials: `@defer` + Signal Forms | `renderizarVistaDiferida`, `crearFormularioReactivoConSignals` |
| 15 | `fullstack` | Server Actions (Express+ORM) + Fetch + Mita Doc | `crearControladorFetchingPorModo`, `crearAccionServidorIsomorfica`, `ejecutarConsejeroMitaDoc`, `calcularRecomendacionSemVer` |
| 16 | `solid2` | Ciclo de Vida + Solid 2.0 Async Graph + Live SSE + Agentes IA | `crearMemoAsincrono`, `crearEstadoVinculado`, `crearEstadoOptimistaConRollback`, `crearFuncionServidorEnVivo`, `cambiarEstrategiaRender`, `emitirDiagnosticoAgente` |
| 17 | `v28syntax` | **Sintaxis `v2.8.0`: `sinRastrear()`, Subpath Exports y Ciclo de Vida** | `sinRastrear()` en vivo (`0` bucles), selector interactivo de los 8 Subpath Exports, inspector real `obtenerCicloDeVida()` y `{ debug: true }` |

---

## 4. ✅ Pipeline QA Oficial del Ecosistema

```bash
# 1. Librería Core (mita-dom)
npm run release:check
# Ejecuta: docs:auto -> vite build -> eslint -> stylelint -> vitest (69/69) -> npm pack --dry-run

# 2. Portal Documentación & 17 Laboratorios (docs-mita-dom / example-mita-spa-01-js)
npm run qa
# Ejecuta: sync-docs -> eslint -> test:css -> test:vercel -> vitest (12/12) -> vite build (Oxc) -> test:bundle (< 500 kB)

# 3. Full-Stack Express 5 + MySQL + Docker Swarm (food-show-1)
npm run qa
# Ejecuta: eslint -> stylelint -> vitest (15/15 contra MySQL vivo) -> vite build
```
