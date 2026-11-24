# 📚 Arquitectura y Guía Oficial — MitaDOM SPA (`example-mita-spa-01-js`)

- **Actualizado:** `2026-11-22`
- **Motor:** `mita-dom v2.7.0` (Light DOM + Granular Signals + Auto-Documentación)
- **Autor:** Victor Code (Bolivia)

---

## 🧱 1. Estructura Modular, HTML5 Semántico y Light DOM

A diferencia de frameworks que generan *div-soup* dentro de un único `<div id="app">`, esta SPA utiliza Web Components nativos en **Light DOM** con **HTML5 semántico** (`<main>`, `<header>`, `<nav>`, `<aside>`, `<section>`, `<article>`, `<search>`, `<details>`, `<summary>`, `<output>`) y **CSS3 `@scope` Mobile-First**:

- **Portal lateral contextual (`<aside id="sidebar">`):**
  - En `/docs`, activa automáticamente `<mita-docs-nav>` con **buscador en vivo** y **acordeones `<details>`**.
  - En `/laboratorio`, activa automáticamente `<mita-lab-nav>` con **buscador en vivo** y **acordeones `<details>`** sincronizados mediante `estadoLeccionActiva`.
- **Sandbox Split Interactivo (`/laboratorio`):** Editor `<mita-code-editor editable="true">` a la izquierda + Vista Previa viva a la derecha (`>= 1024px`) y apilado en móvil, con descarga `.js`, recarga, reinicio y expansión (`Mostrar más`).

---

## ⚡ 2. Estándar Reactivo `mita-dom v2.7.0` (Sin Props Drilling)

### A) Estado Local + `vincularTexto` Granular

```js
import { crearEstadoLocal, vincularTexto } from 'mita-dom';

const contador = crearEstadoLocal({ clicks: 0 });
const stop = vincularTexto(
  contador,
  document.querySelector('#contador-out'),
  (estado) => `Clicks: ${estado.clicks}`
);

contador.patch({ clicks: contador.get().clicks + 1 });
stop(); // Limpieza explícita
```

### B) Compartir Datos entre 2 o más Componentes (`crearEstadoCompartido` / `obtenerEstadoCompartido`)

```js
import { crearEstadoCompartido, obtenerEstadoCompartido, listarEstadosCompartidos } from 'mita-dom';

// Definir una sola vez (con persistencia local y reglas auditables)
export const configModulo = crearEstadoCompartido(
  'empleos:config',
  { habilitado: true, requiereLogin: false },
  {
    persistirLocal: true,
    descripcion: 'Visibilidad del módulo de anuncios de empleo',
    reglas: 'Solo el administrador puede desactivar el módulo'
  }
);

// En cualquier componente hermano o hijo:
const cfg = obtenerEstadoCompartido('empleos:config');
cfg.patch({ habilitado: false });

// En Panel Admin: auditar todos los estados locales registrados
console.table(listarEstadosCompartidos());
```

### C) Render Condicional Declarativo + Auto-Limpieza en `MitaElement`

```js
import { MitaElement } from './utils/MitaElement.js';
import { obtenerEstadoCompartido } from 'mita-dom';

export class PanelAnuncios extends MitaElement {
  async render() {
    const cfg = obtenerEstadoCompartido('empleos:config');
    this.innerHTML = `<section id="zona"></section>`;

    // Auto-limpia la suscripción en disconnectedCallback()
    this.mostrarSi({
      estado: cfg,
      contenedor: this.querySelector('#zona'),
      cuando: (estado) => estado.habilitado === true,
      mostrar: () => `<form>Formulario Activo</form>`,
      sino: () => `<p>Módulo pausado por Administración.</p>`
    });
  }
}
```

### D) Efectos Automáticos y Derivados (`crearEfecto` + `.derivar()`)

```js
import { crearEstadoLocal, crearEfecto } from 'mita-dom';

const items = crearEstadoLocal([10, 20, 30]);
const total = items.derivar((lista) => lista.reduce((a, b) => a + b, 0));

const detener = crearEfecto(() => {
  console.log('Total calculado:', total.get());
});

detener();
total.destroy();
```

---

## 🤖 3. Pipeline de Auto-Documentación y Calidad (QA)

1. En `../mita-dom`: `npm run docs:auto` extrae todos los exports/JSDoc hacia `docs/referencia/AUTO_API_REFERENCIA.md` y consolida `changelogs/*.md` en `CHANGELOG.md`.
2. En esta SPA (`example-mita-spa-01-js`): `node scripts/sync-docs.js` sincroniza todo en `src/assets/mita-docs-cache/`.
3. Validación completa: `npm run lint && npm run test && npm run test:css && npm run build`.
