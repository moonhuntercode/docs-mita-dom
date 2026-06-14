# 🧩 Guía Maestra de Componentes Web (MitaDOM)

MitaDOM es una librería de alto rendimiento construida sobre los estándares nativos de la W3C. No usamos JSX ni compiladores mágicos. Combinamos los **4 Pilares de los Web Components** (estables en el 100% de los navegadores modernos) con la reactividad granular de los **Signals**.

---

## 🏛️ 1. Los 4 Pilares en MitaDOM

Según la especificación oficial, MitaDOM orquesta estas cuatro tecnologías:

1. **ES Modules (`import`/`export`)**: Cada componente vive en su propio archivo, encapsulando su lógica de negocio sin contaminar el entorno global (Window).
2. **Custom Elements (`customElements.define`)**: Extendemos la clase base `HTMLElement` (a través de nuestro `MitaElement`) para crear nuevas etiquetas HTML con superpoderes, como `<mita-perfil>`.
3. **HTML Templates**: En lugar de ensuciar el JS con cadenas de texto gigantes, usamos archivos `.html` separados que importamos dinámicamente vía Vite (`import html from './comp.html?raw'`).
4. **Shadow DOM vs Light DOM**: Por defecto, MitaDOM inyecta en el **Light DOM** para garantizar que los formularios sean accesibles y el SEO sea perfecto, encapsulando los estilos con CSS `@scope`. Sin embargo, si necesitas aislamiento absoluto, MitaDOM soporta **Shadow DOM**.

---

## 🏗️ 2. Conditional Rendering (Renderizado Condicional)

Al carecer de *Virtual DOM*, MitaDOM no destruye y recrea todo el árbol de HTML mágicamente ante un cambio de estado, ya que eso consume mucha batería (como hace React). 
Aquí realizamos **Renderizado Condicional Quirúrgico**. Si tienes que mostrar u ocultar elementos, debes mutar sus clases CSS o nodos de texto de forma precisa usando un *Signal Local*:

```javascript
import { crearEstadoLocal, MitaElement } from 'mita-dom';

export class MiBoton extends MitaElement {
  constructor() {
    super();
    // 2. Reactividad Granular: Creamos el estado
    this.estadoOculto = crearEstadoLocal(false);
    const $btn = this.querySelector('#btn-magico');

    // 2. Escuchar evento y mutar estado
    $btn.addEventListener('click', () => {
      this.estadoOculto.set(!this.estadoOculto.get());
    });

    // 3. Conditional Render
    this.estadoOculto.suscribir((oculto) => {
      if (oculto) {
        $btn.textContent = '👁️ Mostrar'; // Mutación de texto
        $btn.classList.add('clase-escondida'); // Mutación de UI
      } else {
        $btn.textContent = '🙈 Ocultar';
        $btn.classList.remove('clase-escondida');
      }
    });
  }
}
```

> [!TIP]
> **Mobile First DX:** El enfoque quirúrgico mantiene en caché los *Event Listeners* de los nodos del DOM. Al no destruir la etiqueta HTML (como lo haría un `v-if` o `{#if}`), el navegador móvil gasta **0ms** en reconectar eventos táctiles, garantizando una fluidez asombrosa.

---

## 🏗️ 3. El Molde Básico (Boilerplate)

Todo componente en MitaDOM debe extender de `MitaElement`. Esta clase nos da control de errores (*Error Boundaries*) y telemetría automática.

```javascript
// mi-componente.js
import { MitaElement } from 'mita-dom';
import html from './mi-componente.html?raw'; // 1. HTML Template
import './mi-componente.css';                // 2. CSS Encapsulado

export class MiComponente extends MitaElement { // 3. Custom Element
  constructor() {
    super(); 
  }

  /**
   * 🧬 CICLO DE VIDA: render()
   * Reemplaza a connectedCallback. Se ejecuta de forma segura cuando el componente entra al DOM.
   */
  async render() {
    this.innerHTML = html; // Inyección en Light DOM
    this.iniciarLogica();
  }

  iniciarLogica() {
    const btn = this.querySelector('#btn-accion');
    btn.addEventListener('click', () => alert('¡Componente Vivo!'));
  }
}

// 4. Registro Global
if (!customElements.get('mi-componente')) {
  customElements.define('mi-componente', MiComponente);
}
```

---

## 🔀 4. Comunicación: Props Nativas vs Signals Globales

El error de muchos desarrolladores de React es querer meter *todo* en un estado global. MitaDOM divide la comunicación en dos enfoques eficientes:

### A) Comunicación Local (El equivalente a "Props" de React)
Si un Padre necesita pasarle un ID o un color a un componente Hijo directo, **NO** uses un estado global. Usa los Atributos HTML nativos. Esto hace que tu componente sea altamente reutilizable.

```javascript
class MitaTarjeta extends MitaElement {
  // 1. Declaramos qué "props" (atributos) queremos observar
  static get observedAttributes() {
    return ['color-tema', 'id-producto'];
  }

  // 2. Este método se dispara SOLO cuando estas props cambian
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'color-tema') {
      this.style.backgroundColor = newValue;
      console.log(`El padre cambió el color de ${oldValue} a ${newValue}`);
    }
  }
}
```
**Uso en HTML:**
`<mita-tarjeta color-tema="#ff0000" id-producto="123"></mita-tarjeta>`

### B) Comunicación Global (Cero Prop Drilling)
Si un Formulario en una pantalla necesita actualizar el nombre de usuario que se muestra en el Header (a 5 niveles de distancia), usar "Props" sería una pesadilla (*Prop Drilling*). Aquí usamos **Signals**.

```javascript
// En el Formulario (Muta el estado)
estadoAppGlobal.patch({ usuario: 'Jane Doe' });

// En el Header (Se suscribe y reacciona al instante)
this._suscripcion = (estado) => {
    if (estado.usuario) this.$nombreUI.textContent = estado.usuario;
};
estadoAppGlobal.suscribir(this._suscripcion);
```

---

## 🧩 4. Layouts y Composición con `<slot>`

Los `<slot>` son agujeros en tu componente donde el usuario puede insertar su propio HTML. Son perfectos para crear Layouts reutilizables (como Tarjetas, Modales o Grillas).

**Componente Modal (`mita-modal.html`):**
```html
<dialog class="modal-base">
  <header>
    <!-- Slot Nombrado: Solo aceptará HTML que tenga slot="cabecera" -->
    <slot name="cabecera">Título por Defecto</slot>
  </header>
  
  <main>
    <!-- Slot por Defecto: Recibe todo lo que no tenga nombre -->
    <slot></slot>
  </main>
</dialog>
```

**Uso del Layout en tu App (`index.html`):**
```html
<mita-modal>
  <h2 slot="cabecera">Confirmar Compra</h2>
  
  <!-- Esto irá al slot por defecto -->
  <p>¿Estás seguro de que deseas comprar este artículo?</p>
  <button>Comprar</button>
</mita-modal>
```

---

## 🛡️ 5. Prevención de Fugas de Memoria (Memory Leaks)

Si tu componente se suscribe a un Signal Global o a un evento del `window` (como el scroll), **DEBES** limpiar esa suscripción cuando el componente desaparezca de la pantalla (por ejemplo, al cambiar de ruta). Si no lo haces, la memoria del móvil del usuario se llenará rápidamente.

```javascript
  // Se ejecuta automáticamente cuando MitaDOM destruye el componente
  disconnectedCallback() {
    // 1. Limpiar Signals
    if (this._suscripcion) estadoAppGlobal.desuscribir(this._suscripcion);
    
    // 2. Limpiar Listeners Globales
    window.removeEventListener('scroll', this.miFuncionScroll);
  }
```

---

## 🧪 6. Testing en MitaDOM (Asegurando la Calidad)

Al usar estándares nativos, probar componentes en MitaDOM es infinitamente más fácil que probar componentes de frameworks virtuales.

### Testing Manual y Depuración (DX)
MitaDOM tiene un interceptor global (`MitaElement`). Si tu componente falla, la aplicación **no se pone en blanco**. El error es capturado, mostrado en un bloque rojo en la UI, y enviado a tu **Panel de Auditoría Local (IndexedDB)**. 
- **Flujo de DX:** Abre la ruta `/admin/logs`, filtra por "Errores" y verás exactamente en qué componente y línea ocurrió el fallo.

### Testing Automático (Node.js Test Runner)
No necesitas Jest ni Vitest. Como MitaDOM hereda de clases nativas, puedes instanciarlas directamente en NodeJS (usando JSDOM para simular el navegador).

**Ejemplo de Test Real (`test/mi-componente.test.js`):**
```javascript
import { test } from 'node:test';
import assert from 'node:assert';
import { MiComponente } from '../src/componentes/mi-componente.js';

test('MiComponente debe reaccionar al cambio de Prop (Atributo)', () => {
    // 1. Arrange: Creamos la instancia
    const comp = new MiComponente();
    
    // 2. Act: Cambiamos el atributo como lo haría el navegador
    comp.attributeChangedCallback('color-tema', null, 'blue');
    
    // 3. Assert: Verificamos que el DOM interno mutó correctamente
    assert.strictEqual(comp.style.backgroundColor, 'blue');
});

test('MiComponente debe limpiar la memoria al desconectarse', () => {
    const comp = new MiComponente();
    comp.disconnectedCallback();
    // Afirmamos que la variable de suscripción se anuló
    assert.strictEqual(comp._suscripcionViva, false);
});
```

> [!TIP]
> **Mobile First y Responsive:** Recuerda que al usar CSS `@scope`, tus media queries (`@media (max-width: 768px)`) escritas dentro del CSS de tu componente seguirán funcionando perfectamente, aislando la vista móvil de este componente del resto de la página.
