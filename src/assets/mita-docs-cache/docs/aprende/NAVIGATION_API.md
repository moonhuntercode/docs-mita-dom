# Navegación Avanzada: La Web Navigation API en MitaDOM

> 💡 **Baseline 2026:** MitaDOM fue construido pensando en el futuro. Por eso, abandonamos la antigua y frágil `History API` (`pushState`) y adoptamos el estándar nativo **Navigation API** (`window.navigation`).

## 1. El Problema con History API

Antes de 2026, las Single Page Applications (SPAs) sufrían de un gran problema:
1. Había que escuchar todos los eventos `click` globales, usar `e.preventDefault()`, y luego llamar a `history.pushState()`.
2. `history.state` era engañoso. Los datos se perdían o sobrescribían fácilmente.
3. No había forma nativa de interceptar o abortar una navegación en progreso de manera elegante.

## 2. La Solución: window.navigation

La moderna Navigation API resuelve todo esto, y MitaDOM se aprovecha de ello de manera interna. El núcleo de nuestro enrutador hace literalmente esto:

```javascript
window.navigation.addEventListener('navigate', (event) => {
    const urlDestino = new URL(event.destination.url);

    // Solo interceptamos navegaciones de nuestro dominio
    if (urlDestino.origin === window.location.origin) {
        event.intercept({
            handler() {
                // Mutamos nuestro Signal Reactivo. Todo el DOM se actualizará solo.
                rutaActual.set(urlDestino.pathname);
            }
        });
    }
});
```

### ¿Qué hace `event.intercept()`?
Cuando un usuario hace click en un enlace `<a href="/perfil">`, el navegador intenta recargar la página entera. `event.intercept()` atrapa ese intento, lo cancela, y en su lugar ejecuta nuestra función (que simplemente cambia un Signal y renderiza el componente en la misma página).

## 3. Estado Avanzado: getState()
Con MitaDOM, puedes aprovechar `window.navigation.currentEntry.getState()` para guardar estados complejos que sobreviven incluso a recargas o si el usuario navega hacia adelante o atrás.

```javascript
// Actualizamos la URL y le adjuntamos un estado (ej: scroll actual)
window.navigation.navigate('/perfil', { state: { scrollY: 500 } });

// Más tarde, cuando el usuario regrese a esta página:
const estado = window.navigation.currentEntry.getState();
console.log(estado.scrollY); // 500
```

## 4. Telemetría y Dashboard Integrado

Dado que tenemos control absoluto de las rutas, hemos incluido un ecosistema de **Telemetría Avanzada**.
En modo producción, cada navegación y error genera un Log persistente en IndexedDB usando nuestro Signal `telemetryStore`.

Puedes ver esto en acción ingresando a la vista `/dashboard` en tu aplicación. ¡Ahí verás filtrado granular de todo lo que ocurre en el enrutamiento y la renderización de tu SPA, guardado de forma persistente!
