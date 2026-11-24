# 🏛️ Guía e Informe de Uso: Mita-DOM como Framework Opinionado (Props de React.dev + Tutoriales de Angular.dev `@defer` y `Signal Forms`) — 2026-11-22

> **Objetivo de este Documento:** Servir como manual definitivo y probado de `mita-dom v2.7.0` como **Framework Opinionado**, mostrando cómo pasar Props a componentes (mejorando el ejemplo oficial de `react.dev/learn/passing-props-to-a-component`), cómo usar las mejores ideas de `angular.dev/tutorials` (`Playground`, `AI Tutor`, `First App CLI`, `Signals`, `Deferrable Views @defer` y `Signal Forms`), y cómo evitar errores para el próximo desarrollador.

---

## 1. 🧩 Pasando Props a un Componente: React.dev vs Mita-DOM Semántico (`pasarPropsAElemento`)

En `https://react.dev/learn/passing-props-to-a-component`, React enseña a pasar `size` y `person` desde `Profile` hacia `Avatar`, pero envuelve el resultado en `<div>` innecesarios y requiere compilación JSX + Virtual DOM.

En **Mita-DOM v2.7**, logramos la misma ergonomía (pasando objetos JavaScript complejos o atributos HTML) con **Web Components Nativos en Light DOM, HTML5 Semántico (`<section>`, `<figure>`, `<figcaption>`) y Props Inmutables (`Object.freeze`)**:

### Archivo 1: `utils.js` (100% compatible con el ejemplo de React.dev)
```javascript
// utils.js — También incluido de fábrica en 'mita-dom' como obtenerUrlImagenCientifico()
export function obtenerUrlImagenCientifico(person, size = 's') {
  return (
    'https://react.dev/images/docs/scientists/' +
    person.imageId +
    size +
    '.jpg'
  );
}
```

### Archivo 2: `mita-avatar.js` (Componente Hijo Re-usable que recibe `person` y `size`)
```javascript
import {
  MitaElement,
  leerPropsDeElemento,
  obtenerUrlImagenCientifico
} from 'mita-dom';

export class MitaAvatar extends MitaElement {
  render() {
    // Lee props con valores por defecto (size = 100) tanto desde atributos como desde pasarPropsAElemento()
    const { person, size } = leerPropsDeElemento(this, {
      size: 100,
      person: {
        name: 'Katsuko Saruhashi',
        imageId: 'YfeOqp2',
        profesion: 'Geoquímica'
      }
    });

    // HTML5 semántico: <figure> + <img> + <figcaption> (Cero <div> innecesarios)
    this.innerHTML = `
      <figure class="cientifico-avatar-card">
        <img
          class="avatar"
          src="${obtenerUrlImagenCientifico(person)}"
          alt="${person.name}"
          width="${size}"
          height="${size}"
        />
        <figcaption>
          <strong>${person.name}</strong>
          <small>${size}x${size}px • ID: ${person.imageId}</small>
        </figcaption>
      </figure>
    `;
  }
}

if (!customElements.get('mita-avatar')) {
  customElements.define('mita-avatar', MitaAvatar);
}
```

### Archivo 3: `app-perfiles.js` (Componente Padre `Profile` que pasa Props a 3 instancias)
```javascript
import {
  MitaElement,
  pasarPropsAElemento,
  CIENTIFICOS_DEMO
} from 'mita-dom';
import './mita-avatar.js';

export class MitaPerfilCientificos extends MitaElement {
  render() {
    this.innerHTML = `
      <section class="perfiles-grid" aria-label="Científicos destacados">
        <mita-avatar id="av-katsuko"></mita-avatar>
        <mita-avatar id="av-aklilu"></mita-avatar>
        <mita-avatar id="av-lin"></mita-avatar>
      </section>
    `;

    // Pasamos exactamente los mismos objetos que en React.dev, congelados por RustGuard:
    pasarPropsAElemento(this.querySelector('#av-katsuko'), {
      size: 100,
      person: { name: 'Katsuko Saruhashi', imageId: 'YfeOqp2' }
    });

    pasarPropsAElemento(this.querySelector('#av-aklilu'), {
      size: 80,
      person: { name: 'Aklilu Lemma', imageId: 'OKS67lh' }
    });

    pasarPropsAElemento(this.querySelector('#av-lin'), {
      size: 50,
      person: { name: 'Lin Lanying', imageId: '1bX5QH6' }
    });
  }
}
```

---

## 2. 🅰️ Los 6 Tutoriales Oficiales de `angular.dev/tutorials` Adaptados y Mejorados en Mita-DOM

Analizamos las 6 rutas oficiales de aprendizaje de Angular (`https://angular.dev/tutorials`) y las implementamos nativamente en `mita-dom`:

| Ruta en `angular.dev/tutorials` | Equivalente Nativo en `mita-dom v2.7` | Dónde Probarlo en Vivo |
| --- | --- | --- |
| **1. Learn in your browser via Playground** | Sandbox Split (`/laboratorio`) con 14 Lecciones, Editor multi-archivo y Retos Gamificados (+XP). | `/laboratorio` (Lecciones 1 a 14) |
| **2. Angular AI Tutor via MCP Server** | **Antigravity Web Autopilot** (`rules/01`–`06` + `GEMINI.md` + MCP Memory + Ciclo de Artifacts). | `/docs/informe_mejoras_antigravity_ide_y_roadmap_ia_2026-11-22` |
| **3. Build your first app locally via npm** | **Mita CLI (`npx mita`)**: `npx mita g component`, `g store`, `g page --hybrid`, `npx mita doctor`. | `/laboratorio` → Lección 10 |
| **4. Learn Signals via the Playground** | `crearEstadoLocal`, `crearEstadoCompartido`, `.derivar()`, `crearEfecto()`, `crearEstadoReactivoInmutable`. | `/laboratorio` → Lecciones 1, 3, 4 y 10 |
| **5. Deferrable Views (`@defer`)** | **`renderizarVistaDiferida({ contenedor, disparador, plantillaPlaceholder, plantillaCargando, cargarContenidoDiferido })`**. | `/laboratorio` → Lección 14 |
| **6. Learn Signal Forms** | **`crearFormularioReactivoConSignals(definicionCampos)`** con validación reactiva por campo en tiempo real. | `/laboratorio` → Lección 14 |

---

## 3. ⏳ Ejemplo Probado: Vistas Diferidas (`@defer` de Angular en Mita-DOM)

En Angular usas `@defer (on interaction) { ... } @placeholder { ... } @loading { ... }`. En `mita-dom` lo haces con JavaScript estándar sin compilador propietario:

```javascript
import { renderizarVistaDiferida } from 'mita-dom';

const controlDefer = renderizarVistaDiferida({
  contenedor: document.querySelector('#slot-grafica-pesada'),
  disparador: 'interaccion', // 'interaccion' | 'temporizador' | 'inmediato'
  plantillaPlaceholder: () => `
    <article class="defer-placeholder">
      <button type="button">📊 Clic aquí para cargar Analítica Pesada (@placeholder)</button>
    </article>
  `,
  plantillaCargando: () => `<p>⏳ Descargando módulo diferido (@loading)...</p>`,
  cargarContenidoDiferido: async () => {
    return `<section>✅ Módulo de Analítica Cargado bajo demanda (Ahorro de bundle inicial)</section>`;
  }
});
```

---

## 4. 📝 Ejemplo Probado: Signal Forms (`crearFormularioReactivoConSignals`)

Inspirado en `https://angular.dev/tutorials/signal-forms`: cada input actualiza su Signal y recalcula errores e invalidez del formulario al instante:

```javascript
import { crearFormularioReactivoConSignals } from 'mita-dom';

const formCientifico = crearFormularioReactivoConSignals({
  nombre: { valorInicial: 'Katsuko', requerido: true, minLongitud: 3 },
  email: {
    valorInicial: 'katsuko@ciencia.jp',
    requerido: true,
    patronRegex: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
  },
  especialidad: { valorInicial: 'Geoquímica', requerido: true, minLongitud: 4 }
});

// Al escribir en un input:
formCientifico.establecerValorCampo('nombre', 'Katsuko Saruhashi');

// Estado reactivo disponible para cualquier efecto o vista:
console.log(formCientifico.estado.get().esFormularioValido); // true
```

---

## 5. 🛡️ Reglas del Framework Opinionado (Para que el Próximo Desarrollador No Cometa Errores)

1. **Nunca uses `<div>` si existe una etiqueta semántica**: usa `<section>`, `<article>`, `<header>`, `<nav>`, `<aside>`, `<figure>`, `<figcaption>`, `<search>`, `<menu>`, `<output>`, `<dialog>`.
2. **Nunca uses `attachShadow()` ni `display: none` para permisos**: usa Light DOM con `@scope (mi-componente)` y `renderCondicional()` / `renderizarSiSeCumpleCondicion()`.
3. **Nunca mutes un objeto de estado directamente (`estado.get().x = 1`)**: usa `leerEstadoInmutable()` (`&T`) y `mutarEstadoConHistorial()` (`&mut T`).
4. **Siempre libera memoria al desmontar**: usa `crearAmbitoConLimpiezaAutomatica('<mi-vista>')` y llama a `.liberarMemoriaCompleta()` en `disconnectedCallback()`.
