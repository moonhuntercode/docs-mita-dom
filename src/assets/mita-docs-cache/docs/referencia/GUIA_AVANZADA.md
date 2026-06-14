# 🚀 Guía Avanzada MitaDOM: El Poder del Navegador Nativo

MitaDOM no reinventa la rueda; le quita los frenos. Mientras otros frameworks construyen abstracciones gigantescas (Virtual DOM, Synthetic Events) para emular características, nosotros usamos **las APIs nativas escritas en C++ por los motores de los navegadores**. Esta guía te enseñará cómo lograr todo lo que hace un framework pesado, pero a la velocidad de la luz.

---

## 📖 Historia y Contexto: ¿Por qué creamos SPAs?

Antes de las Single Page Applications (SPAs), cada clic en un enlace obligaba al navegador a pedir un archivo HTML completamente nuevo al servidor. La pantalla se quedaba en blanco y se recargaba por completo (Renderizado Multi-Página o MPA). Esto generaba una experiencia de usuario (UX) lenta y pesada, especialmente en conexiones móviles, ya que se volvían a descargar el mismo encabezado (Header) y pie de página (Footer) una y otra vez.

**¿Qué problema solucionan las SPAs?**
Las SPAs resuelven esto enviando una sola página HTML (`index.html`) al inicio. A partir de ahí, JavaScript toma el control del enrutamiento. Cuando el usuario hace clic en un enlace, JavaScript intercepta la acción, pide solo los datos crudos (JSON) al servidor, y "repinta" solo la porción de la pantalla que cambió.

- **Beneficios:** UX ultra-fluida (como una app nativa móvil), transiciones instantáneas, y menor carga de datos repetitivos en la red.
- **Contras:** SEO inicialmente complicado (Googlebots tardaban en leer el JS), tiempo de carga inicial más pesado, y complejidad arquitectónica al manejar el estado global.
- **Casos de Uso Ideales:** Dashboards, Paneles de Administración (SaaS), Editores Web, Redes Sociales. (Para un blog de texto estático, una MPA o SSG suele ser la mejor alternativa).

---

## 🏗️ 1. Arquitectura Base y Layouts Estables

La web nació semántica, y así debe estructurarse. Un *Layout* estable es vital para el SEO y la UX.

### Maestría en HTML5 Semántico

Antes de escribir un solo estilo, tu HTML debe tener sentido lógico para los motores de búsqueda y lectores de pantalla (A11y).

- Nunca uses `<div>` si existe una etiqueta mejor.
- `<header>`, `<main>`, `<aside>` y `<footer>` definen la anatomía macro.
- `<section>` agrupa contenido temático. `<article>` se usa para contenido que tendría sentido por sí solo (ej. un post de un blog o una tarjeta de producto).
- `<dialog>` debe usarse siempre para modales y alertas.

### Layouts con CSS Grid y Modern CSS

Para estructurar el cascarón de tu aplicación (*Shell*), la mejor práctica moderna es usar **CSS Grid**. La propiedad `grid-template-areas` te permite "dibujar" literalmente un mapa visual de tu interfaz, lo cual es inmensamente más declarativo que usar flotantes o flexbox anidados:

```css
.app-container {
  display: grid;
  /* Ejemplo: 4 columnas, y altura de filas automática */
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  grid-template-rows: auto;
  grid-auto-flow: column;
  
  /* Un mapa visual de la estructura (cada palabra representa una celda) */
  grid-template-areas: 
    "header header header header"
    "main main . sidebar"
    "footer footer footer footer";
}

/* Asignación de cada elemento semántico a su área nombrada */
header { grid-area: header; }
main { grid-area: main; }
aside { grid-area: sidebar; }
footer { grid-area: footer; }
```

**Nota sobre celdas:** Un punto (`.`) significa una celda vacía. Puedes repetir nombres de áreas para que el elemento ocupe múltiples celdas. Con esto, cambiar el diseño en móviles es tan simple como redefinir el `grid-template-areas` dentro de un Media Query.

### HTML Semántico (El Shell de la Aplicación)

Tu `index.html` debe ser el esqueleto inmutable que consuma este layout:

```html
<body>
  <!-- Header Fijo (Carga una sola vez) -->
  <header>
    <nav aria-label="Menú Principal">
      <a href="/">Inicio</a>
      <a href="/blog">Blog</a>
    </nav>
  </header>

  <!-- El contenedor dinámico donde las vistas vivirán -->
  <main id="app-container" aria-live="polite">
      <!-- Los Web Components se mostrarán/ocultarán aquí -->
  </main>

  <!-- Footer Fijo -->
  <footer>© 2026 MitaDOM</footer>
</body>
```

**Viabilidad para Blogs y SEO:** Este enfoque (*Light DOM*) asegura que los motores de búsqueda de Google lean el `<header>`, el `<main>` y todo el texto interno sin tener que ejecutar toneladas de JavaScript, solucionando los problemas clásicos del SEO en las SPAs.

---

## 🔄 2. Ciclo de Vida y la Alternativa a `<Suspense>`

En React, `<Suspense>` muestra un *loader* mientras el JS, CSS o datos asíncronos terminan de cargar. En MitaDOM, usamos las promesas nativas y el ciclo de vida del *Web Component*.

### Entendiendo el Ciclo de Vida Nativo

- `connectedCallback()`: Se ejecuta cuando el HTML se inyecta en la página. Aquí solicitas tus datos y tu CSS.
- `disconnectedCallback()`: Se ejecuta cuando el nodo se destruye. **Siempre** desuscribe tus *Signals* aquí para evitar fugas de memoria.

### Simulando `<Suspense>` Manual

```javascript
async connectedCallback() {
    // 1. Mostrar estado "Suspense" (Skeleton Loader)
    this.innerHTML = `<p class="esqueleto-loader">Cargando componente...</p>`;
    
    // 2. Esperar CSS, HTML y Fetch de forma paralela (Máximo rendimiento)
    const [css, html, datos] = await Promise.all([
        fetch('estilos.css').then(r => r.text()),
        fetch('vista.html').then(r => r.text()),
        fetch('/api/datos').then(r => r.json())
    ]);

    // 3. Render final (El Suspense ha terminado)
    this.innerHTML = `<style>${css}</style>${html}`;
    this.querySelector('#nombre').textContent = datos.nombre;
}
```

---

## 🧭 3. Enrutamiento Dinámico con `URLPattern`

No necesitas pesadas librerías de enrutamiento. El navegador ahora soporta `URLPattern` nativamente para capturar variables de la URL (ej. `/blog/123`).

```javascript
import { rutaActual } from 'mita-dom';

const patronBlog = new URLPattern({ pathname: '/blog/:slug' });

rutaActual.suscribir(ruta => {
    // 1. Rutas Dinámicas
    if (patronBlog.test({ pathname: ruta })) {
        const parametros = patronBlog.exec({ pathname: ruta });
        console.log("Cargando el post:", parametros.pathname.groups.slug);
        mostrarComponente('<mita-post>');
        return;
    }

    // 2. Ruta 404 (Buenas Prácticas Catch-All)
    // En una app real, evitamos hardcodear `ruta !== '/ruta'`. Usamos un registro de rutas registradas:
    const rutasEstaticas = ['/', '/perfil', '/ajustes', '/dashboard'];
    const esRutaDinamicaValida = patronBlog.test({ pathname: ruta });
    
    if (!rutasEstaticas.includes(ruta) && !esRutaDinamicaValida) {
        console.warn(`Ruta desconocida (404): ${ruta}`);
        mostrarComponente('<mita-404>');
    }
});
```

---

## 📝 4. Formularios, Feedback y Diálogos Reusables

### La API `setCustomValidity`

Olvídate de crear estados booleanos para validar inputs. Usa la API del navegador:

```javascript
inputEmail.addEventListener('input', (e) => {
    if (!e.target.value.includes('@')) {
        // Muestra el globo rojo nativo del navegador
        e.target.setCustomValidity('Falta el símbolo @ en tu correo'); 
    } else {
        e.target.setCustomValidity(''); // Válido
    }
});
```

### El elemento nativo `<dialog>`

Crear un Modal accesible ya no requiere 500 líneas de JS.

```html
<!-- HTML -->
<dialog id="mi-modal">
    <h2>Confirmación</h2>
    <p>¿Estás seguro de continuar?</p>
    <button id="cerrar-modal">Cerrar</button>
</dialog>
```

```javascript
// JavaScript
const modal = document.querySelector('#mi-modal');
modal.showModal(); // Lo abre con fondo oscuro (backdrop) y atrapa el foco nativamente
document.querySelector('#cerrar-modal').addEventListener('click', () => modal.close());
```

---

## 🛠️ 5. Developer Experience (DX) y Feedback

La calidad de una librería se mide por cómo trata a sus desarrolladores y usuarios.

- **Feedback en Consola (DX):** En entorno de desarrollo, usa `console.groupCollapsed()` y `console.info()` para agrupar mensajes. Por ejemplo, cada vez que un Signal mute, lanza un aviso: `console.info('🔄 Signal Mutado:', nuevoValor)`. Esto salva horas de depuración.
- **Feedback en Interfaz (UX):** Cuando hagas peticiones a la red (`fetch`), siempre muestra un estado de carga. En MitaDOM, sugerimos crear un componente genérico `<mita-toast>` o usar los estilos visuales conocidos como *Skeleton Loaders* (elementos grises parpadeantes) usando la API asíncrona de Web Components.

---

## ⚡ 6. Rendimiento Extremo

### Loaders de Precisión con `ReadableStream`

En vez de un loader estático, puedes mostrar cuánto porcentaje de la imagen o video ha cargado:

```javascript
const respuesta = await fetch('/video-pesado.mp4');
const longitudTotal = respuesta.headers.get('content-length');
const lector = respuesta.body.getReader();
let recibido = 0;

while(true) {
    const { done, value } = await lector.read();
    if (done) break;
    recibido += value.length;
    console.log(`Cargado: ${(recibido / longitudTotal * 100).toFixed(2)}%`);
}
```

### Animaciones (CSS3 > JS)

Nunca animes posiciones (top, left, height) con JavaScript. Usa CSS3 `transform` y `opacity`, las únicas propiedades aceleradas por la Tarjeta Gráfica (GPU).

### Hilos en Segundo Plano (Web Workers)

¿Tienes que procesar mucha data? No congeles la interfaz. Mándalo a un hilo separado:

```javascript
// main.js
const trabajador = new Worker('procesador.js');
trabajador.postMessage({ datosMasivos: [...] });
trabajador.onmessage = (e) => console.log('Resultado listo:', e.data);

// procesador.js (Corre en otro núcleo del CPU)
onmessage = function(e) {
    const resultado = calcularFibonacciPesado(e.data);
    postMessage(resultado);
}
```

---

## 🌗 6. Renderizado Condicional y Testing

### Conditional Rendering sin Virtual DOM

Usa operadores ternarios al inyectar HTML, o manipula la propiedad `display` a través de los Signals:

```javascript
// En el método connectedCallback()
this.innerHTML = usuarioLogueado 
    ? `<button>Cerrar Sesión</button>`
    : `<button>Iniciar Sesión</button>`;
```

### Testing Automático, Manual y Detección de Re-renders

- **Prevención de Re-Renders (Rendimiento):** Uno de los peores problemas de frameworks como React son los "re-renders en cascada". En MitaDOM, los componentes están asilados por el estándar Web Component. Para testear esto, abre las Chrome DevTools -> Pestaña *Rendering* -> Activa *Paint flashing*. Verás que al actualizar un *Signal*, **solo parpadea de verde el nodo de texto específico** que cambió, y nunca la tarjeta completa. ¡Rendimiento quirúrgico sin re-renderizar todo el componente!
- **Testing Automático:** Usa el módulo nativo `node:test`. Es instantáneo y no requiere configuración. Ideal para la lógica de los Signals, validadores, y utilidades.
- **Testing Manual (E2E):** Te recomendamos usar **Playwright** en tu proyecto cliente para simular clics en el navegador real.

---

## 🔮 7. El Futuro: SSR, SSG y PWAs

MitaDOM nació como una librería *Client-Side* (CSR). Sin embargo, la web avanza hacia nuevos horizontes.

### SSG (Static Site Generation)

Para blogs o sitios de documentación, generar el HTML en tiempo de compilación es imbatible. Puedes usar herramientas modernas para pre-renderizar tus componentes `<mita-tarjeta>` en archivos estáticos `.html`. El navegador los descargará instantáneamente y MitaDOM se encargará de "despertarlos" (hidratarlos) cuando el usuario interactúe con ellos.

### SSR (Server-Side Rendering) Universal con `h3`

**¿Se puede usar MitaDOM en SSR?**
¡Absolutamente! Al usar Web Components estándar y *Light DOM*, MitaDOM brilla en el servidor. En lugar de viejas herramientas pesadas como Express.js, recomendamos encarecidamente usar **`h3`** (creado por el equipo de UnJS/Nuxt).

`h3` es un framework HTTP minimalista y universal. Puede correr en Node.js, Bun, Deno o directamente en el "Borde" (Cloudflare Workers/Edge) con cero latencia.
Tu servidor `h3` simplemente retorna un HTML en string (`return "<html>...<mita-tarjeta></mita-tarjeta>...</html>"`). Cuando el HTML crudo llega al usuario (en 10 milisegundos), MitaDOM se descarga en segundo plano y de inmediato "hidrata" esas etiquetas, inyectándoles Signals y reactividad nativa.

*(Nota: En el futuro, publicaremos repositorios oficiales como `example-mita-ssr`, `example-mita-ssg` y `example-mita-hibrid` para demostrar la arquitectura granular en cada escenario específico).*

### PWAs (Progressive Web Apps)

Tu SPA construida con MitaDOM está a un solo paso de ser una aplicación instalable en teléfonos móviles. Solo necesitas:

1. Un archivo `manifest.json` (con los colores, íconos y nombre de la app).
2. Un **Service Worker** (`sw.js`) que intercepte las peticiones de red y cachee tu `index.html` y tu CSS. ¡Tu aplicación ahora funcionará sin conexión a internet (Offline) de manera fluida y nativa!
