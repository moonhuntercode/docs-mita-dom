# 🏗️ MitaDOM como Framework Opinionado (Opinionated)

MitaDOM está diseñado con una dualidad arquitectónica. Si deseas construir una aplicación gigante, con múltiples desarrolladores y cero margen para el desorden (código espagueti), debes utilizar MitaDOM en su modo **Framework Opinionado**.

Un framework opinionado toma las decisiones difíciles por ti. Establece reglas estrictas, inquebrantables, pero que garantizan un código escalable, resistente a errores y "Production Ready".

---

## 1. Regla de Oro: La Estructura de Archivos Obligatoria

En el modo opinionado, **no puedes poner los archivos donde tú quieras**. Debes seguir esta estructura exacta:

```text
src/
 ├── core/              # Configuración global (Router instanciado, Stores Globales)
 ├── components/        # Componentes UI reutilizables (Botones, Loaders, Modales)
 │    ├── ui-boton.js
 │    └── ui-loader.js
 ├── features/          # Componentes inteligentes que conectan a APIs (Por dominio)
 │    └── autenticacion/
 │         ├── auth-form.js
 │         └── auth.store.js # Estado local del feature
 ├── pages/             # Vistas de página completa (Enrutador)
 │    ├── page-home.js
 │    └── page-dashboard.js
 └── main.js            # Punto de entrada único. Registra todo el ecosistema.
```

## 2. Paradigma Obligatorio: La Tríada de Archivos

En el framework opinionado **está prohibido escribir HTML o CSS dentro de JavaScript**. 
La mezcla de código (`this.innerHTML = \`<style>...</style> <div>...</div>\``) es considerada mala práctica porque:
1. Rompe la legibilidad y el resaltado de sintaxis del IDE.
2. Dificulta la indexación SEO y la auditoría de accesibilidad.
3. Impide que las herramientas de testing entiendan qué es DOM y qué es lógica pura.

### La regla de la Tríada
Cada componente debe ser una carpeta o agrupar tres archivos estrictos:
- `mi-componente.js` (Lógica POO y Signals)
- `mi-componente.html` (Estructura semántica)
- `mi-componente.css` (Estilos visuales)

```javascript
import { MitaElement, crearEstadoLocal } from 'mita-dom';

// 1. Importaciones Nativas al Ecosistema Vite
// Justificación: El sufijo '?raw' le dice a Vite y a Vitest que carguen el archivo en memoria como un string.
// Esto permite que Vite mantenga el mapa de rutas exacto (SourceMaps) y dispare un "Hot Module Replacement" (HMR) 
// instantáneo si tocas el HTML, además de permitirle a Vitest simular el DOM sin necesidad de configuraciones locas.
import template from './mi-componente.html?raw';

// Vite inyectará este CSS automáticamente y lo empaquetará para producción.
import './mi-componente.css';

export class MiComponente extends MitaElement {
  constructor() {
    super();
    this.estado = crearEstadoLocal(0, { immutable: true });
  }

  alMontar() {
    // 2. Inyección Inicial
    this.innerHTML = template;
    this.iniciarLógica();
  }
  
  // ... resto del ciclo de vida ...
}
customElements.define('mi-componente', MiComponente);
```

---

## 3. Contratos de Memoria Segura (Estilo C++26)

MitaDOM Opinionado exige que trates la memoria de tu aplicación web con el mismo respeto que lo harías en sistemas de bajo nivel como C++. 

En una Single Page Application (SPA), si navegas de `/home` a `/dashboard`, los componentes de `/home` se borran del HTML, pero sus variables (`setInterval`, Listeners globales, suscripciones a Signals) **se quedan viviendo en la memoria RAM (Memory Leaks)**.

### La Regla RAII (Resource Acquisition Is Initialization)
1. **Adquisición**: Cuando creas un `crearEstadoLocal()` en el `constructor()` o `alMontar()`, estás adquiriendo memoria.
2. **Destrucción obligatoria**: En el método `alDesmontar()`, es **obligatorio** llamar a `this.miEstado.destroy()`. 

El método `destroy()` de MitaDOM realiza una limpieza quirúrgica:
- Elimina a todos los suscriptores (`Set.clear()`).
- Borra rastros en IndexedDB o LocalStorage si usaba el `storageAdapter`.
- Rompe referencias circulares para ayudar al *Garbage Collector* de V8 (Chrome) a liberar RAM inmediatamente.

---

## 4. Inmutabilidad Estricta y Seguridad de Datos

En arquitecturas empresariales grandes, el estado global a menudo es corrompido accidentalmente por un componente "rebelde" que hace `estado.usuarios[0] = "hack"`.

En MitaDOM Opinionado, todos tus datos de negocio **deben** inicializarse con la bandera de inmutabilidad y seguridad (CRUD cerrado):

```javascript
import { crearEstadoGlobal } from 'mita-dom';

const datosFinancieros = crearEstadoGlobal({ balance: 1000 }, { 
  immutable: true, // Deep Freeze recursivo. Imposible mutar con '='
  guard: (nuevo, viejo) => {
    // Contrato de Autorización: No se puede bajar el balance de 0
    if (nuevo.balance < 0) return false; 
    return true;
  }
});

// ❌ Fallará (Bloqueado por Inmutabilidad, Object is frozen)
// datosFinancieros.get().balance = 5000; 

// ✅ Correcto (Mutación controlada vía CRUD)
datosFinancieros.update(state => ({ ...state, balance: 5000 }));
```

---

Al usar MitaDOM bajo esta filosofía opinionada, obtienes la seguridad de un framework corporativo pesado, pero con el rendimiento extremo e independiente de Vanilla JavaScript (Web Components Nativos + ES Modules).
