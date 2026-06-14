# 📦 Guía de Estados (CRUD) y Comunicación entre Componentes

Entender cómo crear y mutar el estado de tu aplicación es vital. En MitaDOM, no existe el "prop drilling" (pasar variables de componente hijo a componente nieto interminablemente).

## 1. El Estado Local (`crearEstadoLocal`)
Úsalo cuando el dato le pertenece EXCLUSIVAMENTE a un solo componente. Por ejemplo, si un modal está abierto o cerrado, o el valor de un campo de texto en un formulario en progreso.

```javascript
import { crearEstadoLocal } from 'mita-dom';

export class MiFormulario extends MitaElement {
    constructor() {
        super();
        this.nombreUsuario = crearEstadoLocal('');
    }
    
    iniciarLogica() {
        const input = this.querySelector('input');
        input.addEventListener('input', (e) => {
            // Update: Sobrescribe el valor primitivo completo
            this.nombreUsuario.update(e.target.value);
        });
        
        this.nombreUsuario.suscribir(nombre => {
            this.querySelector('#saludo').textContent = `Hola, ${nombre}!`;
        });
    }
}
```

## 2. El Estado Global (`crearEstadoGlobal`)
Úsalo cuando múltiples componentes (incluso en páginas distintas) necesitan acceder o mutar los mismos datos (Ej. Carrito de Compras, Autenticación de Usuario).

**Consejo de Arquitectura:** Siempre define los Estados Globales en una carpeta `store/` y expórtalos, nunca dentro de un componente.

```javascript
// src/store/carritoStore.js
import { crearEstadoGlobal } from 'mita-dom';

export const carritoStore = crearEstadoGlobal({
    items: [],
    total: 0
});
```

### Comunicación entre Componentes (El Fin del Prop Drilling)
Con el Estado Global, Componente A (Ej. La barra lateral) y Componente B (Ej. La vista principal) se comunican instantáneamente.

- **Componente A (Escribe)**: Importa el `carritoStore` y ejecuta `carritoStore.patch({ items: nuevosItems })`.
- **Componente B (Lee/Escucha)**: Importa el mismo `carritoStore` y usa `carritoStore.suscribir(estado => actualizarUI(estado))`.

¡Listo! No tienes que emitir eventos manuales ni preocuparte de si el Componente B existe aún en el DOM.

## 3. Ejemplo CRUD Completo
Veamos cómo crear un TODO List interactuando con un Estado Global.

```javascript
// 1. CREATE
function agregarItem(nuevoItem) {
    const estado = carritoStore.get();
    carritoStore.patch({ items: [...estado.items, nuevoItem] });
}

// 2. READ
carritoStore.suscribir(estado => {
    console.log("Leyendo items:", estado.items);
});

// 3. UPDATE
function actualizarItem(id, nuevoNombre) {
    const estado = carritoStore.get();
    const nuevosItems = estado.items.map(item => 
        item.id === id ? { ...item, nombre: nuevoNombre } : item
    );
    carritoStore.patch({ items: nuevosItems });
}

// 4. DELETE
function borrarItem(id) {
    const estado = carritoStore.get();
    const filtrados = estado.items.filter(item => item.id !== id);
    carritoStore.patch({ items: filtrados });
}
```

> [!TIP]
> Observa que siempre usamos `carritoStore.get()` para obtener la "foto" (snapshot) actual del estado, y devolvemos un array o objeto **nuevo**. MitaDOM está diseñado para abrazar la Inmutabilidad Funcional. No uses `push` o `splice` mutando el objeto original.
