# Web APIs Modernas (Production Ready 2026)

Como Frontend Senior, debes dominar las APIs web nativas más recientes. El estándar de la plataforma web ha evolucionado enormemente, reduciendo la necesidad de depender de librerías externas pesadas (como Moment.js o React Router).

## 1. Temporal API (Fechas y Zonas Horarias)

Manipular fechas en JavaScript históricamente ha sido un dolor de cabeza debido a los defectos del objeto `Date` original. La **Temporal API** es la solución moderna y nativa.

> [!WARNING] Polyfill Necesario en 2026
> Aunque es un estándar oficial, para tener soporte global cross-browser en producción, se recomienda instalar el polyfill oficial:
> [Temporal API Polyfill (@js-temporal/polyfill)](https://www.npmjs.com/package/@js-temporal/polyfill)

### Ejemplo Práctico (Bolivia - America/La_Paz)

```javascript
import { Temporal } from '@js-temporal/polyfill'; // Solo si no hay soporte nativo aún

// Obtener la fecha y hora actual en Bolivia
const ahoraBolivia = Temporal.Now.zonedDateTimeISO('America/La_Paz');
console.log(`Hora exacta en La Paz: ${ahoraBolivia.toString()}`);

// Calcular diferencias (Duraciones)
const eventoFuturo = Temporal.ZonedDateTime.from('2026-12-31T23:59:59[America/La_Paz]');
const faltaParaEvento = ahoraBolivia.until(eventoFuturo);
console.log(`Faltan ${faltaParaEvento.months} meses y ${faltaParaEvento.days} días.`);
```

## 2. Navigation API (Enrutamiento SPA)

La Navigation API reemplaza al antiguo `window.history` proporcionando una API mucho más predecible y segura para interceptar navegaciones, perfecta para frameworks como MitaDOM.

### Ejemplo de Uso

```javascript
// Interceptar todos los clics a enlaces y navegaciones
navigation.addEventListener('navigate', (event) => {
    // Solo interceptar si es del mismo dominio
    if (!event.canIntercept) return;

    const urlDestino = new URL(event.destination.url);
    
    // Interceptar la navegación y proveer nuestra propia transición (MitaDOM Router)
    event.intercept({
        async handler() {
            // Mostramos un spinner global
            mostrarLoader();
            
            // Renderizamos la nueva vista
            await renderizarVistaDinamicamente(urlDestino.pathname);
            
            ocultarLoader();
        }
    });
});
```

## 3. Elemento Nativo `<dialog>` (Modales accesibles)

Crear modales en el pasado requería contenedores flotantes, fondos oscuros (backdrops) manuales, y pelear con el *z-index hell*. Hoy, HTML5 nos provee `<dialog>`.

### Ventajas del `<dialog>` nativo:
- Aparece automáticamente en el *Top Layer* (la capa más alta del navegador, por encima de cualquier `z-index: 9999`).
- Maneja el "Focus Trapping" (no puedes hacer tab fuera del modal).
- Cierra el modal automáticamente al presionar la tecla `ESC`.

### HTML5 Semántico
```html
<dialog id="mi-modal-moderno" class="mita-modal">
    <div class="mita-modal-header">
        <h2>Confirmación de Acción</h2>
    </div>
    <div class="mita-modal-body">
        <p>¿Estás seguro de que deseas eliminar este estado global?</p>
    </div>
    <form method="dialog" class="mita-modal-footer">
        <!-- El form method="dialog" cierra el modal automáticamente al enviar -->
        <button value="cancelar">Cancelar</button>
        <button value="confirmar" class="btn-primary">Sí, Eliminar</button>
    </form>
</dialog>
```

### JavaScript Moderno
```javascript
const modal = document.getElementById('mi-modal-moderno');

// Abrir el modal sobreponiéndose a todo (Top Layer) y bloqueando el fondo
modal.showModal();

// Abrir el modal sin bloquear el fondo (raro, pero posible)
// modal.show();

// Escuchar qué botón presionó el usuario
modal.addEventListener('close', () => {
    console.log(`El usuario decidió: ${modal.returnValue}`);
    if (modal.returnValue === 'confirmar') {
        // Ejecutar acción
    }
});
```

### Estilización de Fondo (Backdrop)
El seudoelemento `::backdrop` te permite oscurecer o desenfocar el fondo de la aplicación.
```css
dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px); /* Desenfoque tipo vidrio / Glassmorphism */
}
```
