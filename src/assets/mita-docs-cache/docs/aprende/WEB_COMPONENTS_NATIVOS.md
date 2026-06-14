# 🧩 Web Components Nativos y Props

Uno de los mayores errores de los desarrolladores que vienen de React o Vue es creer que necesitan directivas especiales (`:prop`, `v-bind`) para pasar datos entre componentes. **MitaDOM usa los estándares nativos de la W3C (HTML5 Custom Elements)**. Esto significa que todo lo que aprendes aquí, te servirá en cualquier lugar de la web.

Existen dos maneras fundamentales de pasar información (Props) a un componente en MitaDOM: Mediante **Atributos HTML** (Strings) o mediante **Propiedades de Instancia** (Cualquier tipo de dato).

## 1. Tipos de Custom Elements
Según las especificaciones de la W3C, puedes crear dos tipos de elementos:
- **Autonomous Custom Elements (Autónomos)**: Heredan de `HTMLElement` (o en nuestro caso, de `MitaElement`). Se implementan desde cero y se usan como `<mi-tarjeta></mi-tarjeta>`.
- **Customized Built-in Elements**: Heredan de elementos nativos específicos como `HTMLParagraphElement`. Su sintaxis en HTML usa el atributo `is`: `<p is="word-count"></p>`. *(Nota: Apple/Safari tiene resistencia a implementar esto último, por lo que MitaDOM se enfoca principalmente en elementos autónomos).*

## 2. El Ciclo de Vida (Lifecycle Callbacks)
El navegador expone "ganchos" (callbacks) que se ejecutan automáticamente. Al extender `MitaElement`, ya manejamos parte de esto por ti (ej. llamando a `render()`), pero es vital que conozcas los métodos nativos:

- `connectedCallback()`: Se llama cada vez que el elemento se inserta en el DOM. MitaDOM usa este método internamente para disparar tu `render()` asíncrono.
- `disconnectedCallback()`: Se llama cuando el elemento es destruido del DOM. **Es tu responsabilidad usar este método para destruir suscripciones a Signals Globales** y limpiar EventListeners del `window` o `document`, para evitar *Memory Leaks*.
- `attributeChangedCallback(name, old, new)`: Reacciona a cambios en los atributos HTML que especificaste en `observedAttributes`.

## 3. Atributos HTML (El estándar W3C)

Cuando pasas información a través de HTML, estás pasando *Strings*. 
```html
<mi-tarjeta titulo="Hola Mundo" color="rojo"></mi-tarjeta>
```

Para reaccionar a estos atributos, debes usar `observedAttributes` y `attributeChangedCallback`.

### Ejemplo Práctico:

```javascript
import { MitaElement } from 'mita-dom';

export class MiTarjeta extends MitaElement {
  // 1. Declaramos qué atributos queremos "observar" nativamente
  static observedAttributes = ['titulo', 'color'];

  constructor() {
    super(); // Siempre llamar a super() primero
  }

  // 2. Se dispara automáticamente cada vez que un atributo observado cambia
  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`El atributo ${name} cambió de ${oldValue} a ${newValue}`);
    
    // Si el componente ya está en el DOM, forzamos un micro-renderizado
    if (this.isConnected) {
      if (name === 'titulo') this.querySelector('h1').textContent = newValue;
      if (name === 'color') this.style.backgroundColor = newValue;
    }
  }

  async render() {
    // Al renderizar por primera vez, leemos los atributos iniciales
    const titulo = this.getAttribute('titulo') || 'Sin Título';
    this.innerHTML = `<h1>${titulo}</h1>`;
  }
}
customElements.define('mi-tarjeta', MiTarjeta);
```

> [!NOTE]
> **Compatibilidad absoluta**: Esta es la API nativa de JavaScript. Funciona igual si cambias el atributo con `document.querySelector('mi-tarjeta').setAttribute('titulo', 'Nuevo')` o desde el HTML directamente.

## 2. Propiedades de Instancia (Para Objetos y Arrays)

Los Atributos HTML solo aceptan texto. Si necesitas pasar un Array, un Objeto o una Instancia de Clase (por ejemplo, pasarle un Signal a un hijo), debes usar **Propiedades / Getters y Setters**.

```javascript
export class GraficoDinamico extends MitaElement {
  constructor() {
    super();
    this._datosGrafico = []; // Propiedad privada por convención
  }

  // Interceptamos la asignación de la prop
  set datos(nuevosDatos) {
    this._datosGrafico = nuevosDatos;
    this.repintarGrafico(); // Método personalizado
  }

  get datos() {
    return this._datosGrafico;
  }
}
```

### ¿Cómo pasarlo desde el Padre?
Dado que no es un atributo HTML, lo asignas directamente a la instancia del DOM usando JavaScript:

```javascript
// Dentro del componente Padre
iniciarLogica() {
  const $graficoHijo = this.querySelector('grafico-dinamico');
  const misDatos = [10, 20, 50, 100];
  
  // Pasamos el array directamente a la propiedad (set datos)
  $graficoHijo.datos = misDatos; 
}
```

## 3. Estados Locales Internos (`class state`)
No todos los datos vienen de afuera. A veces el componente es dueño de su propio estado (por ejemplo, saber si está "expandido" o "colapsado"). Para esto usamos los `Signals` internos:

```javascript
import { crearEstadoLocal } from 'mita-dom';

export class MiAcordeon extends MitaElement {
  constructor() {
    super();
    // Estado local: Vivirá y morirá con el componente
    this.estadoExpandido = crearEstadoLocal(false);
  }

  iniciarLogica() {
    const $btn = this.querySelector('button');
    const $contenido = this.querySelector('.contenido');

    // Mutamos el Signal local
    $btn.addEventListener('click', () => {
      this.estadoExpandido.set(!this.estadoExpandido.get());
    });

    // Reaccionamos al Signal local
    this.estadoExpandido.suscribir(estaAbierto => {
      $contenido.style.display = estaAbierto ? 'block' : 'none';
    });
  }

  // Las Web APIs de JavaScript nos obligan a limpiar la memoria
  disconnectedCallback() {
    super.disconnectedCallback?.();
    // Destrucción CRUD completa del estado local para prevenir Memory Leaks
    this.estadoExpandido.destroy(); 
  }
}
```

> [!TIP]
> **MitaDOM vs Frameworks Antiguos**: En MitaDOM, no necesitas `@Input`, `props: []`, o `defineProps()`. Si es texto, usas `observedAttributes` nativo. Si es un objeto, usas `set propiedad()`. Es puro JavaScript vainilla, sin compiladores intermedios.

## 4. Estados Personalizados CSS (Custom State Pseudo-class)

Los elementos nativos HTML tienen estados internos (`:hover`, `:disabled`, `:checked`) que puedes estilizar fácilmente en CSS. Los Custom Elements autónomos también pueden definir sus propios estados internos y exponerlos al CSS usando la API `ElementInternals` y la pseudo-clase `:state()`.

### Ejemplo Práctico (`CustomStateSet`):
Supongamos que tu componente puede estar en estado "colapsado". En lugar de hacer malabares añadiendo o quitando clases `.is-collapsed` en el DOM, usamos el estándar nativo:

```javascript
export class MiAcordeon extends MitaElement {
  constructor() {
    super();
    // Adjuntamos internals al elemento (requerido para Custom States)
    this._internals = this.attachInternals();
  }

  // Getter del estado
  get colapsado() {
    return this._internals.states.has("colapsado");
  }

  // Setter del estado
  set colapsado(flag) {
    if (flag) {
      this._internals.states.add("colapsado"); // "true"
    } else {
      this._internals.states.delete("colapsado"); // "false"
    }
  }
}
```

Y en tu archivo CSS (ej. `mi-acordeon.css`):
```css
mi-acordeon {
  height: 200px;
  overflow: hidden;
}

/* Selección nativa del estado interno! */
mi-acordeon:state(colapsado) {
  height: 40px;
}
```
Esto asegura que la encapsulación del estado interno del componente sea respetada, mientras permites a los consumidores estilarlo mediante CSS de forma semántica y limpia.
