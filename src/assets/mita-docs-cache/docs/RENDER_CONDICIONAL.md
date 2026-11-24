# Renderizado Condicional Granular con Signals en MitaDOM

MitaDOM introduce el paradigma de **Granular DOM** mediante la función `renderCondicional`. Esta utilidad permite suscribir un bloque de UI a un `Signal` (Estado Global o Local) e inyectar fragmentos HTML únicamente cuando la evaluación cambia, evitando el anti-patrón de re-escribir todo el componente.

## ¿Por qué usar `renderCondicional`?

- **Rendimiento:** Solo muta el nodo contenedor que le pasas. No toca el resto del componente.
- **Limpieza (No más `display: none`):** Los nodos inactivos se eliminan de memoria, no quedan ocultos en el DOM.
- **Re-cálculo Inteligente:** Solo toca el DOM si el resultado de la función evaluadora (booleana) realmente cambia (Ej: `true -> false`).

---

## 🚀 Sintaxis Básica

```javascript
import { renderCondicional } from 'mita-dom';

renderCondicional(
    signalReactivado,       // 1. El Signal al que nos suscribiremos
    nodoContenedor,         // 2. El elemento DOM donde inyectaremos el HTML (ej: un <div> vacío)
    evaluadorCallback,      // 3. Función (state) => boolean que decide qué renderizar
    templateVerdadero,      // 4. Función () => string que devuelve HTML si es TRUE
    templateFalso           // 5. Función () => string que devuelve HTML si es FALSE
);
```

---

## 🧑‍💻 Ejemplo Práctico 1: Mostrar/Ocultar un Panel (Estado Local)

Imagina un componente que tiene un botón para desplegar detalles.

```javascript
import { MitaElement, crearEstadoLocal, renderCondicional } from 'mita-dom';

export class PanelDesplegable extends MitaElement {
    alMontar() {
        // 1. Creamos el estado local
        this.uiState = crearEstadoLocal({ abierto: false });
        this.render();
    }

    render() {
        // Estructura Base (Light DOM)
        this.innerHTML = `
            <div class="panel">
                <button id="btn-toggle">Alternar Detalles</button>
                
                <!-- Contenedor Granular donde MitaDOM hará su magia -->
                <div id="contenido-dinamico"></div>
            </div>
        `;

        this.configurarCondicional();
        this.iniciarEventos();
    }

    configurarCondicional() {
        // 2. Aplicamos el render condicional al contenedor
        renderCondicional(
            this.uiState, 
            this.querySelector('#contenido-dinamico'),
            (state) => state.abierto === true, // Si es true...
            () => `
                <div class="detalles-secretos">
                    <p>🔥 Información confidencial cargada exitosamente.</p>
                </div>
            `,
            () => `` // Si es false, inyectamos string vacío (destruye el DOM anterior)
        );
    }

    iniciarEventos() {
        // Al hacer click, parcheamos el Signal. 
        // renderCondicional automáticamente re-pintará '#contenido-dinamico'
        this.querySelector('#btn-toggle').addEventListener('click', () => {
            const estadoActual = this.uiState.get().abierto;
            this.uiState.patch({ abierto: !estadoActual });
        });
    }
}
customElements.define('panel-desplegable', PanelDesplegable);
```

---

## 🧑‍💻 Ejemplo Práctico 2: Dependiendo de Configuración Global (Permisos)

Útil para ocultar formularios administrativos a usuarios sin permisos.

```javascript
import { MitaElement, renderCondicional } from 'mita-dom';
import { authStore } from '../store/authStore.js'; // Tu Signal global

export class PanelAdmin extends MitaElement {
    alMontar() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <h2>Panel Central</h2>
            <div id="area-peligrosa"></div>
        `;

        // Solo inyectamos el botón de borrar base de datos si el rol es ADMIN
        renderCondicional(
            authStore, 
            this.querySelector('#area-peligrosa'),
            (auth) => auth.role === 'ADMIN',
            () => `
                <button style="color: red; border: 2px solid red;">
                    BORRAR BASE DE DATOS
                </button>
            `,
            () => `
                <p>⚠️ No tienes permisos suficientes para ver las herramientas peligrosas.</p>
            `
        );
    }
}
```

## 🧠 Consejos de Arquitectura (Event Delegation)

Dado que `renderCondicional` destruye y crea HTML dentro de su contenedor de forma dinámica, los *Event Listeners* tradicionales (`document.getElementById('x').addEventListener...`) inyectados dentro de las plantillas de `true/false` se perderán cuando el estado mute.

**Solución obligatoria:** Utiliza siempre **Event Delegation** vinculando el evento al componente principal (el que nunca se destruye).

```javascript
iniciarEventos() {
    // Delegamos el evento al elemento padre global 'this'
    this.addEventListener('click', (e) => {
        // Si el usuario hace clic en el botón peligroso (que tal vez ni exista aún en el DOM)
        if (e.target.id === 'btn-peligroso') {
            alert('¡Acción ejecutada con Event Delegation!');
        }
    });
}
```
