# 🧬 Ciclo de Vida Completo `MitaElement` + Mejoras Estables de Solid 2.0, Vue Vapor, Qwik, React 19 y Angular 20 (2026-11-23)

> **Principio Rector:** *Claridad sobre todo.* Si un desarrollador (o un Agente IA) lee tu componente, debe entender en 5 segundos **cuándo nace el estado, cuándo se pinta el HTML, cómo llegan los datos del servidor y cuándo se libera la memoria**.

---

## 1. 🔄 Ciclo de Vida Completo y Garantizado de `MitaElement`

### ❌ Error Clásico Anterior (Por qué fallaba o hacía doble render)

Antes, algunos ejemplos inicializaban `this.estado` dentro de `alMontar()` y volvían a llamar `this.render()`. Como `connectedCallback()` ya invocaba `render()` primero, el componente se pintaba **dos veces** (o tronaba si `render()` leía `this.estado`).

### ✅ Orden Oficial Garantizado (v2.7)

| Orden | Hook / Método | Cuándo se ejecuta | Qué poner aquí |
| --- | --- | --- | --- |
| **1** | `alCrear()` | En `constructor()` (antes del DOM) | `this.contador = crearEstadoLocal(0)` y configuración interna. |
| **2** | `alAntesDeRenderizar()` | En `connectedCallback()`, justo antes de `render()` | Lectura inicial de props/ruta o preparación síncrona. |
| **3** | `render()` | Pinta el Light DOM **una sola vez** (con Error Boundary) | `this.innerHTML = templateHtml;` (estructura semántica HTML5). |
| **4** | `alMontar()` | Justo después de `render()` (**DOM garantizado**) | `this.vincularTexto(...)`, `this.escucharEstado(...)`, `this.mostrarSi(...)`, listeners con `this.registrarLimpieza(...)`. |
| **5** | `alCambiarProp(prop, antes, ahora)` y `alCambiarAtributo(attr, antes, ahora)` | Cuando cambia un atributo de `static get observedAttributes()` | Mutar granularmente el nodo o Signal afectado (sin re-pintar todo). |
| **6** | `alActualizar(motivo)` | Al llamar `this.solicitarActualizacion(motivo)` | Enfocar un input, recalcular scroll o métricas tras actualización manual. |
| **7** | Auto-limpieza + `alDesmontar()` | En `disconnectedCallback()` al salir del DOM | MitaDOM libera automáticamente `this._limpiezas` y luego llama a `alDesmontar()`. |
| **⚠️** | `fallbackUI(error)` + `alError(error, fase)` | Si cualquier fase lanza una excepción | Mostrar tarjeta de error aislada sin tumbar la SPA. |

### Ejemplo Completo Copiable (API Reference Viva)

```javascript
import { MitaElement, crearEstadoLocal } from 'mita-dom';
import templateHtml from './mi-tarjeta.html?raw';
import './mi-tarjeta.css';

export class MiTarjeta extends MitaElement {
  static get observedAttributes() {
    return ['color-acento', 'titulo'];
  }

  alCrear() {
    this.clicks = crearEstadoLocal(0);
  }

  render() {
    this.innerHTML = templateHtml;
  }

  alMontar() {
    // 1. Props tipadas automáticamente (kebab-case -> camelCase)
    if (this.props.colorAcento) {
      this.querySelector('.titulo').style.color = this.props.colorAcento;
    }

    // 2. Granular Light DOM (auto-limpiado en disconnectedCallback)
    this.vincularTexto(this.clicks, '.contador', (n) => `${n} clics`);

    // 3. Listener con auto-limpieza garantizada
    const onClick = () => this.clicks.set(this.clicks.get() + 1);
    const btn = this.querySelector('button');
    btn?.addEventListener('click', onClick);
    this.registrarLimpieza(() => btn?.removeEventListener('click', onClick));
  }

  alCambiarProp(prop, _antes, nuevoValor) {
    if (prop === 'colorAcento') {
      this.querySelector('.titulo').style.color = nuevoValor;
    }
  }

  alDesmontar() {
    this.clicks.destroy();
  }
}

customElements.define('mi-tarjeta', MiTarjeta);
```

Además, puedes inspeccionar cualquier instancia en DevTools o tests con **`el.obtenerCicloDeVida()`** → `{ componente, faseActual, montado, renders, limpiezasPendientes }`.

---

## 2. 🏆 Lo Mejor y Más Estable Robado de Cada Framework (2026)

| Framework Fuente | Innovación Estable (2025–2026) | Cómo lo Implementa `mita-dom` (Vanilla JS Puro y Legible) |
| --- | --- | --- |
| **SolidJS 2.0** | **Async Graph (`One Graph, Two Machines`)**: promesas en el grafo reactivo, cancelación automática de race conditions, UI *stale* (`isPending`) y `Long Hold`. | `crearMemoAsincrono(fnAsync, opciones)` con `estaPendiente()`, `esperaProlongada()`, `AbortSignal` automático y cero race conditions. |
| **SolidJS 2.0** | **Live Server Functions (`live(async function* ...)`)**: streaming RPC/SSE directo a un Signal. | `crearFuncionServidor()` + `crearFuncionServidorEnVivo(nombre, async function* () { yield ... })`. |
| **SolidJS 2.0** | **Built to Be Written by Agents**: diagnósticos estructurados con código estable, solución y guía `SKILL.md` incluida en `node_modules`. | `emitirDiagnosticoAgente()` + `CATALOGO_DIAGNOSTICOS_AGENTE` + **`skills/reactivity-diagnostics/SKILL.md`** empaquetada en NPM. |
| **Angular 20** | **`linkedSignal` + `resource` + `@defer` + `Signal Forms`**: claridad por convención y estado derivado escribible. | `crearEstadoVinculado()`, `crearMemoAsincrono()`, `renderizarVistaDiferida()` y `crearFormularioReactivoConSignals()`. |
| **React 19** | **Actions + `useOptimistic`**: mutaciones con estado pendiente y rollback automático si el servidor rechaza. | `crearEstadoOptimistaConRollback(valorInicial)` + `crearFuncionServidor()`. |
| **Vue 3.6 Vapor** | **Zero Virtual DOM**: mutación directa de nodos reales del DOM guiada por Signals. | Light DOM nativo + `this.vincularTexto()` + `@scope` (0 VDOM, 0 Shadow DOM). |
| **Qwik / Qwik City** | **Resumability**: cargar JS bajo demanda sin re-ejecutar toda la página en hidratación inicial. | Estrategia `'RESUMABLE'` en `definirEstrategiaRenderRuta()` + `@defer` + Islas (`mita-client="only"` / `mita-server="only"`). |

---

## 3. ⚡ Ejemplo Real: Cascada Asíncrona (Solid 2.0 `Async Graph` + Angular 20 `linkedSignal`)

Observa qué limpio queda el clásico selector en cascada **`Departamento → Ciudad`** sin `useEffect`, sin banderas manuales de `loading` y sin *race conditions*:

```javascript
import { crearEstadoLocal, crearMemoAsincrono, crearEstadoVinculado } from 'mita-dom';

const departamento = crearEstadoLocal('Santa Cruz');

// 1. Async Graph (Solid 2.0): se re-ejecuta al cambiar `departamento` y cancela respuestas viejas
const ciudades = crearMemoAsincrono(
  async ({ signal }) => {
    const dep = departamento.get(); // Auto-rastreado antes del await
    const res = await fetch(`/api/ciudades?dep=${encodeURIComponent(dep)}`, { signal });
    return res.json();
  },
  { valorInicial: ['Santa Cruz de la Sierra', 'Montero'], umbralEsperaProlongadaMs: 2500 }
);

// 2. linkedSignal (Angular 20): escribible por el usuario, pero se resetea al llegar nuevas ciudades
const ciudadSeleccionada = crearEstadoVinculado(
  () => ciudades.estado.get().valor || [],
  (lista) => lista[0] || ''
);

// El usuario puede elegir manualmente:
ciudadSeleccionada.set('Montero');

// Si cambia el departamento, `ciudades` consulta y `ciudadSeleccionada` se actualiza sola:
departamento.set('Cochabamba');
```

---

## 4. 📡 Live Server Function (`async function*` / SSE) y Optimistic Rollback

```javascript
import { crearFuncionServidorEnVivo, crearEstadoOptimistaConRollback } from 'mita-dom';

// A. Stream en vivo estilo Solid 2.0 live()
const streamPedidos = crearFuncionServidorEnVivo('cocina/pedidos', async function* (sucursal) {
  yield { sucursal, mesa: 4, estado: 'En preparación' };
  yield { sucursal, mesa: 4, estado: 'Listo para entregar' };
});

streamPedidos.estado.suscribir((st) => {
  console.log(`Tick #${st.ticks}:`, st.valor);
});
await streamPedidos.iniciar('Equipetrol');

// B. Estado optimista con rollback automático (El servidor manda)
const likes = crearEstadoOptimistaConRollback(10);
const res = await likes.aplicarConServidor(11, async () => {
  throw new Error('Sin conexión al servidor');
});
console.log(res.rollback); // true -> likes.valor() volvió automáticamente a 10
```

---

## 5. 🤖 Diagnósticos Construidos para Humanos y Agentes IA

Cuando ocurre un anti-patrón reactivo, MitaDOM emite un diagnóstico estructurado con **código estable** y la ruta a **`node_modules/mita-dom/skills/reactivity-diagnostics/SKILL.md`**:

```javascript
import { emitirDiagnosticoAgente, obtenerDiagnosticosAgente } from 'mita-dom';

emitirDiagnosticoAgente('MITA_LECTURA_SIN_RASTREO', {
  origen: '<mi-carrito> -> render() línea 18',
  detalle: 'total.get() leído fuera de crearEfecto/vincularTexto'
});

console.table(obtenerDiagnosticosAgente());
```
