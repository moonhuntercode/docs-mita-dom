# 🌐 Guía Completa: Estrategias de Render (SSR, SSG, Hybrid, SPA), Auth FormBuilder Re-usable y Consentimiento de Cookies/Analíticas

- **Fecha:** `2026-11-22`
- **Versión:** `mita-dom v2.7.0`
- **Autor:** Victor Code (Bolivia)
- **Origen:** Funcionalidades extraídas de `food-show-1` y estandarizadas en el núcleo de `mita-dom`.

---

## 1. 🚀 Las 4 Estrategias de Render en `mita-dom` (`renderizarVistaUniversal` + `MitaMeta`)

Ahora `mita-dom` es **100% isomórfico**: puedes importar `MitaElement`, `MitaMeta` y `renderizarVistaUniversal` en Node.js (Express/Fastify/Scripts SSG) sin que crashee por falta de `window` o `HTMLElement`.

| Estrategia | Cómo activarla | Qué hace en Servidor | Qué hace en Cliente |
| --- | --- | --- | --- |
| **SSR** | `modo: 'ssr'` | Ejecuta `onInit()`, genera `<head>` SEO con `MitaMeta.renderSSRHead()` y el HTML completo por cada request. | Hidrata eventos sobre el DOM existente. |
| **SSG** | `modo: 'ssg'` | Pre-compila rutas estáticas a `.html` e inyecta `window.__MITA_SSG__ = true`. | Carga instantánea desde CDN sin golpear base de datos. |
| **Hybrid + Islands** | `modo: 'hybrid'` (por defecto) | Vacía el interior de `<tag mita-client="only">` en servidor y pre-renderiza el resto. | Ignora `<tag mita-server="only">` en `connectedCallback()` y solo hidrata las islas interactivas. |
| **CSR / SPA** | `modo: 'csr'` o `static isCSR = true` | Devuelve esqueleto ultraligero `<section id="csr-loader">`. | Renderiza toda la vista en el navegador. |

### Ejemplo de Uso Universal (Node.js + Browser):

```js
import { MitaMeta, renderizarVistaUniversal } from 'mita-dom';

export class PaginaMenu {
  static meta_title = 'Menú Cruceño - MitaDOM';
  static meta_description = 'SSR + Islands con Vanilla JS puro.';

  async onInit() {
    MitaMeta.useHead({
      title: 'Menú Cruceño en Vivo',
      meta: [{ name: 'description', content: 'Renderizado con MitaDOM Universal' }]
    });
  }

  render() {
    return `
      <article>
        <header mita-server="only"><h1>Encabezado Estático SSR (0 JS en cliente)</h1></header>
        <mita-carrito mita-client="only">Este interior se limpia en SSR y solo corre en cliente</mita-carrito>
      </article>
    `;
  }
}

// En tu servidor Express o script SSG:
const { head, body, modoAplicado } = await renderizarVistaUniversal(PaginaMenu, {
  url: '/menu',
  modo: 'hybrid'
});
```

---

## 2. 🔐 Formulario Re-usable para Todo + Auth Condicional (`crearFormularioReusable` y `crearControladorAuth`)

En lugar de escribir validaciones repetitivas para Login, Registro, Contacto o Configuración, usa `crearFormularioReusable()` o el flujo completo `crearControladorAuth()` que alterna automáticamente entre **Iniciar Sesión**, **Registrar (con Términos obligatorios)** y **Cerrar Sesión** mediante `renderCondicional`:

```js
import { crearControladorAuth } from 'mita-dom';

// Crea el controlador reactivo persistido en localStorage
const auth = crearControladorAuth({ nombreEstado: 'app:sesion' });

// Monta en 1 línea el flujo Login <-> Registro <-> Perfil con Logout
const detener = auth.montarFlujoCondicional(document.querySelector('#zona-auth'));
```

O usa `crearFormularioReusable()` para cualquier otro formulario de tu aplicación:

```js
import { crearFormularioReusable } from 'mita-dom';

const formContacto = crearFormularioReusable({
  id: 'form-reserva',
  titulo: '📅 Reservar Mesa',
  submitText: 'Confirmar Reserva',
  fields: [
    { name: 'nombre', label: 'Nombre Completo', type: 'text', required: true, minLength: 3 },
    { name: 'correo', label: 'Email', type: 'email', required: true, pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' },
    { name: 'terminos', label: 'Acepto las políticas de reserva', type: 'checkbox', required: true }
  ],
  onSubmit: (datos) => console.log('Reserva validada:', datos)
});

formContacto.montarEn(document.querySelector('#contenedor-reserva'));
```

---

## 3. 🍪 Términos y Condiciones, Cookies y Analíticas Condicionales (`crearGestorConsentimiento`)

Cumple con buenas prácticas de privacidad: ningún evento de analítica se dispara si el usuario no aceptó los **Términos y Condiciones** y las **Cookies Analíticas**:

```js
import { crearGestorConsentimiento } from 'mita-dom';

const privacidad = crearGestorConsentimiento();

// 1. Si intentas registrar analítica antes del consentimiento, se bloquea automáticamente:
privacidad.registrarAnalitica('click_comprar', { plan: 'Pro' });
// -> { enviado: false, motivo: 'Sin consentimiento de analíticas o términos.' }

// 2. El usuario acepta todo (o configura sus preferencias):
privacidad.aceptarTodo();

// 3. Ahora el evento sí se registra en el estado reactivo:
privacidad.registrarAnalitica('click_comprar', { plan: 'Pro' });
// -> { enviado: true, evento: { ... } }
```
