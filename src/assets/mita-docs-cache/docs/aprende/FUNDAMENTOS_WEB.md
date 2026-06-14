# 🧠 Fundamentos del Desarrollo Web Moderno

Para dominar MitaDOM, no necesitas aprender "magia" ni un nuevo lenguaje de plantillas. Necesitas dominar el **Desarrollo Web Nativo**. MitaDOM no es más que una capa de reactividad quirúrgica (Signals) sobre los estándares de la W3C.

Esta guía recopila los fundamentos indispensables que todo desarrollador debería conocer.

## 1. El DOM y la Reconciliación

En la era dorada de React, nos convencieron de que el DOM era "lento". Esto dio origen al Virtual DOM (VDOM), una copia en memoria del árbol HTML que se compara en cada render.

**La Realidad Actual**: El DOM moderno es rapidísimo si sabes cómo tocarlo. 
- Cambiar `nodo.textContent = "Hola"` toma menos de un milisegundo.
- El cuello de botella no es el DOM, sino el "Reflow" (cuando el navegador debe recalcular posiciones y tamaños de la página) provocado por escrituras masivas.
- **Cómo lo soluciona MitaDOM**: En vez de recrear un VDOM completo, un `Signal` guarda una referencia exacta a un nodo de texto o a un atributo CSS, y lo actualiza directamente en el DOM real.

## 2. Consumo de APIs (REST y Fetch)

El desarrollo frontend moderno gira en torno a consumir datos asíncronos desde una nube, un microservicio o un backend (Node.js, Python, Go).

### El Flujo Estándar de Peticiones:
1. **Petición**: Usamos `fetch()` para llamar a una URL.
2. **Promesas y Async/Await**: Las peticiones demoran, así que el código debe "esperar" (`await`) la respuesta.
3. **Parseo**: La respuesta suele venir en formato JSON (`await res.json()`).
4. **Manejo de Errores**: Siempre envuelve tus llamadas en `try / catch` para controlar servidores caídos o errores 404/500.

MitaDOM facilita esto combinando `fetch` con un `Signal` que controle la interfaz (Mostrando "Cargando..." o el mensaje de "Error"). Consulta la guía [Datos y APIs](./DATOS_Y_APIS.md) para ejemplos de código real.

## 3. Git y Despliegue en la Nube

Tu código no sirve si solo vive en `localhost`.

### Git: El Sistema de Control de Versiones
MitaDOM está diseñado para el trabajo en equipo. Usa Git para guardar tu código.
- `git add .` (Añade tus cambios)
- `git commit -m "feat: nuevo componente"` (Guarda la foto de tus cambios)
- `git push` (Sube tus cambios a GitHub, GitLab, etc.)

### Build y Despliegue (Vite)
Cuando desarrollas, Vite crea un servidor local. Pero para producción, debes "compilar" (minificar y ofuscar) tu código.

1. Ejecutas `npm run build`.
2. Vite lee tu `vite.config.js` y genera una carpeta `/dist`. Esta carpeta contiene tu `index.html` optimizado y archivos JS/CSS ultra-comprimidos.
3. Subes esa carpeta `/dist` a servicios de nube gratuitos como **Vercel**, **Netlify**, o **Cloudflare Pages**.
4. ¡Listo! Tu SPA (Single Page Application) estará viva en internet.

> [!WARNING]
> Recuerda siempre configurar las reglas de reescritura en tu proveedor de nube para que todas las peticiones apunten a `/index.html` (El famoso *Catch-All* para SPAs).

## 4. Patrones de Arquitectura SPA
En una *Single Page Application*, el usuario descarga el HTML, CSS y JS una sola vez. Cuando el usuario hace clic en "Ir al Perfil", la página *no se recarga*. En su lugar, JavaScript intercepta el clic, cambia la URL en la barra superior (usando la Navigation API) y destruye u oculta secciones del DOM para mostrar la vista del Perfil.

Esto otorga a las SPAs la misma sensación de fluidez y velocidad que una aplicación móvil instalada.
