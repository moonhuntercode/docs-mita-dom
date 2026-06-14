# 🚀 JavaScript Moderno (Vanilla ES6+)

En MitaDOM no usamos Babel, Webpack, ni transpiladores por defecto. Aprovechamos que los motores V8 (Chrome) y SpiderMonkey (Firefox) ya implementan el 99% de las características modernas.

Aquí te explicamos las herramientas clave que usa la librería internamente.

## 1. ES Modules Nativos (`import` / `export`)

Ya no necesitamos requerir scripts globales. Cada archivo en MitaDOM es un módulo independiente con su propio alcance (scope).

```javascript
// store.js (Exportamos una instancia de Signal)
import { Signal } from 'mita-dom';
export const contador = new Signal(0);
```

```javascript
// componente.js (Importamos lo que necesitamos)
import { contador } from './store.js';

contador.suscribir(valor => console.log('Nuevo valor:', valor));
```
**Ventaja:** Permite *Tree Shaking*. Si no importas la clase `<mita-dialog>`, el compilador de Vite no la incluirá en el archivo final.

## 2. Proxies (La Magia de la Reactividad)

Frameworks viejos como Vue 2 usaban `Object.defineProperty`. MitaDOM (y Vue 3) utiliza la API moderna `Proxy` para interceptar operaciones sobre objetos.
Así es como sabemos cuándo mutas el Estado Global.

```javascript
const estadoReal = { activo: false };

// El Proxy es como un guardaespaldas del objeto
const estadoReactivo = new Proxy(estadoReal, {
  set(target, propiedad, valorNuevo) {
    console.log(`¡Alguien cambió ${propiedad} a ${valorNuevo}!`);
    target[propiedad] = valorNuevo;
    // Aquí es donde MitaDOM repinta la UI 🎨
    return true;
  }
});

estadoReactivo.activo = true; // Consola: ¡Alguien cambió activo a true!
```

## 3. Map y Set (Estructuras de Datos Óptimas)

En MitaDOM usamos `Map` y `Set` en lugar de Objetos (`{}`) y Arrays (`[]`) para el caché y el registro de eventos, porque son exponencialmente más rápidos para búsquedas directas.

```javascript
// DOCS_MAP en MitaDocs es un objeto nativo, 
// pero internamente el router guarda los componentes en Map.
const cacheComponentes = new Map();

cacheComponentes.set('/ruta', MitaElement);
if (cacheComponentes.has('/ruta')) {
  // Búsqueda en O(1) constante, ultrarrápida
  const Elemento = cacheComponentes.get('/ruta');
}
```

## 4. Clases y "this" contextual

Las clases en JS son azúcar sintáctico sobre prototipos, pero son perfectas para Web Components.

```javascript
class MitaBase {
  constructor() {
    // Al hacer 'bind', aseguramos que `this` siempre sea la clase,
    // incluso si pasamos esta función a un evento (click).
    this.manejarClick = this.manejarClick.bind(this);
  }
}
```

Con estas bases, puedes leer y modificar cualquier archivo del núcleo (core) de `mita-dom` sin sentirte abrumado. ¡Es puro JavaScript!
