# 🌐 Fundamentos Web Modernos (HTML5 & DOM)

**MitaDOM** no inventa una rueda nueva, te enseña a usar la que ya viene instalada en tu navegador: La Web Plataforma.

Para dominar MitaDOM, debes dominar tres conceptos fundamentales del DOM moderno:

## 1. Custom Elements (Elementos Personalizados)

Antes, para crear componentes usábamos funciones de React o clases de Angular. Hoy, el estándar HTML5 nos permite registrar nuestras propias etiquetas HTML en el navegador.

```javascript
// La forma nativa (Vainilla)
class MiBoton extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<button>Haz clic</button>`;
  }
}
// Registramos la etiqueta
customElements.define('mi-boton', MiBoton);
```

**¿Cómo lo hace MitaDOM?**
MitaDOM provee la clase base `MitaElement`, que extiende de `HTMLElement`, añadiéndole soporte para Signals (Reactividad) y prevención de errores (Error Boundaries).

## 2. Shadow DOM (Encapsulamiento)

El Shadow DOM es un "DOM dentro del DOM". Sirve para que el CSS y los IDs de tu componente no afecten al resto de la página, y viceversa. Es la solución definitiva al CSS global.

```javascript
class MitaBoton extends HTMLElement {
  constructor() {
    super();
    // Creamos un Shadow DOM "abierto"
    this.attachShadow({ mode: 'open' }); 
  }

  connectedCallback() {
    // El estilo solo aplicará a este botón
    this.shadowRoot.innerHTML = `
      <style>
        button { background: red; color: white; }
      </style>
      <button>Soy rojo y no rompo tu CSS global</button>
    `;
  }
}
```

En la librería usamos el Shadow DOM específicamente en el `<mita-code-editor>`, para que las reglas CSS del resaltado de sintaxis no interfieran con tu proyecto principal.

## 3. Atributos Data (`data-*`) vs Propiedades JS

El HTML es estático, el JS es dinámico. ¿Cómo se comunican?
En MitaDOM usamos intensivamente los `data-attributes` para el estado inicial, y la API nativa de observables para la reactividad.

```html
<!-- HTML Estático -->
<demo-perfil data-user-id="123" data-theme="dark"></demo-perfil>
```

```javascript
// Dentro del Web Component (JS)
const userId = this.dataset.userId; // "123"
```

## Resumen Arquitectónico

Al usar estos fundamentos web (Custom Elements + Shadow DOM + Data Attributes), obtenemos:
1. **0 Dependencias:** Funciona en cualquier navegador sin necesidad de npm install react.
2. **Framework Agnostic:** Un `<mita-dialog>` funcionará perfecto dentro de Vue, Svelte, React o jQuery.
3. **Alto Rendimiento:** El navegador optimiza nativamente estas APIs, están escritas en C++, mucho más rápidas que un Virtual DOM en JavaScript.
