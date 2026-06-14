# 🚀 JavaScript Moderno (ES6+)

MitaDOM está construido sobre las bases más sólidas de JavaScript moderno. Entender estas características te ayudará a sacar el máximo provecho de la librería y escribir código más limpio y mantenible.

## 1. ES Modules (ESM)

En MitaDOM, todo funciona a través de módulos nativos. Atrás quedaron los días de importar variables globales.

```javascript
// Exportar desde un archivo (store.js)
export const estadoAppGlobal = new SignalDerivado({ contador: 0 });

// Importar donde lo necesites (componente.js)
import { estadoAppGlobal } from './store.js';
```

## 2. Clases y Herencia (Web Components)

Los Web Components nativos se benefician enormemente de la sintaxis de clases de ES6.

```javascript
import { MitaElement } from 'mita-dom';

class MiComponente extends MitaElement {
  constructor() {
    super(); // Llama al constructor padre
    this.attachShadow({ mode: 'open' }); // Encapsulamiento
  }

  // Método asíncrono moderno
  async render() {
    this.shadowRoot.innerHTML = `<h1>¡Hola Mundo!</h1>`;
  }
}
customElements.define('mi-componente', MiComponente);
```

## 3. Arrow Functions y Contexto (`this`)

Las funciones flecha no solo son más cortas, sino que **no crean su propio contexto `this`**, heredándolo de la función padre. Esto es crucial al usar `suscribir` en MitaDOM.

```javascript
// ❌ Función tradicional: pierde el 'this' de la clase
estadoAppGlobal.suscribir(function(estado) {
  this.actualizarUI(estado); // ERROR: this es undefined
});

// ✅ Arrow function: mantiene el 'this' de la clase
estadoAppGlobal.suscribir((estado) => {
  this.actualizarUI(estado); // Funciona perfectamente
});
```

## 4. Destructuración y Spread Operator

Manipular estados inmutables en MitaDOM requiere crear nuevas copias de objetos. Aquí brilla el _Spread Operator_ (`...`).

```javascript
// Actualizando un objeto complejo reactivo
estadoAppGlobal.set({
  ...estadoAppGlobal.value, // Copiamos lo anterior
  contador: estadoAppGlobal.value.contador + 1 // Sobrescribimos el contador
});
```

## 5. Optional Chaining (`?.`) y Nullish Coalescing (`??`)

Protege tus renders de variables indefinidas de forma elegante.

```javascript
// En lugar de hacer validaciones largas:
const nombre = (usuario && usuario.perfil) ? usuario.perfil.nombre : 'Invitado';

// Usamos JS Moderno:
const nombre = usuario?.perfil?.nombre ?? 'Invitado';
```

Al dominar estos conceptos, el uso de MitaDOM (y de cualquier librería moderna) se sentirá fluido y natural.
