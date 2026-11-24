# 🔀 Renderizado Condicional Declarativo y Control Granular de Vistas (`v2.7.0`)

En `mita-dom v2.7` **nunca ocultamos formularios privados, paneles de administración o flujos de autenticación con `display: none`**. Ocultar con CSS deja los nodos vivos en el árbol DOM (visibles desde el inspector del navegador y consumiendo memoria RAM).

En su lugar, utilizamos **Renderizado Condicional Real en Light DOM**, que monta y destruye físicamente los nodos del DOM cuando cambia la evaluación booleana de un `Signal`.

---

## 1. Sintaxis Estándar: `renderCondicional({ estado, contenedor, cuando, mostrar, sino })`

```javascript
import { crearEstadoCompartido, renderCondicional } from 'mita-dom';

const configModulo = crearEstadoCompartido('empleos:cfg', {
  habilitado: true,
  terminos: 'Oferta laboral real verificada.'
});

const detener = renderCondicional({
  estado: configModulo,
  contenedor: document.querySelector('#zona-publicacion'),
  cuando: (cfg) => cfg.habilitado === true,
  mostrar: (cfg) => `
    <form id="form-empleo">
      <p>📜 Términos: ${cfg.terminos}</p>
      <button type="submit">Publicar Oferta</button>
    </form>
  `,
  sino: () => `
    <article role="status">
      🔴 El formulario fue desmontado del DOM por Administración.
    </article>
  `,
  siempreActualizar: true
});
```

---

## 2. Sintaxis Verbosa Ultra-Clara: `renderizarSiSeCumpleCondicion({ ... })`

Si prefieres nombres 100% auto-explicativos en español para equipos educativos o auditorías de código:

```javascript
import {
  crearEstadoReactivoInmutable,
  renderizarSiSeCumpleCondicion
} from 'mita-dom';

const sesionUsuario = crearEstadoReactivoInmutable('auth:sesion', {
  autenticado: false,
  rol: 'invitado'
});

const detenerRender = renderizarSiSeCumpleCondicion({
  estadoReactivo: sesionUsuario,
  contenedorDom: document.querySelector('#slot-panel-admin'),
  condicionParaMostrar: (sesion) => sesion.autenticado && sesion.rol === 'admin',
  plantillaHtmlSiSeCumple: () => `<aside>🛡️ Dashboard Exclusivo de Administración</aside>`,
  plantillaHtmlSiNoSeCumple: () => `<p>Inicia sesión como Administrador para gestionar este módulo.</p>`
});
```

---

## 3. Auto-Limpieza dentro de un Web Component (`this.mostrarSi`)

Cuando trabajas dentro de una clase que hereda de `MitaElement`, usa `this.mostrarSi({ ... })`. `MitaElement` registra automáticamente la función de limpieza y desuscribe el Signal cuando el componente sale de la pantalla (`disconnectedCallback()`):

```javascript
import { MitaElement, obtenerEstadoCompartido } from 'mita-dom';

export class BannerMantenimiento extends MitaElement {
  render() {
    const estadoSistema = obtenerEstadoCompartido('sistema:estado');
    this.innerHTML = `<section id="slot-banner"></section>`;

    this.mostrarSi({
      estado: estadoSistema,
      contenedor: this.querySelector('#slot-banner'),
      cuando: (s) => s.enMantenimiento === true,
      mostrar: (s) => `<header>⚠️ Mantenimiento activo: ${s.mensaje}</header>`,
      sino: () => ''
    });
  }
}
```

---

## 4. Control Granular para Activar, Desactivar o Cambiar el Modo de Render de una Vista Específica

Con `crearControladorEstrategiaPorVista()` puedes gobernar tanto el modo (`hybrid`, `ssr`, `ssg`, `csr`) como la disponibilidad (`habilitada: true / false`) de cada ruta de tu aplicación:

```javascript
import { crearControladorEstrategiaPorVista } from 'mita-dom';

const routerVistas = crearControladorEstrategiaPorVista();

// Desactivar únicamente la vista '/empleos' sin afectar '/inicio' ni '/docs':
routerVistas.activarODesactivarVista('/empleos', false);

// Al renderizar, si está desactivada, devuelve automáticamente el aviso seguro:
const salida = await routerVistas.renderizarVistaConConfiguracion('/empleos', VistaEmpleos);
console.log(salida.modoAplicado); // 'disabled'
```
