# 📡 Entendiendo los Signals en Profundidad

MitaDOM no utiliza el concepto de "Virtual DOM" (como React). En su lugar, utiliza **Signals** para lograr una **Reatividad Granular**.

## ¿Qué es un Signal?

Imagina un Signal como una "caja mágica". 
1. Guardas un valor dentro de la caja.
2. Le dices a la interfaz (UI): *"Quédate mirando esta caja"*.
3. Cuando cambias el valor dentro de la caja, la UI se actualiza automáticamente.

## Tipos de Signals en MitaDOM

### 1. `Signal` Básico
Úsalo para valores primitivos (`string`, `number`, `boolean`).

```javascript
import { Signal } from 'mita-dom';

const nombreUsuario = new Signal("Invitado");

// Leer el valor
console.log(nombreUsuario.value);

// Modificar el valor
nombreUsuario.set("Victor Code");
```

### 2. `SignalDerivado` (Objetos y Arreglos)
Úsalo cuando necesitas almacenar estados complejos (Arrays o Objetos). A diferencia del Signal básico, el `SignalDerivado` está optimizado para reaccionar a mutaciones profundas si cambias toda la referencia.

```javascript
import { SignalDerivado } from 'mita-dom';

const carritoCompras = new SignalDerivado({ items: [], total: 0 });

// Para disparar la reactividad, SIEMPRE pasa una nueva referencia (Inmutabilidad)
carritoCompras.set({
  ...carritoCompras.value,
  items: [...carritoCompras.value.items, 'Laptop']
});
```

## Reactividad: El método `suscribir`

La magia de los Signals ocurre cuando te "suscribes" a ellos.

```javascript
// Dentro de un componente
const $spanTotal = this.querySelector('#total-precio');

carritoCompras.suscribir((nuevoCarrito) => {
  // Esta función se ejecuta CADA VEZ que haces carritoCompras.set()
  $spanTotal.textContent = \`$\${nuevoCarrito.total}\`;
});
```

### ¿Por qué esto es mejor que Virtual DOM?
En React, si el estado `carritoCompras` cambia, React vuelve a ejecutar **toda** la función del componente, calcula la diferencia con el DOM virtual (Diffing), y luego aplica el cambio.

En MitaDOM, si `carritoCompras` cambia, **solo se ejecuta la función dentro de `suscribir`**. El DOM se muta directamente (`textContent = ...`). ¡Esto resulta en un rendimiento altísimo (0ms overhead) y un uso de memoria diminuto!
