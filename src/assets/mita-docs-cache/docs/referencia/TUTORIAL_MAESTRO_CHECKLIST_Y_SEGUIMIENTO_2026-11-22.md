# 📘 Tutorial Maestro, Checklist de Funcionalidades, Casos de Uso y Seguimiento — Mita-DOM v2.7 (2026-11-22)

> **Autor:** Victor Code (Bolivia)  
> **Filosofía:** Claridad absoluta sobre magia oculta. HTML5 semántico puro, Light DOM sin Shadow DOM, Signals granulares por turnos (*Mita*) y protección de memoria inspirada en **Rust** (`Ownership`, `Borrow Checker` y `RAII Drop`).

---

## 1. 🧭 Guía Visual: Cómo se Comunican los Componentes con `Signal`

En `mita-dom` los componentes **nunca necesitan pasarse props por 5 niveles** (*Props Drilling*). Se comunican de 2 formas limpias:

```
┌────────────────────────────────────────────────────────────────────────────┐
│               1. COMUNICACIÓN PADRE ⇄ HIJO (RE-USABILIDAD)                 │
│                                                                            │
│   <padre-app>  ──(Atributos HTML: titulo="Oferta" variante="exito")──▶     │
│                ◀──(CustomEvent: 'tarjeta-accion' { detail })──────────     │
│                                                   <lab-tarjeta-reusable>   │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│            2. COMUNICACIÓN ENTRE HERMANOS / VISTAS DISTINTAS               │
│                                                                            │
│  <panel-admin> ── mutarEstadoConHistorial(cfg, { habilitado: false }) ──┐  │
│                                                                         ▼  │
│                                        ┌─────────────────────────────────┐ │
│                                        │ Signal Compartido ('empleos')   │ │
│                                        │ + Object.freeze (&T Borrow)     │ │
│                                        │ + Persistencia localStorage     │ │
│                                        └──────┬───────────────────┬──────┘ │
│                                               │                   │        │
│                         renderCondicional() ◀─┘                   └─▶ KPI  │
│                         <tablon-empleos>                              .derivar()
└────────────────────────────────────────────────────────────────────────────┘
```

### Ejemplo Verboso y Claro: Comunicación entre 2 Componentes

```javascript
import {
  MitaElement,
  crearEstadoReactivoInmutable,
  leerEstadoInmutable,
  mutarEstadoConHistorial,
  renderizarSiSeCumpleCondicion,
  crearAmbitoConLimpiezaAutomatica
} from 'mita-dom';

// 1. Crear el estado compartido inmutable (protegido estilo Rust &T)
export const estadoAnuncios = crearEstadoReactivoInmutable(
  'empleos:config_global',
  { habilitado: true, requiereSesion: false },
  {
    compartidoEntreComponentes: true,
    persistirEnLocalStorage: true,
    descripcionDelEstado: 'Controla si el formulario público de anuncios está activo.',
    reglasDeNegocio: 'Solo el panel de administración puede cambiar habilitado.'
  }
);

// 2. Componente Emisor (Panel Admin)
export function pausarAnunciosDesdeAdmin() {
  mutarEstadoConHistorial(
    estadoAnuncios,
    { habilitado: false },
    'Admin pausó la recepción de anuncios por mantenimiento'
  );
}

// 3. Componente Receptor (Vista Pública con RAII Auto-Drop)
export class VistaPublicaAnuncios extends MitaElement {
  constructor() {
    super();
    this.ambitoMemoria = crearAmbitoConLimpiezaAutomatica('<vista-publica-anuncios>');
  }

  render() {
    this.innerHTML = `<section id="slot-formulario"></section>`;
    const detener = renderizarSiSeCumpleCondicion({
      estadoReactivo: estadoAnuncios,
      contenedorDom: this.querySelector('#slot-formulario'),
      condicionParaMostrar: (cfg) => cfg.habilitado === true,
      plantillaHtmlSiSeCumple: () => `<form><button type="submit">Publicar Anuncio</button></form>`,
      plantillaHtmlSiNoSeCumple: () => `<p>🔴 Recepción de anuncios pausada por Administración.</p>`
    });
    this.registrarLimpieza(detener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.ambitoMemoria.liberarMemoriaCompleta();
  }
}
```

---

## 2. ✅ Checklist Completo de Funcionalidades con Ejemplos (`v2.7.0`)

| # | Funcionalidad | Estado | API Principal | Ejemplo / Dónde Probar |
| --- | --- | --- | --- | --- |
| 1 | **Estado Local Granular** | ✅ 100% | `crearEstadoLocal(valor)` / `vincularTexto(sig, nodo)` | `/laboratorio` → Lección 3 |
| 2 | **Estado Compartido + Persistencia** | ✅ 100% | `crearEstadoCompartido(nombre, init, { persistirLocal })` | `/laboratorio` → Lección 1 |
| 3 | **Efectos Auto-Rastreables y Derivados** | ✅ 100% | `crearEfecto(fn)` + `signal.derivar(fn)` | `/laboratorio` → Lección 4 |
| 4 | **Render Condicional Real (0 `display:none`)** | ✅ 100% | `renderCondicional()` / `renderizarSiSeCumpleCondicion()` | `/laboratorio` → Lección 2 |
| 5 | **Web Components 100% Re-usables** | ✅ 100% | `MitaElement` + atributos HTML + `CustomEvent` | `/laboratorio` → Lección 5 |
| 6 | **Chat Anti-Spam + Filtración + `<mita-dialog>`** | ✅ 100% | `crearControlSpam()` + `filtrarColeccion()` | `/laboratorio` → Lección 7 |
| 7 | **SSR, SSG, Hybrid, Islas y SEO `MitaMeta`** | ✅ 100% | `renderizarVistaUniversal()` + `MitaMeta.useHead()` | `/laboratorio` → Lección 8 |
| 8 | **FormBuilder Semántico + Auth Condicional** | ✅ 100% | `crearFormularioReusable()` + `crearControladorAuth()` | `/laboratorio` → Lección 9 |
| 9 | **Términos, Cookies y Analíticas Auto-Admin** | ✅ 100% | `crearGestorConsentimiento()` + `actualizarTerminosYPoliticas()` | `/laboratorio` → Lección 9 y `/docs` |
| 10 | **Rust Memory Guard (`&T`, `&mut T`, RAII `Drop`)** | ✅ 100% | `crearEstadoReactivoInmutable()` + `crearAmbitoConLimpiezaAutomatica()` | `/laboratorio` → Lección 10 |
| 11 | **CLI Generador y Doctor (`npx mita`)** | ✅ 100% | `npx mita g c/s/p` + `npx mita doctor` | `/laboratorio` → Lección 10 |
| 12 | **Docs con Lectura Visual (`A-`/`A+`) + Sync File System** | ✅ 100% | Dashboard Admin en `/docs` + `src/assets/mita-docs-db.json` | `/docs` (Barra superior + Modo Admin) |

---

## 3. 🏗️ Cómo Usar `mita-dom` en Proyectos Diferentes

### Caso A: SPA Educativa o Corporativa (ej. `example-mita-spa-01-js`)
- **Configuración:** Vite + `mitaHmrPlugin()` + `MitaRouter` en cliente.
- **Persistencia:** `localStorage` + `IndexedDB` + sincronización a archivo JSON del repositorio (`src/assets/mita-docs-db.json`) para que cada `git pull` conserve los documentos y políticas editadas.

### Caso B: Sistema Full-Stack con Base de Datos Real MySQL + ORM (ej. `food-show-1`)
- **Configuración:** Servidor Node.js (Express/Fastify) + Sequelize ORM (MySQL) + `renderizarVistaUniversal(Pagina, { modo: 'hybrid' })`.
- **Flujo Híbrido:** El estado inicial se hidrata desde `/api/settings` y `/api/jobs` (MySQL) y se sincroniza en el cliente con `crearEstadoCompartido('empleos:config')` para respuesta instantánea en `< 1ms`.

### Caso C: Sitio Estático Ultra-Rápido para SEO (Landing / Blog SSG)
- **Configuración:** Script de build que recorre las rutas y ejecuta `await renderizarVistaUniversal(Vista, { modo: 'ssg' })`, guardando los `.html` estáticos listos para CDN, manteniendo solo las islas interactivas `<mi-widget mita-client="only">`.

---

## 4. ⚖️ Evaluación Honesta: Ventajas vs Desventajas

### ✅ Ventajas Reales de `mita-dom`
1. **Cero Virtual DOM y Peso Mínimo (~15 kB gzip):** actualiza directamente el `TextNode` o fragmento exacto sin reconciliar árboles enteros como React.
2. **Estándares Web Puros (Light DOM + CSS3 `@scope`):** los estilos globales y las herramientas de accesibilidad e inspección del navegador funcionan sin las barreras frustrantes del Shadow DOM.
3. **Protección de Memoria Estilo Rust:** gracias a `leerEstadoInmutable()` (`Object.freeze`) y `crearAmbitoConLimpiezaAutomatica()` (RAII `Drop`), es imposible mutar un estado por accidente o dejar suscripciones huérfanas al desmontar vistas.
4. **Legibilidad en Español:** nombres explícitos (`mutarEstadoConHistorial`, `renderizarSiSeCumpleCondicion`) que cualquier desarrollador junior o senior entiende en 5 segundos.

### ⚠️ Desventajas Honestas y Límites Actuales
1. **Ecosistema de Terceros:** a diferencia de React o Vue, no existen miles de librerías UI prefabricadas específicas para `mita-dom` (aunque al ser Web Components estándar en Light DOM, puedes usar cualquier librería Vanilla JS o CSS puro).
2. **Disciplina en Plantillas HTML:** al no usar JSX compilado por defecto, los templates grandes en strings requieren modularizarse en archivos `.html` (`?raw`) o funciones pequeñas para mantener el código limpio.

---

## 5. 🔭 Lo Que Nos Falta y Hoja de Ruta (Seguimiento Activo)

- [x] **Fase 1 (Completada 2026-11-22):** Signals con `crearEfecto`, `.derivar()`, `crearEstadoCompartido`, `renderCondicional` declarativo y `vincularTexto`.
- [x] **Fase 2 (Completada 2026-11-22):** Utilidades de negocio (`crearControlSpam`, `filtrarColeccion`, `crearFormularioReusable`, `crearControladorAuth`, `crearGestorConsentimiento`).
- [x] **Fase 3 (Completada 2026-11-22):** Render universal (`SSR`, `SSG`, `Hybrid`, `CSR/SPA`, `MitaMeta`), Rust Memory Guard (`rustGuard.js`), CLI `npx mita` y Docs con control de tamaño de letra (`A-`/`A+`) + sincronización con File System (`mita-docs-db.json`).
- [ ] **Fase 4 (Próxima Iteración):**
  - Adaptador de sincronización en tiempo real vía **WebSockets / Server-Sent Events (SSE)** integrado directamente en `crearEstadoCompartido('chat:sala', ..., { syncRemoto: 'wss://...' })`.
  - Extensión oficial de VS Code / Antigravity para autocompletar nombres de `obtenerEstadoCompartido('...')` entre archivos.
  - Compilador opcional de plantillas `.mita` en tiempo de build para validación estática de atributos HTML.
