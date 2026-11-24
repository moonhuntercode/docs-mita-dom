# 📖 Referencia Completa de API (Estilo `react.dev/reference/react`), Profundización y Glosario A–Z (2026-11-23)

Esta referencia traduce cada concepto estándar de **`https://react.dev/reference/react`** (Hooks, Componentes, APIs, Acciones y Recursos) al modelo de **MitaDOM v2.7** (Web Components Nativos Light DOM + Signals Granulares + Async Graph), incluyendo una sección **Para Profundizar y Entender Todo**, **Glosario A–Z** y **ejemplos copiables**.

---

## 1. 🪝 Hooks de React vs Primitivas de MitaDOM

| React (`react.dev/reference/react`) | MitaDOM v2.7 | Diferencia Clave (Ventaja MitaDOM) |
| --- | --- | --- |
| `useState(inicial)` | `crearEstadoLocal(inicial)` | No re-ejecuta todo el componente; solo notifica al nodo exacto suscrito. |
| `useMemo(() => fn, [deps])` | `signal.derivar(fn)` | Sin array de dependencias manual (`[deps]`); imposible olvidar una dependencia. |
| `useEffect(() => fn, [deps])` | `crearEfecto(() => fn)` | Auto-rastreo automático + retorna `detener()`. Usa `sinRastrear()` para leer sin suscribir. |
| `useContext(MiContexto)` | `crearEstadoCompartido('clave', val)` + `obtenerEstadoCompartido('clave')` | Sin envolver la app en `<Provider>` anidados; auditable con `listarEstadosCompartidos()`. |
| `useOptimistic(estado, fn)` | `crearEstadoOptimistaConRollback(inicial)` | Aplica cambio al instante en UI y hace rollback automático si falla el servidor. |
| `useActionState(action, init)` | `crearFuncionServidor(nombre, fn, opts)` | Estado reactivo integrado (`pendiente`, `datos`, `error`, `latenciaMs`, validación previa). |
| `use(promesa)` + `<Suspense>` | `crearMemoAsincrono(async ({ signal }) => ...)` | Cancelación automática de race conditions (`AbortSignal`), UI *stale* (`estaPendiente()`) y alerta `LONG_HOLD`. |
| `useRef(null)` | `this.querySelector('#id')` (dentro de `alMontar()`) | El DOM real es tuyo desde el inicio (sin capas intermedias ni `.current` nulo). |
| `useReducer(reducer, init)` | `crearEstadoReactivoInmutable()` + `mutarEstadoConHistorial()` | Historial auditable con motivo de cambio e inmutabilidad profunda estilo Rust. |

### Ejemplo Comparativo Directo (React vs MitaDOM)

```javascript
// ⚛️ En React: requiere re-renderizar toda la función componente y declarar [deps]
// const [precio, setPrecio] = useState(35);
// const [cantidad, setCantidad] = useState(2);
// const total = useMemo(() => precio * cantidad, [precio, cantidad]);

// 🚀 En MitaDOM v2.7: granular, sin Virtual DOM y sin array de dependencias
import { MitaElement, crearEstadoLocal, crearEfecto, sinRastrear } from 'mita-dom';

export class CalculadoraPedido extends MitaElement {
  alCrear() {
    this.precio = crearEstadoLocal(35);
    this.cantidad = crearEstadoLocal(2);
    this.auditoria = crearEstadoLocal(0);
  }

  render() {
    this.innerHTML = `
      <article>
        <output id="total-pedido"></output>
        <button type="button" id="btn-mas">+1 Plato</button>
      </article>
    `;
  }

  alMontar() {
    // Auto-rastrea precio y cantidad; NO rastrea `auditoria` gracias a sinRastrear()
    const detener = crearEfecto(() => {
      const total = this.precio.get() * this.cantidad.get();
      this.querySelector('#total-pedido').textContent = `Total: Bs. ${total}`;
      sinRastrear(() => this.auditoria.set(this.auditoria.get() + 1));
    });
    this.registrarLimpieza(detener);

    const onClick = () => this.cantidad.set(this.cantidad.get() + 1);
    const btn = this.querySelector('#btn-mas');
    btn?.addEventListener('click', onClick);
    this.registrarLimpieza(() => btn?.removeEventListener('click', onClick));
  }
}
```

---

## 2. 🧩 Componentes Integrados y APIs (`react.dev/reference/react/components`)

| React API / Componente | Equivalente MitaDOM v2.7 | Ejemplo Conciso |
| --- | --- | --- |
| `<Suspense fallback={...}>` + `lazy()` | `renderizarVistaDiferida({ contenedor, cargador, alCargar, placeholder })` | Carga un chunk JS al hacer clic, al entrar en viewport o en idle (`@defer`). |
| `ErrorBoundary` (clase con `componentDidCatch`) | `MitaElement` integrado (`fallbackUI(err)` + `alError(err, fase)`) | Todos los componentes ya traen Error Boundary sin librerías externas. |
| `createPortal(ui, destino)` | `<dialog>` nativo / Teleport Light DOM (`document.body.appendChild`) | Modales accesibles en Top Layer nativo sin z-index hacks. |
| Renderizado condicional `{ok ? <A/> : <B/>}` | `this.mostrarSi({ estado, contenedor, cuando, mostrar, sino })` | Destruye/crea nodos reales en el DOM (prohibido usar `display: none` para seguridad). |
| `<StrictMode>` (detección de bugs en dev) | `emitirDiagnosticoAgente()` + `skills/reactivity-diagnostics/SKILL.md` | Códigos estables `[MITA_*]` con causa, solución y guía para Agentes IA. |

---

## 3. 🧠 Para Profundizar y Entender Todo (Arquitectura Interna)

### ¿Cómo funciona el auto-rastreo de `crearEfecto()` y por qué existe `sinRastrear()`?
1. MitaDOM mantiene una pila interna (`pilaDeEfectos`).
2. Cuando llamas `crearEfecto(fn)`, MitaDOM empuja un nodo de efecto en la pila y ejecuta `fn()`.
3. Cada `signal.get()` que se ejecuta mientras ese efecto está en la cima de la pila registra automáticamente el efecto como suscriptor de ese `Signal`.
4. **Regla de Oro:** si dentro de un efecto necesitas leer o hacer `.patch()` en un estado interno **sin** disparar un bucle infinito, envuélvelo en **`sinRastrear(() => ...)`** (esto empuja `null` temporalmente en la pila para pausar el rastreo).

### ¿Por qué Light DOM + `@scope` en lugar de Shadow DOM o Virtual DOM?
- **Cero Virtual DOM:** en vez de clonar árboles en memoria y compararlos (*diffing*), `this.vincularTexto()` y `renderCondicional()` tocan **exactamente** el `TextNode` o contenedor afectado en `O(1)`.
- **Cero Shadow DOM:** los formularios nativos, lectores de pantalla (a11y), motores SEO y las variables globales CSS (`:root`) funcionan de forma natural, mientras CSS3 `@scope (mi-componente)` aísla estilos sin romper herencia.

### ¿Cómo elegir tu Estrategia de Renderizado en 10 segundos?
- **`SSG`**: contenido que cambia poco (Docs, Blogs, Landings) → ~1ms desde CDN.
- **`SSR`**: contenido vivo que necesita SEO (Anuncios de Empleo, Catálogo de Productos).
- **`CSR`**: paneles privados detrás de login (`/admin`, editores interactivos).
- **`HYBRID`**: 90% HTML estático + islas `mita-client="only"` (Carrito, Buscador).
- **`RESUMABLE`**: redes lentas / móviles 3G (carga JS solo cuando el usuario interactúa).

---

## 4. 📚 Glosario Técnico Completo (A–Z)

- **`@defer` (`renderizarVistaDiferida`):** carga diferida de módulos pesados solo cuando entran en pantalla o el usuario interactúa.
- **`@scope`:** regla nativa CSS3 que encapsula selectores dentro de un componente Light DOM sin usar Shadow DOM.
- **`Async Graph` (`crearMemoAsincrono`):** modelo de Solid 2.0 donde las promesas son nodos de primera clase en el grafo reactivo, cancelando *race conditions* automáticamente.
- **`Borrow Checker` (`rustGuard.js`):** patrón inspirado en Rust que separa lecturas inmutables (`&T` vía `leerEstadoInmutable`) de mutaciones auditables (`&mut T` vía `mutarEstadoConHistorial`).
- **`Conventional Commits`:** estándar de mensajes Git (`feat:`, `fix:`, `docs:`, `chore:`) que facilita changelogs y versionado SemVer.
- **`Error Boundary`:** aislamiento de fallos por componente (`fallbackUI` + `alError`) para que un error no deje la aplicación en blanco.
- **`Hydration` (Hidratación):** proceso donde el navegador conecta listeners y Signals sobre HTML ya generado por el servidor (SSR).
- **`Island Architecture` (Islas):** marcar zonas interactivas (`mita-client="only"`) y zonas estáticas de servidor (`mita-server="only"`).
- **`Light DOM`:** el árbol DOM estándar y accesible del navegador (sin `attachShadow()`).
- **`linkedSignal` (`crearEstadoVinculado`):** estado derivado que el usuario puede editar manualmente y que se reinicia automáticamente cuando cambia su fuente padre.
- **`Live Server Function` (`crearFuncionServidorEnVivo`):** función de servidor basada en `async function*` / SSE que emite actualizaciones en tiempo real directo a un Signal.
- **`Long Hold` (`MITA_ESPERA_PROLONGADA`):** alerta cuando una operación asíncrona retiene datos antiguos (*stale*) más tiempo del umbral saludable.
- **`Optimistic UI` (`crearEstadoOptimistaConRollback`):** mostrar el resultado esperado al instante en UI y revertir automáticamente si el servidor rechaza la operación.
- **`RAII / Drop` (`crearAmbitoConLimpiezaAutomatica`):** garantía de liberación determinista de listeners, timers y suscripciones al salir del DOM (`disconnectedCallback`).
- **`Race Condition`:** bug donde una petición HTTP vieja llega después de una más reciente y sobrescribe la pantalla con datos obsoletos (resuelto automáticamente por `crearMemoAsincrono`).
- **`Resumability`:** capacidad de reanudar interactividad en el cliente sin re-ejecutar todo el árbol de componentes al cargar la página.
- **`SemVer` (`MAJOR.MINOR.PATCH`):** versionado semántico (`2.7.0` → `2.7.1` bugfix, `2.8.0` nueva función retrocompatible, `3.0.0` cambio incompatible).
- **`Signal`:** contenedor reactivo granular (`get`, `set`, `update`, `patch`, `derivar`, `suscribir`) que notifica únicamente a quienes dependen de él.
- **`Untrack` (`sinRastrear`):** pausa temporal del rastreo de dependencias dentro de un `crearEfecto()`.
