# 🏛️ Paradigmas de Componentes en MitaDOM

¡Hola! En MitaDOM creemos que no hay una única "forma correcta" de escribir código. Las necesidades de un proyecto pequeño son muy distintas a las de un sistema empresarial gigante. 

Por eso, nuestra librería es flexible y soporta **tres paradigmas de diseño** nativos. Esta guía te explicará cada uno con un español claro y fácil de entender, mostrándote cómo funciona JavaScript por debajo del capó.

---

## 🧐 ¿Cómo funciona JavaScript por debajo? (El Prototype y las Clases)

Antes de ver los paradigmas, es crucial entender qué es un Web Component. En HTML5, para crear una etiqueta nueva como `<mi-boton>`, el navegador **exige** que le pases una **Clase** (o un Prototipo) que herede de `HTMLElement`.

```javascript
// La forma nativa (y obligatoria) que exige el navegador
class MiBoton extends HTMLElement {
  constructor() {
    super();
  }
}
customElements.define('mi-boton', MiBoton);
```

### ¿Qué es una Clase en JS?
A diferencia de Java o C#, en JavaScript las `class` son simplemente "azúcar sintáctico" (una forma más bonita de escribir) sobre algo llamado **Prototipos (Prototypes)**. Un Prototipo es un objeto del cual otros objetos heredan propiedades. 

Cuando usas la **API Funcional** (estilos Options o Composition) en MitaDOM, por debajo nosotros **generamos esa Clase de forma dinámica por ti**, abstrayéndote de la complejidad y permitiéndote enfocarte solo en la lógica de negocio.

---

## 1. El Estilo POO (Programación Orientada a Objetos)

Este es el estilo clásico. Es ideal para aplicaciones grandes donde necesitas herencia estricta y control absoluto. Extiendes directamente de `MitaElement`.

> [!TIP]
> **Ideal para:** Sistemas empresariales, arquitecturas rígidas, amantes de Java/C#.

```javascript
import { MitaElement } from 'mita-dom';

export class TarjetaUsuario extends MitaElement {
  constructor() {
    super(); // Siempre llamamos al padre
    this.estado = { contador: 0 };
  }

  // Ciclo de vida: Se ejecuta cuando el elemento entra a la pantalla
  alMontar() {
    console.log('El componente está vivo!');
  }

  // Ciclo de vida: Se ejecuta cuando se destruye
  alDesmontar() {
    console.log('Adiós mundo cruel...');
  }

  // La función que pinta tu HTML
  render() {
    this.innerHTML = `
      <div class="tarjeta">
        <h3>Usuario</h3>
        <p>Clicks: ${this.estado.contador}</p>
      </div>
    `;
  }
}

// Registro nativo
customElements.define('tarjeta-usuario', TarjetaUsuario);
```

---

## 2. El Estilo Options API (Basado en Opciones)

Este estilo es perfecto si vienes de **Vue 2** o prefieres una estructura visualmente separada. No usas clases, solo pasas un "objeto de configuración" a la función `definirComponente`.

> [!TIP]
> **Ideal para:** Equipos mixtos, principiantes, código altamente legible y predecible.

```javascript
import { definirComponente } from 'mita-dom';

definirComponente('tarjeta-usuario', {
  
  // 1. El estado reactivo de tu componente
  estado: {
    contador: 0
  },

  // 2. Ciclos de vida claros (alias en español)
  alMontar() {
    // 'this' hace referencia al elemento HTML actual
    this.estado.contador = 10;
  },

  // 3. La vista
  render(estado) {
    return `
      <div class="tarjeta">
        <h3>Usuario</h3>
        <p>Clicks: ${estado.contador}</p>
      </div>
    `;
  }
});
```
Aquí la palabra clave `this` sigue existiendo, pero se oculta mágicamente para el `render`, donde recibes el `estado` directo como parámetro. 

---

## 3. El Estilo Composition API (Hooks-like)

Inspirado en los **Hooks de React** y la **Composition API de Vue 3**. Este paradigma no usa `this` en lo absoluto. En su lugar, usa **Closures** (clausuras de JavaScript) para mantener los datos en la memoria.

Un **Closure** ocurre cuando una función "recuerda" las variables del entorno donde fue creada, incluso después de que esa función termina de ejecutarse.

> [!TIP]
> **Ideal para:** Funciones altamente reutilizables, librerías compartidas, evitar el dolor de cabeza del `this`.

```javascript
import { definirComponente, crearEstadoLocal } from 'mita-dom';

definirComponente('tarjeta-usuario', (elemento) => {
  // --- ZONA DE SETUP (Se ejecuta 1 sola vez) ---
  
  // 1. Estado usando Signals (Hooks-like)
  const contador = crearEstadoLocal(0);

  // 2. Eventos o lógica de montaje
  const incrementar = () => {
    contador.set(contador.get() + 1);
  };

  // Asignamos un evento nativo al DOM (MitaDOM te da acceso al `elemento`)
  elemento.addEventListener('click', incrementar);

  // --- ZONA DE RENDER (Retornamos la función que dibuja) ---
  return () => `
    <div class="tarjeta">
      <h3>Usuario</h3>
      <p>Clicks (Reactivo): ${contador.get()}</p>
      <small>Haz clic en la tarjeta</small>
    </div>
  `;
});
```

### ¿Por qué esto es poderoso?
Al no depender de `this` ni del prototipo de la clase, puedes extraer tu lógica fácilmente:

```javascript
// composables/useContador.js
export function useContador(inicial) {
   const contador = crearEstadoLocal(inicial);
   const incrementar = () => contador.update(v => v + 1);
   return { contador, incrementar };
}

// Y usarlo en cualquier componente
definirComponente('mi-boton', () => {
   const { contador } = useContador(5);
   return () => `<button>${contador.get()}</button>`;
});
```

## Resumen: ¿Cuál elegir?
- Si tu empresa te exige patrones de diseño estrictos: **POO**.
- Si quieres que cualquier desarrollador junior entienda el código en 5 segundos: **Options API**.
- Si quieres crear librerías modulares, extraer lógica compleja, o te encanta la reactividad funcional: **Composition API (Hooks)**.

¡El motor de MitaDOM es exactamente el mismo para los 3! Elige el que haga más feliz a tu equipo.
