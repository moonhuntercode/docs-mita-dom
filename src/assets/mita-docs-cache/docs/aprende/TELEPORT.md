# Teleport y Suspense en MitaDOM

MitaDOM proporciona dos herramientas avanzadas para manejar el flujo del DOM de manera declarativa sin depender de un Virtual DOM pesado: **Teleport** y **Suspense**.

## 🚀 1. El Componente `<mita-teleport>`

El componente Teleport te permite renderizar un bloque de HTML en un lugar diferente del árbol DOM, independientemente de dónde se declare el componente padre. Es extremadamente útil para:
- Modales (`<dialog>`)
- Tooltips y Popovers
- Notificaciones Globales (Toasts)

Al transportar estos elementos al final del `<body>`, evitas problemas de `z-index` y `overflow: hidden` causados por contenedores padres.

### Uso Básico

```html
<div class="tarjeta-restriccion">
  <p>Este contenedor tiene overflow: hidden</p>
  
  <!-- Usando Teleport para mover el modal fuera de este contenedor -->
  <mita-teleport to="body">
    <mita-dialog id="modal-global">
      <span slot="titulo">Modal Global</span>
      <p>Este modal flota sobre toda la app, evitando las restricciones del contenedor.</p>
    </mita-dialog>
  </mita-teleport>
</div>
```

**Propiedades:**
- `to`: Un selector CSS válido (ej. `body`, `#modals-container`). Indica a dónde se moverá el contenido.

---

## ⏳ 2. Suspense y Carga Condicional

MitaDOM implementa patrones inspirados en React Suspense para manejar operaciones asíncronas (como un `fetch`) y mostrar estados de carga y error de forma elegante, integrándose perfectamente con nuestros Signals.

### El Patrón de Carga Asíncrona

Usando el componente `<mita-suspense>` (o lógica manual mediante Signals Condicionales), puedes envolver código que requiere carga.

```html
<mita-suspense id="mi-suspense">
  <template slot="fallback">
    <div class="spinner">Cargando datos remotos...</div>
  </template>
  
  <template slot="error">
    <div class="alerta-error">Ocurrió un error de red.</div>
  </template>

  <!-- Contenido principal que se inyectará cuando la promesa se resuelva -->
  <div id="contenido-final">
    <!-- Datos inyectados aquí -->
  </div>
</mita-suspense>
```

### Integración con Signals (Manual)

Si prefieres tener control absoluto, el patrón recomendado es usar un Signal de estado local:

```javascript
import { crearEstadoLocal } from 'mita-dom';

const estadoRed = crearEstadoLocal({
    cargando: false,
    error: null,
    datos: null
});

estadoRed.suscribir((estado) => {
    const $uiFeedback = this.querySelector('#ui-feedback');
    const $uiContenido = this.querySelector('#ui-contenido');

    if (estado.cargando) {
        $uiFeedback.innerHTML = '<span class="loader">⏳ Cargando...</span>';
        $uiContenido.style.display = 'none';
    } else if (estado.error) {
        $uiFeedback.innerHTML = `<span class="error">❌ ${estado.error}</span>`;
        $uiContenido.style.display = 'none';
    } else if (estado.datos) {
        $uiFeedback.innerHTML = '✅ Carga completada';
        $uiContenido.innerHTML = `<pre>${JSON.stringify(estado.datos, null, 2)}</pre>`;
        $uiContenido.style.display = 'block';
    }
});
```

Al combinar **Signals** para la lógica asíncrona y **Teleport** para la proyección UI, logras un sistema de *Renderizado Condicional* a la par de los grandes frameworks, pero con la huella de memoria nula de MitaDOM.
