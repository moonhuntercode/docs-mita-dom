# MitaDOM v2.8.0 🚀

MitaDOM es una librería hiper-ligera, sin dependencias de runtime, para crear **Web Components Nativos** usando JavaScript puro (Vanilla JS) con reactividad granular por Signals, ciclo de vida completo en español (`MitaElement`), Async Graph estilo Solid 2.0 (`crearMemoAsincrono`, `crearFuncionServidorEnVivo`), `linkedSignal`, `sinRastrear`, protección de memoria estilo Rust (`rustGuard`), estrategias universales en 1 línea (`CSR`/`SSR`/`SSG`/`Hybrid`/`Resumable`), `@defer`, `Signal Forms`, Subpath Exports, Agent Repair Guide (`skills/`) y CLI (`npx mita`).

- 📚 **Documentación Oficial y 16 Laboratorios Interactivos:** [docs-mita-dom.vercel.app](https://docs-mita-dom.vercel.app/)
- 🛠️ **Guía de Contribución, SemVer y Release:** [CONTRIBUTING.md](./CONTRIBUTING.md)
- 📝 **Changelog v2.8.0 (Antes vs Después):** [changelogs/2026-11-23-v2.8.0.md](./changelogs/2026-11-23-v2.8.0.md)

```bash
npm install mita-dom
npx mita doctor
```

## 🌟 Filosofía y Arquitectura (La Tríada)
En MitaDOM **prohibimos el uso de Shadow DOM**. Esto asegura que tus componentes sigan siendo accesibles, indexables por SEO, y fáciles de estilar globalmente. 
En su lugar, promovemos el uso de **CSS `@scope`** (CSS3 Moderno) junto con **Light DOM**.

### Ventajas:
1. **Rendimiento Extremo**: Cero Virtual DOM.
2. **Error Boundaries Nativos**: Al estilo Rust/Go (`mitaResult`), los errores de renderizado no rompen la página, muestran un hermoso fallback con detalles técnicos.
3. **Props Automáticas**: Lee atributos de HTML (como `show-quick-options`) directamente en JS como `this.props.showQuickOptions`.
4. **Emisor de Eventos**: Usa `this.emit('mi-evento', data)` en lugar del largo `new CustomEvent()`.

---

## 📦 Guía de Buenas Prácticas y Reusabilidad

### 1. La Tríada Modular (HTML, CSS, JS) y el Ciclo de Vida Completo

Para que un componente sea **claro y 100% re-usable**, separa HTML (`?raw`), CSS (`@scope`) y JS, respetando el orden oficial de `MitaElement` (`alCrear` → `render` → `alMontar` → `alCambiarProp` → `alDesmontar`):

```js
// mi-componente.js
import { MitaElement, crearEstadoLocal } from 'mita-dom';
import templateHtml from './mi-componente.html?raw';
import './mi-componente.css';

export class MiComponente extends MitaElement {
  static get observedAttributes() {
    return ['color', 'titulo'];
  }

  // 1. Antes del DOM: inicializa Signals locales
  alCrear() {
    this.contador = crearEstadoLocal(0);
  }

  // 2. Pinta el HTML base una sola vez (protegido por Error Boundary)
  render() {
    this.innerHTML = templateHtml;
  }

  // 3. DOM ya listo: conecta Signals granulares y eventos (auto-limpiados al desmontar)
  alMontar() {
    if (this.props.color) {
      this.querySelector('.titulo').style.color = this.props.color;
    }

    // Mutación granular de solo el TextNode (sin re-escribir innerHTML)
    this.vincularTexto(this.contador, '.valor', (n) => `Clics: ${n}`);

    const onClick = () => this.contador.set(this.contador.get() + 1);
    const btn = this.querySelector('.btn-sumar');
    btn?.addEventListener('click', onClick);
    this.registrarLimpieza(() => btn?.removeEventListener('click', onClick));
  }

  // 4. Reacción granular si cambia un atributo observado (camelCase automático)
  alCambiarProp(prop, _antes, valorNuevo) {
    if (prop === 'color' && this.querySelector('.titulo')) {
      this.querySelector('.titulo').style.color = valorNuevo;
    }
  }

  // 5. Opcional: limpieza adicional (las suscripciones registradas ya se limpiaron solas)
  alDesmontar() {
    this.contador.destroy();
  }
}
customElements.define('mi-componente', MiComponente);
```

### 2. Ciclo de Vida Estandarizado (Orden Garantizado)
MitaDOM ejecuta los hooks en este orden exacto (sin necesidad de volver a llamar `this.render()` dentro de `alMontar()`):
* `alCrear()`: se ejecuta en el `constructor` (ideal para crear Signals locales).
* `alAntesDeRenderizar()`: opcional, justo antes del primer `render()`.
* `render()`: pinta el Light DOM una vez, protegido automáticamente por Error Boundary (`fallbackUI(error)` + `alError(error, fase)`).
* `alMontar()`: se ejecuta después de `render()`, cuando el DOM ya existe (`this.querySelector` garantizado).
* `alCambiarProp(propCamel, antes, ahora)` / `alCambiarAtributo(attr, antes, ahora)`: reacciona a cambios de `observedAttributes`.
* `alActualizar(motivo)`: se dispara al invocar `this.solicitarActualizacion(motivo)`.
* `alDesmontar()`: se ejecuta al salir del DOM **después** de liberar automáticamente todas las suscripciones de `this.vincularTexto()`, `this.escucharEstado()`, `this.mostrarSi()` y `this.registrarLimpieza()`.

### 3. Evitando el Anti-Patrón (DX Linter)
Si intentas hacer `this.innerHTML` muchas veces por segundo (ej: en una animación o dentro del `suscribir` de un estado), MitaDOM detectará el abuso y lanzará un **Warning**.
**Solución Granular:**
```js
// ❌ Malo (MitaDOM avisará)
this.estado.suscribir(() => {
  this.innerHTML = `<p>${this.estado.get()}</p>`;
});

// ✅ Bueno (Rendimiento Nativo)
const parrafo = this.querySelector('p');
this.estado.suscribir((val) => {
  parrafo.textContent = val;
});
```

---

## 🧪 Estrategias de Testing (Vitest)
Para testear Web Components en Node, usamos `jsdom`.

1. **Configurar Vitest (`vitest.config.js`)**:
   Evita usar threads antiguos. Mantenlo simple:
   ```js
   export default defineConfig({
     test: {
       environment: 'jsdom',
       pool: 'vmThreads' // Reutiliza jsdom por worker manteniendo aislamiento por archivo (Vitest 5)
     }
   });
   ```

2. **Escribir el Test**:
   ```js
   import { test, expect } from 'vitest';
   import './mi-componente.js'; // Importa el archivo que registra el customElement

   test('Mi Componente renderiza correctamente', () => {
     // 1. Montar en el JSDOM
     const el = document.createElement('mi-componente');
     document.body.appendChild(el);
     
     // 2. Afirmar (Assert)
     expect(el.querySelector('.titulo')).not.toBeNull();
   });
   ```

---

## 💡 Ejemplos Prácticos
Revisa la carpeta `optica-01/src/components`, `food-show-1` y el portal [docs-mita-dom.vercel.app](https://docs-mita-dom.vercel.app/) para ver ejemplos en producción del uso de `MitaElement`, Signals v2.7, `rustGuard`, `@defer`, `Signal Forms` y eventos reactivos.

---

## 🤝 ¿Quieres Colaborar en Nuevas Versiones (`v2.8.0` / `v3.0.0`)?

¡**MitaDOM** es open-source y la comunidad está invitada a construir las siguientes versiones! Puedes aportar código, tests Playwright, ejemplos interactivos, adaptadores Express/Docker o mejoras de documentación:

```bash
gh repo fork moonhuntercode/mita-dom --clone=true
cd mita-dom && npm install
git checkout -b feat/mi-aporte
npm run release:check
gh pr create --base main --title "feat: mi aporte a MitaDOM"
```

Revisa [CONTRIBUTING.md](./CONTRIBUTING.md) y la [Guía Completa de Git Flow, PRs, GitHub CLI y Roadmap](./docs/referencia/GUIA_GIT_FLOW_PR_GH_CLI_Y_RELEASE_ECOSISTEMA_2026-11-23.md) para ver qué falta construir y elegir tu primer issue (`good first issue` / `help wanted`).
