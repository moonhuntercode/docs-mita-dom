# 🤖 Referencia de API Auto-Generada — MitaDOM v2.8.0

- **Versión:** `v2.8.0`
- **Fecha de Auto-Generación:** `2026-11-24`
- **Comando:** `npm run docs:auto` (`scripts/auto-docs.js`)
- **Guía Profunda + Equivalencias `react.dev/reference/react` + Glosario:** `docs/referencia/REFERENCIA_COMPLETA_REACT_A_MITADOM_GLOSARIO_Y_PROFUNDIZACION_2026-11-23.md`

> Este documento se regenera automáticamente leyendo los `export` y JSDoc reales de `src/` y está agrupado por categorías inspiradas en `react.dev/reference/react`.

## 🧭 Mapa Rápido (React → MitaDOM)

| Concepto (`react.dev/reference/react`) | Equivalente en MitaDOM |
| --- | --- |
| `useState(inicial)` | `crearEstadoLocal(inicial)` |
| `useMemo(() => ..., [deps])` | `signal.derivar(fn)` o `crearMemoAsincrono(async () => ...)` |
| `useEffect(() => ..., [deps])` | `crearEfecto(() => ...)` (auto-rastreo + `sinRastrear()`) |
| `useContext(Ctx)` | `crearEstadoCompartido(nombre, val)` + `obtenerEstadoCompartido(nombre)` |
| `useOptimistic` / `useActionState` | `crearEstadoOptimistaConRollback()` + `crearFuncionServidor()` |
| `<Suspense>` / `lazy()` | `renderizarVistaDiferida()` (`@defer`) + `crearMemoAsincrono()` |
| `ErrorBoundary` | `MitaElement` nativo (`fallbackUI(err)` + `alError(err, fase)`) |

## 🗺️ Inventario de Módulos y Exports

| Grupo | Archivo Fuente | Símbolos Públicos Exportados |
| --- | --- | --- |
| 1. | `src/core/signals.js` | `Signal`, `SignalDerivado`, `crearEstadoGlobal`, `crearEstadoLocal`, `crearEfecto`, `sinRastrear`, `crearEstadoCompartido`, `obtenerEstadoCompartido`, `listarEstadosCompartidos`, `eliminarEstadoCompartido` |
| 1. | `src/core/render.js` | `renderCondicional`, `vincularTexto` |
| 1. | `src/core/resource.js` | `crearRecurso` |
| 2. | `src/core/mitaElement.js` | `MitaElement` |
| 2. | `src/core/componentes.js` | `definirComponente` |
| 2. | `src/core/propsYDefer.js` | `obtenerUrlImagenCientifico`, `CIENTIFICOS_DEMO`, `pasarPropsAElemento`, `leerPropsDeElemento`, `renderizarVistaDiferida`, `crearFormularioReactivoConSignals` |
| 3. | `src/core/asyncGraph.js` | `CATALOGO_DIAGNOSTICOS_AGENTE`, `emitirDiagnosticoAgente`, `obtenerDiagnosticosAgente`, `limpiarDiagnosticosAgente`, `crearMemoAsincrono`, `crearEstadoVinculado`, `crearEstadoOptimistaConRollback`, `crearFuncionServidor`, `crearFuncionServidorEnVivo`, `ESTRATEGIAS_RENDER_MITA`, `definirEstrategiaRenderRuta`, `cambiarEstrategiaRender`, `obtenerMapaEstrategiasRender` |
| 3. | `src/core/ssr.js` | `MitaMeta`, `renderizarVistaUniversal` |
| 3. | `src/core/router.js` | `navegarA` |
| 3. | `src/core/mitaRouter.js` | `MitaRouter` |
| 4. | `src/core/rustGuard.js` | `congelarProfundamenteInmutable`, `crearEstadoReactivoInmutable`, `leerEstadoInmutable`, `mutarEstadoConHistorial`, `obtenerHistorialDeMutaciones`, `renderizarSiSeCumpleCondicion`, `medirPresupuestoDeRenderizado`, `crearAmbitoConLimpiezaAutomatica`, `ejecutarSuiteVerificacionMita` |
| 4. | `src/seguridad.js` | `sanitizarTexto` |
| 4. | `src/utils/result.js` | `mitaResult` |
| 4. | `src/core/mitaAnim.js` | `MitaAnim` |
| 4. | `src/core/mitaTween.js` | `Easings`, `MitaTween` |
| 5. | `src/utils/chatGuard.js` | `crearControlSpam`, `filtrarColeccion` |
| 5. | `src/utils/formBuilder.js` | `crearFormularioReusable`, `crearControladorAuth` |
| 5. | `src/utils/consentimiento.js` | `crearGestorConsentimiento` |
| 5. | `src/utils/cliSimulator.js` | `simularComandoCliMita`, `$`, `estado$`, `leer$`, `actualizar$`, `auditarHistorial$` |
| 5. | `src/utils/crudCategorias.js` | `crearControladorCrudCategorias`, `crearControladorEstrategiaPorVista`, `crearGestorGamificacionLectura` |
| 5. | `src/utils/uiModeracionYComunidad.js` | `obtenerHuellaDispositivoLocal`, `crearControladorPaginacion`, `crearFetcherConCacheYEstados`, `crearGestorPerfilesYDispositivo`, `crearControladorSalaChatYGrupos`, `crearSistemaModeracionAnuncios` |
| 5. | `src/utils/fullstackYDevtools.js` | `crearControladorFetchingPorModo`, `crearAccionServidorIsomorfica`, `ejecutarConsejeroMitaDoc`, `calcularRecomendacionSemVer`, `PALETAS_COLORES_MITA`, `crearGestorTemaYAnimacionNavegacion`, `crearGestorBitacoraPorHora` |

---

## ⚡ 1. Hooks / Signals y Reactividad Granular

> Equivalente a `useState`, `useMemo`, `useEffect`, `useContext` y `untrack` sin Virtual DOM.

### 📦 Módulo `src/core/signals.js`

#### `class Signal`

📡 Pila interna para auto-rastreo de dependencias en `crearEfecto(fn)`. Permite que cualquier `signal.get()` ejecutado dentro de un efecto se suscriba automáticamente sin necesidad de listar dependencias a mano. / const pilaDeEfectos = []; /** 🗂️ Registro central de Estados Compartidos por nombre. Permite compartir datos entre componentes desacoplados (hermanos, modales, encabezados, paneles de administración) sin imports circulares. / const registroEstadosCompartidos = new Map(); /** 🛠️ Utilidad para congelación profunda (Immutabilidad recursiva) / function deepFreeze(object) { if (object === null || typeof object !== 'object') return object; const propNames = Object.getOwnPropertyNames(object); for (const name of propNames) { const value = object[name]; if (value && typeof value === 'object') { deepFreeze(value); } } return Object.freeze(object); } /** Motor Reactivo Granular Avanzado (Signals con CRUD, Auth y Telemetría)

#### `class SignalDerivado`

/ constructor(valorInicial, options = {}) { this.options = { immutable: false, persistKey: null, storageAdapter: null, // Por defecto usará localStorage si hay persistKey guard: null, onMutate: null, ...options }; this.#valorInicialOriginal = valorInicial; this.suscriptores = new Set(); // 1. Persistencia (Usando Adapter) if (this.options.persistKey) { const storage = this.options.storageAdapter || (typeof localStorage !== 'undefined' ? localStorage : null); if (storage) { try { const stored = storage.getItem(this.options.persistKey); if (stored) { // Soporta Promesas para Storage Asíncrono (IndexedDB, Firebase) if (stored instanceof Promise) { stored.then(val => { if (val) this.set(JSON.parse(val)); }); } else { valorInicial = JSON.parse(stored); } } } catch (e) { console.warn(`Error leyendo persistencia [${this.options.persistKey}]:`, e); } } } // 2. Inmutabilidad Inicial this.#valor = this._procesarInmutabilidad(valorInicial); } /** Utilidad privada para garantizar inmutabilidad / _procesarInmutabilidad(val) { if (!this.options.immutable) return val; // Creamos una copia profunda y la congelamos const copy = structuredClone ? structuredClone(val) : JSON.parse(JSON.stringify(val)); return deepFreeze(copy); } /** / get value() { return this.get(); } /** / set value(nuevoValor) { this.set(nuevoValor); } // ========================================== // 🗄️ C.R.U.D. CORE API // ========================================== /** READ: Obtiene el valor actual. Si es inmutable, es seguro de leer. Si se invoca dentro de `crearEfecto(fn)`, registra automáticamente la dependencia. / get() { const efectoActivo = pilaDeEfectos[pilaDeEfectos.length - 1]; if (efectoActivo) { this.suscriptores.add(efectoActivo.ejecutar); efectoActivo.dependencias.add(this); } return this.#valor; } /** UPDATE (Directo): Sobrescribe el estado con un nuevo valor. / set(nuevoValor) { // 1. Autorización y Control de Acceso (Guard) if (this.options.guard && !this.options.guard(nuevoValor, this.#valor)) { console.warn(`[Signal Auth] Mutación rechazada por Guard. Acción no autorizada.`); return false; } if (this.#valor !== nuevoValor) { const oldValue = this.#valor; this.#valor = this._procesarInmutabilidad(nuevoValor); // 2. Persistencia automática vía Adapter if (this.options.persistKey) { const storage = this.options.storageAdapter || (typeof localStorage !== 'undefined' ? localStorage : null); if (storage) { try { storage.setItem(this.options.persistKey, JSON.stringify(this.#valor)); } catch (e) {} } } // 3. Telemetría / Debug if (this.options.onMutate) { this.options.onMutate(this.#valor, oldValue); } // 4. Reactividad this.notificar(); } return true; } /** UPDATE (Funcional): Ideal para contadores o arrays basado en estado anterior. / update(updaterFn) { // Le pasamos un clon si es inmutable, o la ref si es mutable const prev = this.options.immutable ? (structuredClone ? structuredClone(this.#valor) : JSON.parse(JSON.stringify(this.#valor))) : this.#valor; const nextValue = updaterFn(prev); return this.set(nextValue); } /** UPDATE (Parcial): Aplica un parche a un objeto (Merge). Mejora la DX (Developer Experience). / patch(partialValue) { if (this.#valor === null || typeof this.#valor !== 'object' || Array.isArray(this.#valor)) { console.warn('[Signal] .patch() solo puede usarse en estados que sean Objetos Puros.'); return false; } return this.update(estado => ({ ...estado, ...partialValue })); } /** DELETE / RESET: Devuelve el estado a su valor de nacimiento. / reset() { this.set(this.#valorInicialOriginal); } /** DESTROY: Elimina todos los oyentes de memoria para evitar memory leaks graves. / destroy() { this.suscriptores.clear(); if (this.options.persistKey) { const storage = this.options.storageAdapter || (typeof localStorage !== 'undefined' ? localStorage : null); if (storage) storage.removeItem(this.options.persistKey); } } // ========================================== // 🔌 REACTIVIDAD Y EVENTOS // ========================================== /** Suscribe una función para reaccionar a los cambios. Retorna una función de limpieza (`desuscribir`) para liberar memoria fácilmente. / suscribir(callback) { this.suscriptores.add(callback); // Ejecución inmediata inicial para sincronizar el DOM con el estado callback(this.#valor); return () => this.desuscribir(callback); } /** Crea un SignalDerivado (solo lectura) a partir de este Signal. / derivar(computeFn) { return new SignalDerivado(this, computeFn); } /** Elimina una suscripción. / desuscribir(callback) { this.suscriptores.delete(callback); } /** Notifica a todos los suscriptores sobre una copia estática del Set. Evita bucles infinitos cuando un efecto re-suscribe dependencias durante el recorrido. / notificar() { const suscriptoresActivos = Array.from(this.suscriptores); suscriptoresActivos.forEach(callback => { try { callback(this.#valor); } catch (err) { console.error('🔥 [MitaDOM Signal] Error fatal en un suscriptor. Aislamiento activado para proteger el resto de la aplicación.', err); } }); } } // Bloqueamos el prototipo para prevenir Prototype Pollution (Seguridad en Memoria) Object.freeze(Signal.prototype); /** 🧠 SignalDerivado (Estado Derivado o Calculado) Inspirado en Vue.js (computed) y SolidJS (createMemo). Actúa como un caché matemático: solo recalcula su valor cuando el Signal Padre cambia. Ahorra CPU evitando cálculos pesados en cada renderizado.
- `@param {T} valorInicial`
- `@param {Object} options Opciones avanzadas de la arquitectura`
- `@param {boolean} [options.immutable=false] Fuerza inmutabilidad con Object.freeze`
- `@param {string} [options.persistKey=null] Key para persistir`
- `@param {{ getItem: (key: string) => any, setItem: (key: string, val: string) => any, removeItem: (key: string) => any }} [options.storageAdapter=localStorage] Adaptador DB`
- `@param {Function} [options.guard] (newValue: T, oldValue: T) => boolean. Control de Acceso/Autorización`
- `@param {Function} [options.onMutate] (newValue: T, oldValue: T) => void Hook para Telemetría y Debug`
- `@returns {T} El valor reactivo actual`
- `@param {T} nuevoValor El nuevo valor a establecer`
- `@returns {boolean} true si mutó, false si fue bloqueado por Auth (guard)`
- `@param {(estadoAnterior: T) => T} updaterFn Función pura para mutar`
- `@returns {boolean} true si mutó exitosamente`
- `@param {Partial<any>} partialValue Objeto con propiedades a sobrescribir`
- `@returns {boolean} true si mutó`
- `@param {(val: T) => void} callback Función ejecutada en cada cambio`
- `@returns {() => void} Función para cancelar esta suscripción`
- `@param {(val: T) => R} computeFn Función pura que transforma el valor`
- `@returns {SignalDerivado} Nuevo signal derivado`
- `@param {(val: T) => void} callback Función previamente suscrita`

#### `function crearEstadoGlobal(valorInicial, options = {})`

/ constructor(parentSignal, computeFn) { if (!(parentSignal instanceof Signal)) { throw new Error('[SignalDerivado] El primer argumento debe ser una instancia de Signal.'); } if (typeof computeFn !== 'function') { throw new Error('[SignalDerivado] El segundo argumento debe ser una función pura.'); } // Inicializamos con el valor calculado actual super(computeFn(parentSignal.get())); this.parentSignal = parentSignal; this.computeFn = computeFn; // Cada vez que el padre cambia, recalculamos y notificamos a nuestros suscriptores this._padreSuscripcion = (nuevoValorPadre) => { const nuevoCalculo = this.computeFn(nuevoValorPadre); // Usamos super.set() para bypassear nuestro propio bloqueo de solo-lectura super.set(nuevoCalculo); }; this.parentSignal.suscribir(this._padreSuscripcion); } /** Bloqueamos la mutación manual. Un Signal Derivado es de "Solo Lectura" (Read-Only). / set() { throw new Error('[SignalDerivado] Es de solo lectura. Su valor se deriva automáticamente del padre.'); } /** / update() { throw new Error('[SignalDerivado] Es de solo lectura. Su valor se deriva automáticamente del padre.'); } /** / patch() { throw new Error('[SignalDerivado] Es de solo lectura. Su valor se deriva automáticamente del padre.'); } destroy() { this.parentSignal.desuscribir(this._padreSuscripcion); super.destroy(); } } // ========================================== // 🚀 DX API (Developer Experience) // ========================================== /** Determina si los logs informativos de mutación deben imprimirse en consola. Silencioso por defecto en entornos de testing (Vitest / node --test), CI y producción para evitar desbordar el buffer de terminal; se puede activar con `{ debug: true }` o `globalThis.__MITA_DEBUG__ = true`. / function debeImprimirLogSignal(options = {}) { if (options.debug === true || /** @type {any} */ (globalThis).__MITA_DEBUG__ === true) { return true; } if (options.debug === false) return false; if (typeof process !== 'undefined' && process.env) { if ( process.env.VITEST || process.env.NODE_TEST_CONTEXT || process.env.CI || process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'production' ) { return false; } } return true; } /** Crea un estado global. Ideal para compartir datos entre múltiples componentes (ej. Sesión, Tema, Configuración). Provee feedback visual en consola en desarrollo (silencioso en test/producción salvo `{ debug: true }`).
- `@param {Signal<P>} parentSignal El signal base que se va a escuchar`
- `@param {(val: P) => R} computeFn Función pura que transforma el valor`
- `@param {Object} [options]`
- `@returns {boolean}`
- `@param {T} valorInicial El valor inicial del estado (puede ser de cualquier tipo)`
- `@param {Object} [options={}] Opciones de Signal (ej. persistKey, onMutate, debug)`
- `@returns {Signal<T>} Instancia de Signal estricta`

#### `function crearEstadoLocal(valorInicial, options = {})`

Crea un estado local. Ideal para uso efímero dentro de un solo componente web (ej. contadores, formularios). Provee feedback visual en consola en desarrollo (silencioso en test/producción salvo `{ debug: true }`).
- `@param {T} valorInicial El valor inicial del estado local`
- `@param {Object} [options={}] Opciones de Signal`
- `@returns {Signal<T>} Instancia de Signal local estricta`

#### `function crearEfecto(fn)`

⚡ Crea un efecto reactivo con auto-rastreo de dependencias. Cualquier Signal leído con `.get()` dentro de `fn` re-ejecutará automáticamente este efecto cuando su valor cambie.
- `@param {() => void} fn Función reactiva a ejecutar`
- `@returns {() => void} Función `detener()` para limpiar todas las suscripciones (0 memory leaks)`

#### `function sinRastrear(fn)`

const nodoEfecto = { dependencias: new Set(), ejecutar: () => { if (!activo) return; // Limpiamos dependencias previas para re-calcular en ramas condicionales nodoEfecto.dependencias.forEach(dep => dep.desuscribir(nodoEfecto.ejecutar)); nodoEfecto.dependencias.clear(); pilaDeEfectos.push(nodoEfecto); try { fn(); } catch (err) { console.error('🔥 [MitaDOM Efecto] Error ejecutando efecto reactivo:', err); } finally { pilaDeEfectos.pop(); } } }; nodoEfecto.ejecutar(); return function detenerEfecto() { activo = false; nodoEfecto.dependencias.forEach(dep => dep.desuscribir(nodoEfecto.ejecutar)); nodoEfecto.dependencias.clear(); }; } /** 🙈 Ejecuta una función leyendo o mutando Signals SIN registrarlos como dependencias del `crearEfecto()` activo (equivalente a `untrack()` en SolidJS). Evita bucles infinitos al escribir en un Signal interno dentro de un efecto.
- `@param {() => T} fn Función a ejecutar fuera del rastreo reactivo`
- `@returns {T} Resultado de `fn``

#### `function crearEstadoCompartido(nombreUnico, valorInicial, opciones = {})`

🤝 Crea o recupera un Estado Compartido con nombre explícito. Pensado para máxima claridad y legibilidad al compartir datos entre múltiples componentes (ej: Configuración de Empleos, Sesión Admin, Carrito).
- `@param {string} nombreUnico Identificador único y legible del estado (ej. 'empleos:config')`
- `@param {T} valorInicial Valor inicial si aún no existe en el registro`
- `@param {Object} [opciones={}] Opciones claras de comportamiento`
- `@param {boolean} [opciones.persistirLocal=false] Si es true, guarda automáticamente en localStorage`
- `@param {string} [opciones.persistKey] Clave personalizada en localStorage (sobreescribe persistirLocal)`
- `@param {string} [opciones.descripcion=''] Descripción legible para auditoría y panel Admin`
- `@param {string} [opciones.reglas=''] Reglas de negocio documentadas sobre quién puede mutar este estado`
- `@param {boolean} [opciones.immutable=false] Congela el estado con deepFreeze`
- `@param {Function} [opciones.guard] Función (nuevo, anterior) => boolean para controlar permisos`
- `@param {Function} [opciones.onMutate] Hook de telemetría al mutar`
- `@param {any} [opciones.storageAdapter] Adaptador de almacenamiento personalizado`
- `@returns {Signal<T>} Instancia compartida de Signal`

#### `function obtenerEstadoCompartido(nombreUnico)`

🔎 Recupera un Estado Compartido previamente registrado por su nombre.
- `@param {string} nombreUnico Nombre con el que se creó el estado`
- `@returns {Signal<any> | null} El Signal compartido o null si no existe`

#### `function listarEstadosCompartidos()`

📋 Lista todos los estados compartidos activos para inspección en Panel Admin / DevTools.
- `@returns {Array<{ nombre: string, descripcion: string, reglas: string, persistKey: string | null, valorActual: any, suscriptores: number }>}`

#### `function eliminarEstadoCompartido(nombreUnico)`

🧹 Elimina un Estado Compartido del registro y limpia sus suscriptores. Útil en tests o al cerrar sesión administrativa.
- `@param {string} nombreUnico Nombre del estado a eliminar`

### 📦 Módulo `src/core/render.js`

#### `const renderCondicional`

Motor de Renderizado Condicional Granular para MitaDOM. Evalúa un Signal y decide qué template insertar dentro del nodo contenedor. Evita re-rendereos masivos y muta únicamente el fragmento involucrado. Soporta DOS formas de llamada: 1) Forma declarativa (RECOMENDADA por claridad y legibilidad): renderCondicional({ estado: miSignal, contenedor: this.querySelector('#zona'), cuando: (valor) => valor.habilitado === true, mostrar: (valor) => `<div>Activo: ${valor.titulo}</div>`, sino: () => `<p>Desactivado</p>` }); 2) Forma posicional (retro-compatible): renderCondicional(signal, mountNode, conditionFn, trueTemplate, falseTemplate);
- `@param {any} signalOConfig Instancia de Signal o configuracion declarativa `{ estado, contenedor, cuando, mostrar, sino }``
- `@param {HTMLElement} [mountNodeArg] Contenedor DOM (modo posicional)`
- `@param {(state: any) => boolean} [conditionFnArg] Función evaluadora (modo posicional)`
- `@param {(state: any) => string} [trueTemplateArg] Generador HTML si es TRUE (modo posicional)`
- `@param {(state: any) => string} [falseTemplateArg] Generador HTML si es FALSE (modo posicional)`
- `@returns {() => void} Función `detener()` para desuscribir y liberar memoria`

#### `const vincularTexto`

let currentConditionState = null; const actualizarDominio = (state) => { const nextConditionState = Boolean(conditionFn(state)); // Evitamos tocar el DOM si el estado booleano de la condición no cambió if (!forzarActualizacionEnCambio && currentConditionState === nextConditionState) { return; } currentConditionState = nextConditionState; // Inyectamos de forma granular únicamente dentro del nodo asignado mountNode.innerHTML = nextConditionState ? trueTemplate(state) : falseTemplate(state); }; // Suscribir al signal y retornar función de limpieza return signal.suscribir(actualizarDominio); }; /** 🎯 Enlaza un Signal directamente al `textContent` de un nodo DOM (Granular Light DOM). Nunca usa `innerHTML`, previniendo XSS y preservando 100% la referencia del nodo.
- `@param {Signal<T>} signal Signal a observar`
- `@param {HTMLElement | null} nodo Elemento DOM cuyo texto se actualizará`
- `@param {(valor: T) => string} [formateador] Función opcional para transformar el valor a texto`
- `@returns {() => void} Función de limpieza para desuscribir`

### 📦 Módulo `src/core/resource.js`

#### `function crearRecurso(funcionFetch)`

Crea un recurso reactivo a partir de una promesa o función asíncrona. Ideal para el "Granular Fetching".
- `@param {() => Promise<any>} funcionFetch`

## 🧬 2. Componentes Nativos, Ciclo de Vida y Props/@defer

> Web Components Light DOM con ciclo de vida en español (`alCrear` → `render` → `alMontar` → `alCambiarProp` → `alDesmontar`), Props complejas y `@defer`.

### 📦 Módulo `src/core/mitaElement.js`

#### `class MitaElement`

Clase base MitaElement para crear Web Components Nativos con ciclo de vida completo y legible. Orden garantizado del ciclo de vida: 1. `alCrear()` — Constructor (inicializar `crearEstadoLocal`, sin depender aún del DOM). 2. `alAntesDeRenderizar()` — Justo antes del primer `render()` al conectar al DOM. 3. `render()` — Pinta el Light DOM una vez, protegido con Error Boundary (`fallbackUI` / `alError`). 4. `alMontar()` — DOM ya montado (`this.querySelector` garantizado): enlazar `vincularTexto`, `escucharEstado`, `mostrarSi` y eventos. 5. `alCambiarAtributo(nombre, antes, ahora)` / `alCambiarProp(propCamel, antes, ahora)` — Cambios en `observedAttributes`. 6. `alActualizar(motivo)` — Tras `this.solicitarActualizacion(motivo)`. 7. Auto-limpieza de `this._limpiezas` + `alDesmontar()` — Al salir del DOM (0 fugas de memoria).

### 📦 Módulo `src/core/componentes.js`

#### `function definirComponente(etiqueta, setupOuOpciones)`

Define un nuevo Web Component de forma funcional o basada en opciones (Options API). Provee una excelente Experiencia de Desarrollador (DX) al encapsular la complejidad de las Clases y el Prototype.
- `@param {string} etiqueta - El nombre del tag HTML (debe incluir un guión, ej: 'mi-boton')`
- `@param {Function | Object} setupOuOpciones - Función de setup (Composition API) o un Objeto de configuración (Options API)`

### 📦 Módulo `src/core/propsYDefer.js`

#### `function obtenerUrlImagenCientifico(person, size = 's')`

🧩 Motor Opinionado de Props para Web Components (Estilo React.dev `Passing Props to a Component`) + Vistas Diferidas (`@defer` de Angular.dev) + Formularios Reactivos con Signals (`Signal Forms` de Angular.dev). Prioriza la claridad absoluta, el tipado explícito y la protección de memoria tipo Rust. / import { crearEstadoReactivoInmutable, leerEstadoInmutable, mutarEstadoConHistorial, congelarProfundamenteInmutable } from './rustGuard.js'; /** @type {WeakMap<Element, Record<string, any>>} */ const propsPorElemento = new WeakMap(); /** 👩‍🔬 Helper Oficial del Tutorial "Pasando Props a un Componente" (Inspirado en `react.dev/learn/passing-props-to-a-component`). Construye la URL de imagen del científico a partir de `person.imageId` y `size` (`'s'` o `'b'`).
- `@param {{ name?: string, nombre?: string, imageId: string }} person`
- `@param {'s' | 'b' | string} [size='s']`
- `@returns {string}`

#### `const CIENTIFICOS_DEMO`

Catálogo oficial de científicos para demos y tests del tutorial de Props.

#### `function pasarPropsAElemento(elemento, nuevasProps = {})`

📦 Pasa un objeto de Props rico (objetos anidados, números, booleanos, funciones) a un Web Component en Light DOM y dispara su actualización reactiva si el componente define `render()`. Ejemplo equivalente a `<Avatar size={100} person={{ name: 'Katsuko Saruhashi', imageId: 'YfeOqp2' }} />`: ```js pasarPropsAElemento(avatarEl, { size: 100, person: { name: 'Katsuko Saruhashi', imageId: 'YfeOqp2' } }); ```
- `@param {Element | null} elemento`
- `@param {Record<string, any>} nuevasProps`

#### `function leerPropsDeElemento(elemento, valoresPorDefecto = /** @type {any} */ ({})`

📖 Lee las props de un Web Component combinando: 1) Valores por defecto (`valoresPorDefecto`), 2) Atributos HTML declarativos (`size="100"`, `data-person='{"name":"..."}'`), 3) Objetos pasados con `pasarPropsAElemento()`.
- `@param {Element | null} elemento`
- `@param {T} [valoresPorDefecto]`
- `@returns {Readonly<T>}`

#### `function renderizarVistaDiferida(config)`

⏳ Renderiza una Vista Diferida (Inspirado en `Deferrable Views / @defer` de `angular.dev/tutorials/deferrable-views`). Permite mostrar primero un `@placeholder` ligero, luego un estado `@loading` cuando se dispara el evento (`'interaccion' | 'temporizador' | 'inmediato'`), y finalmente el contenido pesado o `@error`.
- `@param {Object} config`
- `@param {HTMLElement | null} config.contenedor Elemento donde se montará el bloque diferido`
- `@param {'interaccion' | 'temporizador' | 'inmediato'} [config.disparador='interaccion'] Cuándo iniciar la carga`
- `@param {number} [config.demoraMs=600] Tiempo para el disparador `'temporizador'``
- `@param {() => string} config.plantillaPlaceholder HTML inicial antes de disparar (`@placeholder`)`
- `@param {() => string} [config.plantillaCargando] HTML mientras resuelve la promesa (`@loading`)`
- `@param {() => Promise<string> | string} config.cargarContenidoDiferido Función que devuelve el HTML final`
- `@param {(err: Error) => string} [config.plantillaError] HTML si ocurre un fallo (`@error`)`

#### `function crearFormularioReactivoConSignals(
  definicionCampos,
  nombreEstado = 'form:signal_form_reactivo'
)`

📝 Crea un Formulario Reactivo Basado en Signals (Inspirado en `Signal Forms` de `angular.dev/tutorials/signal-forms`). Cada campo mantiene su valor, estado `tocado`, mensaje de error y validez en tiempo real dentro de un Signal inmutable. valorInicial?: any, requerido?: boolean, minLongitud?: number, patronRegex?: string, validadorPersonalizado?: (valor: any) => string | null }>} definicionCampos
- `@param {Record<string, {`
- `@param {string} [nombreEstado='form:signal_form_reactivo']`

## 🌐 3. Async Graph (Solid 2.0), Server Functions, Routing y SSR/Islands

> Promesas en el grafo reactivo, `live()` SSE, Optimistic Rollback, estrategias de render en 1 línea y Router SPA.

### 📦 Módulo `src/core/asyncGraph.js`

#### `const CATALOGO_DIAGNOSTICOS_AGENTE`

============================================================================ MitaDOM Async Graph + Live Server Functions + Agent Diagnostics (v2.7) Inspirado en lo mejor y más estable de: - SolidJS 2.0 (Async Graph, One Graph Two Machines, live() SSE, Long Hold, Diagnostics para Agentes) - Angular 20 (linkedSignal, resource API y claridad por convención) - React 19 (Server Actions y Optimistic UI con rollback automático) - Vue 3.6 Vapor & Qwik City (Granular DOM sin VDOM + cambio de estrategia de render en 1 línea) ============================================================================ / const RUTA_SKILL_AGENTE = 'node_modules/mita-dom/skills/reactivity-diagnostics/SKILL.md'; /** Catálogo estable de códigos de diagnóstico diseñados para humanos y Agentes IA.

#### `function emitirDiagnosticoAgente(codigo, contexto = {})`

const registroDiagnosticosAgente = []; /** 🤖 Emite un diagnóstico estructurado legible tanto por desarrolladores como por Agentes IA.
- `@param {keyof typeof CATALOGO_DIAGNOSTICOS_AGENTE} codigo`
- `@param {{ origen?: string, detalle?: string, silencioso?: boolean }} [contexto]`

#### `function obtenerDiagnosticosAgente()`

📋 Devuelve una copia inmutable del historial de diagnósticos emitidos para humanos/Agentes IA.

#### `function limpiarDiagnosticosAgente()`

🧹 Limpia el historial de diagnósticos (útil en tests y DevTools).

#### `function crearMemoAsincrono(fnAsincrona, opciones = {})`

⚡ Solid 2.0 Async Graph + Angular `resource()`: Crea un cómputo asíncrono reactivo que: - Rastrea automáticamente cualquier Signal leído antes del `await`. - Cancela automáticamente race conditions (solo aplica la última respuesta). - Preserva el valor anterior (UI *stale* sin parpadeo) mientras `estaPendiente()` es `true`. - Dispara el diagnóstico `[MITA_ESPERA_PROLONGADA]` (`LONG_HOLD`) si excede el umbral.
- `@param {(ctx: { signal: AbortSignal }) => Promise<T> | T} fnAsincrona`
- `@param {{ valorInicial?: T | null, umbralEsperaProlongadaMs?: number, nombre?: string, silenciosoDiagnostico?: boolean }} [opciones]`

#### `function crearEstadoVinculado(leerFuente, calcularValor)`

pendiente: false, error: /** @type {string | null} */ (null), esperaProlongada: false, version: 0, latenciaMs: 0 }); let solicitudActivaId = 0; /** @type {AbortController | null} */ let controladorActivo = null; /** @type {ReturnType<typeof setTimeout> | null} */ let timerLongHold = null; let destruido = false; const limpiarTimer = () => { if (timerLongHold !== null) { clearTimeout(timerLongHold); timerLongHold = null; } }; const ejecutarCalculo = () => { if (destruido) return; if (controladorActivo) { controladorActivo.abort(); } limpiarTimer(); solicitudActivaId += 1; const miSolicitudId = solicitudActivaId; controladorActivo = typeof AbortController !== 'undefined' ? new AbortController() : null; const t0 = performance.now(); let resultado; try { // Ejecutar síncronamente dentro de crearEfecto para que se rastreen los Signals leídos antes del primer await resultado = fnAsincrona({ signal: /** @type {AbortSignal} */ (controladorActivo ? controladorActivo.signal : undefined) }); } catch (errSync) { sinRastrear(() => { estado.patch({ pendiente: false, esperaProlongada: false, error: errSync instanceof Error ? errSync.message : String(errSync) }); }); return; } if (!resultado || typeof /** @type {any} */ (resultado).then !== 'function') { sinRastrear(() => { estado.patch({ valor: /** @type {T} */ (resultado), pendiente: false, esperaProlongada: false, error: null, version: estado.get().version + 1, latenciaMs: Number((performance.now() - t0).toFixed(2)) }); }); return; } sinRastrear(() => { estado.patch({ pendiente: true, esperaProlongada: false, error: null }); }); if (umbralEsperaProlongadaMs > 0) { timerLongHold = setTimeout(() => { if (destruido || miSolicitudId !== solicitudActivaId) return; sinRastrear(() => { estado.patch({ esperaProlongada: true }); }); emitirDiagnosticoAgente('MITA_ESPERA_PROLONGADA', { origen: nombre, detalle: `superó ${umbralEsperaProlongadaMs}ms esperando respuesta`, silencioso: silenciosoDiagnostico }); }, umbralEsperaProlongadaMs); } Promise.resolve(resultado).then( (datos) => { if (destruido || miSolicitudId !== solicitudActivaId) return; // Cancelar race condition obsoleta limpiarTimer(); sinRastrear(() => { estado.patch({ valor: /** @type {T} */ (datos), pendiente: false, esperaProlongada: false, error: null, version: estado.get().version + 1, latenciaMs: Number((performance.now() - t0).toFixed(2)) }); }); }, (err) => { if (destruido || miSolicitudId !== solicitudActivaId) return; limpiarTimer(); sinRastrear(() => { estado.patch({ pendiente: false, esperaProlongada: false, error: err instanceof Error ? err.message : String(err), latenciaMs: Number((performance.now() - t0).toFixed(2)) }); }); } ); }; const detenerEfecto = crearEfecto(() => { ejecutarCalculo(); }); return { estado, valor: () => estado.get().valor, estaPendiente: () => estado.get().pendiente, esperaProlongada: () => estado.get().esperaProlongada, error: () => estado.get().error, reintentar: () => ejecutarCalculo(), destruir: () => { destruido = true; limpiarTimer(); if (controladorActivo) controladorActivo.abort(); detenerEfecto(); estado.destroy(); } }; } /** 🔗 Angular 20 `linkedSignal` + Solid 2.0 Cascading Signal: Crea un estado escribible cuyo valor se recalcula/resetea automáticamente cuando cambia su fuente padre. Ideal para selects en cascada (ej. Departamento -> Ciudad seleccionada por defecto).
- `@param {() => TFuente} leerFuente Función que lee uno o más Signals padre`
- `@param {(valorFuente: TFuente, valorAnterior: TValor | undefined) => TValor} calcularValor`

#### `function crearEstadoOptimistaConRollback(valorInicial)`

let ultimoValor; /** @type {any} */ let estado = null; const detener = crearEfecto(() => { const fuente = leerFuente(); // Leemos `ultimoValor` sin llamar `estado.get()` para evitar auto-rastrear el propio estado vinculado const calculado = calcularValor(fuente, ultimoValor); ultimoValor = calculado; if (!inicializado) { estado = crearEstadoLocal(calculado); inicializado = true; } else if (estado) { estado.set(calculado); } }); return { estado, get: () => /** @type {TValor} */ (estado.get()), set: (nuevoValor) => { ultimoValor = nuevoValor; return estado.set(nuevoValor); }, suscribir: (cb) => estado.suscribir(cb), destruir: () => { detener(); if (estado) estado.destroy(); } }; } /** 🛡️ Solid 2.0 Speculative State + React 19 `useOptimistic`: Aplica un cambio inmediato en la UI y revierte automáticamente al último valor confirmado por el servidor si la operación remota falla.
- `@param {T} valorInicial`

#### `function crearFuncionServidor(nombre, handlerServidor, opciones = {})`

}); return { estado, valor: () => estado.get().valor, /** / async aplicarConServidor(valorOptimista, mutacionServidor) { estado.patch({ valor: valorOptimista, estaConfirmando: true, seHizoRollback: false, ultimoError: null }); try { const respuestaServidor = await mutacionServidor(); const valorFinal = respuestaServidor !== undefined ? /** @type {T} */ (respuestaServidor) : valorOptimista; ultimoValorConfirmado = valorFinal; estado.patch({ valor: valorFinal, valorConfirmado: valorFinal, estaConfirmando: false, seHizoRollback: false, ultimoError: null }); return { ok: true, valor: valorFinal, rollback: false }; } catch (err) { const mensaje = err instanceof Error ? err.message : String(err); estado.patch({ valor: ultimoValorConfirmado, valorConfirmado: ultimoValorConfirmado, estaConfirmando: false, seHizoRollback: true, ultimoError: mensaje }); return { ok: false, valor: ultimoValorConfirmado, rollback: true, error: mensaje }; } }, destruir: () => estado.destroy() }; } /** 🌐 Solid 2.0 Server Function (RPC Isomórfico Request/Response): Envuelve una función de servidor (Express/Node) con estado reactivo, validación y medición de latencia.
- `@param {T} valorOptimista Valor a mostrar de inmediato en pantalla`
- `@param {() => Promise<T | void>} mutacionServidor Llamada al servidor (autoridad de verdad)`
- `@param {string} nombre Nombre único (ej. 'menu/crearPlato')`
- `@param {(payload: TPayload) => Promise<TResultado> | TResultado} handlerServidor`
- `@param {{ validar?: (payload: TPayload) => string | null, endpoint?: string }} [opciones]`

#### `function crearFuncionServidorEnVivo(nombre, generadorAsync)`

error: /** @type {string | null} */ (null), latenciaMs: 0, invocaciones: 0 }); return { nombre, endpoint, estado, /** / async ejecutar(payload) { if (typeof opciones.validar === 'function') { const errVal = opciones.validar(payload); if (errVal) { estado.patch({ pendiente: false, error: errVal }); return { ok: false, datos: null, error: errVal, latenciaMs: 0 }; } } const t0 = performance.now(); estado.patch({ pendiente: true, error: null }); try { const datos = await handlerServidor(payload); const latenciaMs = Number((performance.now() - t0).toFixed(2)); estado.patch({ pendiente: false, datos, error: null, latenciaMs, invocaciones: estado.get().invocaciones + 1 }); return { ok: true, datos, error: null, latenciaMs }; } catch (err) { const latenciaMs = Number((performance.now() - t0).toFixed(2)); const mensaje = err instanceof Error ? err.message : String(err); estado.patch({ pendiente: false, error: mensaje, latenciaMs }); return { ok: false, datos: null, error: mensaje, latenciaMs }; } }, destruir: () => estado.destroy() }; } /** 📡 Solid 2.0 `live(async function* ...)` — Server Function en Tiempo Real (SSE / Async Iterator): Consume un generador asíncrono (`async function*`) y expone cada `yield` directamente en un Signal.
- `@param {TPayload} payload`
- `@param {string} nombre Identificador del stream (ej. 'cocina/pedidosEnVivo')`
- `@param {(...args: any[]) => AsyncGenerator<T, void, unknown>} generadorAsync`

#### `const ESTRATEGIAS_RENDER_MITA`

ticks: 0, error: /** @type {string | null} */ (null) }); let activo = false; /** @type {AsyncGenerator<T, void, unknown> | null} */ let iteradorActual = null; const detener = async () => { activo = false; estado.patch({ conectado: false }); if (iteradorActual && typeof iteradorActual.return === 'function') { try { await iteradorActual.return(); } catch { // Ignorar cierre limpio del generador } } iteradorActual = null; }; /** / const iniciar = async (...args) => { await detener(); activo = true; estado.patch({ conectado: true, error: null }); try { iteradorActual = generadorAsync(...args); for await (const dato of iteradorActual) { if (!activo) break; estado.patch({ valor: dato, ticks: estado.get().ticks + 1, error: null }); } if (activo) { activo = false; estado.patch({ conectado: false }); } } catch (err) { activo = false; estado.patch({ conectado: false, error: err instanceof Error ? err.message : String(err) }); } }; return { nombre, estado, ultimoValor: () => estado.get().valor, iniciar, detener, destruir: () => { detener(); estado.destroy(); } }; } /** 🌐 Catálogo claro de las 5 estrategias de renderizado soportadas por MitaDOM (combinando SPA, SSR, SSG, Hybrid Islands y Qwik Resumability).
- `@param {...any} args`

#### `function definirEstrategiaRenderRuta(ruta, estrategia, opciones = {})`

const mapaEstrategiasRutas = new Map(); /** 🧭 Define o cambia en 1 línea la estrategia de renderizado para una ruta específica.
- `@param {string} ruta Ej. '/empleos', '/docs', '/admin'`
- `@param {keyof typeof ESTRATEGIAS_RENDER_MITA} estrategia`
- `@param {{ cacheSegundos?: number }} [opciones]`

#### `function cambiarEstrategiaRender(ruta, nuevaEstrategia, opciones = {})`

const info = ESTRATEGIAS_RENDER_MITA[clave]; if (!info) { throw new Error( `[MitaDOM] Estrategia desconocida "${estrategia}". Usa una de: ${Object.keys(ESTRATEGIAS_RENDER_MITA).join(', ')}` ); } const entrada = { ruta, estrategia: clave, cacheSegundos: opciones.cacheSegundos ?? (clave === 'SSG' ? 86400 : clave === 'SSR' ? 0 : 60), descripcion: info.titulo }; mapaEstrategiasRutas.set(ruta, entrada); return { ...entrada, detalles: info }; } /** 🔄 Alias explícito y ultra-legible para cambiar la estrategia de una ruta existente.
- `@param {string} ruta`
- `@param {keyof typeof ESTRATEGIAS_RENDER_MITA} nuevaEstrategia`
- `@param {{ cacheSegundos?: number }} [opciones]`

#### `function obtenerMapaEstrategiasRender()`

📋 Lista todas las rutas configuradas con su estrategia de render activa.

### 📦 Módulo `src/core/ssr.js`

#### `const MitaMeta`

🌍 Motor Isomórfico de Estrategias de Render (SSR, SSG, Hybrid, Islands y CSR/SPA) + MitaMeta Portado y evolucionado desde `food-show-1` al núcleo de `mita-dom`. / import { crearEstadoCompartido } from './signals.js'; function escaparAtributo(valor) { return String(valor ?? '') .replace(/&/g, '&amp;') .replace(/</g, '&lt;') .replace(/>/g, '&gt;') .replace(/"/g, '&quot;'); } const estadoHeadGlobal = crearEstadoCompartido( 'sistema:head_seo', { title: 'MitaDOM App', meta: [] }, { persistirLocal: false, descripcion: 'Estado isomórfico de etiquetas <title> y <meta> para SEO en SSR, SSG y SPA.', reglas: 'Actualizable desde cualquier vista con MitaMeta.useHead().' } ); /** 🏷️ Gestor Isomórfico de SEO y `<head>` (Funciona en Node SSR/SSG y en Browser SPA).

#### `function renderizarVistaUniversal(VistaOClase, opciones = {})`

Define título y meta-tags de la vista actual. / useHead(config = {}) { estadoHeadGlobal.patch({ title: config.title ?? estadoHeadGlobal.get().title, meta: Array.isArray(config.meta) ? config.meta : estadoHeadGlobal.get().meta }); if (typeof window !== 'undefined' && typeof document !== 'undefined') { this.applyToDOM(); } }, /** Aplica los cambios directamente al `document.head` en el navegador (SPA / Hydration). / applyToDOM() { if (typeof document === 'undefined') return; const { title, meta } = estadoHeadGlobal.get(); if (title && document.title !== title) { document.title = title; } document.querySelectorAll('meta[data-mita-meta]').forEach((el) => el.remove()); if (Array.isArray(meta)) { meta.forEach((tag) => { const el = document.createElement('meta'); el.setAttribute('data-mita-meta', 'true'); for (const [key, value] of Object.entries(tag)) { el.setAttribute(key, String(value)); } document.head.appendChild(el); }); } }, /** Genera el string HTML de `<title>` y `<meta>` para inyectar en `<!--ssr-head-->` durante SSR o SSG. / renderSSRHead() { const { title, meta } = estadoHeadGlobal.get(); let html = `<title>${escaparAtributo(title)}</title>`; if (Array.isArray(meta)) { meta.forEach((tag) => { const attrs = Object.entries(tag) .map(([k, v]) => `${escaparAtributo(k)}="${escaparAtributo(v)}"`) .join(' '); html += `<meta data-mita-meta="true" ${attrs}>`; }); } return html; }, obtenerEstado() { return estadoHeadGlobal.get(); } }; /** 🚀 Renderizador Universal de Vistas de MitaDOM. Soporta las 4 estrategias: - `'ssr'`: Server-Side Rendering dinámico por petición. - `'ssg'`: Static Site Generation en tiempo de compilación (inyecta `window.__MITA_SSG__ = true`). - `'hybrid'`: SSR/SSG con hidratación selectiva e Islands Architecture (`mita-client="only"`, `mita-server="only"`). - `'csr'` (o `'spa'`): Client-Side Rendering puro (entrega esqueleto ligero en servidor).
- `@param {{ title?: string, meta?: Array<Record<string, string>> }} config`
- `@returns {string}`
- `@param {any} VistaOClase Clase de página o instancia con métodos `onInit?()`, `render()`, `hydrate?()``
- `@param {Object} [opciones={}]`
- `@param {string} [opciones.url='/'] URL solicitada (soporta `?mita_mode=csr` o `?mita_mode=ssr`)`
- `@param {'ssr' | 'ssg' | 'hybrid' | 'csr' | 'spa'} [opciones.modo='hybrid'] Estrategia deseada`
- `@param {Record<string, any>} [opciones.contexto={}] Contexto isomórfico (ej. `isSlowNetwork`, usuario)`
- `@returns {Promise<{ modoAplicado: string, head: string, body: string, htmlDocumento: string }>}`

### 📦 Módulo `src/core/router.js`

#### `function navegarA(ruta)`

Motor de Enrutamiento moderno basado en `window.navigation` Al ser modular, el cliente decide si importarlo o no. / // Signal global que contiene la ruta actual de la aplicación export const rutaActual = crearEstadoGlobal('/'); // Si estamos en un entorno de navegador (no Node.js durante los tests) if (typeof window !== 'undefined' && window.navigation) { // Inicializamos el Signal con la ruta actual al cargar la página rutaActual.set(new URL(window.navigation.currentEntry?.url || window.location.href).pathname); // Escuchamos el evento nativo 'navigate' de la Navigation API window.navigation.addEventListener('navigate', (event) => { // Obtenemos la ruta destino const urlDestino = new URL(event.destination.url); // Si es una navegación hacia el mismo dominio (SPA) if (urlDestino.origin === window.location.origin) { // Prevenimos la recarga completa del navegador event.intercept({ handler() { // Actualizamos el Signal. Todos los componentes suscritos reaccionarán. rutaActual.set(urlDestino.pathname); } }); } }); } else if (typeof window !== 'undefined') { // Si estamos en un entorno de test (JSDOM), no mostramos el warning para no ensuciar la consola const isTestEnv = window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes('jsdom'); if (!isTestEnv) { console.warn('mita-dom: Tu navegador no soporta la Navigation API. El enrutamiento SPA no está disponible.'); } } /** Función helper para navegar programáticamente con Graceful Fallback (Navigation API -> History API -> SSR Signal)
- `@param {string} ruta`

### 📦 Módulo `src/core/mitaRouter.js`

#### `class MitaRouter`

MitaRouter - Paginación Animada NATIVA. Consume `<template data-path="/ruta">` de su Light DOM y los renderiza con animaciones de WAAPI.

## 🦀 4. Seguridad, Protección de Memoria (RustGuard) y Animaciones

> Borrow Checker inmutable (`&T`/`&mut T`), RAII Drop, sanitización XSS, `mitaResult` y animaciones nativas.

### 📦 Módulo `src/core/rustGuard.js`

#### `function congelarProfundamenteInmutable(valor)`

🦀 Protección de Memoria, Fugas y Performance inspirada en Rust + Sintaxis Verbosa Ultra-Clara Conceptos de Rust adaptados a JavaScript y Web Components: 1. Borrow Checker Inmutable (`&T` vs `&mut T`): - `leerEstadoInmutable(signal)` devuelve una referencia congelada (`Object.freeze` recursivo). - Si alguien intenta mutar `estado.get().propiedad = 123` directamente sin pasar por el canal autorizado (`mutarEstadoConHistorial` / `.patch()`), JavaScript lanza un `TypeError` inmediato. 2. Ownership & RAII (`Drop` Trait): - `crearAmbitoConLimpiezaAutomatica(nombrePropietario)` registra cada suscripción, efecto, listener del DOM y temporizador bajo un único propietario. - Al desmontar el componente, `.liberarMemoriaCompleta()` ejecuta `drop()` sobre todos los recursos garantizando 0 fugas de memoria (Memory Leaks). 3. Sintaxis Verbosa Auto-Explicativa: - Prioriza la claridad pedagógica sobre la brevedad críptica. / import { crearEstadoLocal, crearEstadoCompartido, crearEfecto } from './signals.js'; /** @typedef {import('./signals.js').Signal} Signal */ import { renderCondicional } from './render.js'; /** @type {WeakMap<object, Array<{ fecha: string, motivo: string, valorAnterior: any, valorNuevo: any }>>} */ const historialPorSignal = new WeakMap(); /** Congela recursivamente un objeto o array para simular una referencia inmutable `&T` de Rust.
- `@param {T} valor`
- `@returns {T}`

#### `function crearEstadoReactivoInmutable(nombreIdentificador, valorInicial, opciones = {})`

🦀 Crea un estado reactivo protegido con instantáneas inmutables (estilo Rust `&T`) y límite detector de fugas de suscriptores.
- `@param {string} nombreIdentificador Nombre descriptivo del estado (ej. `'carrito:items'`)`
- `@param {T} valorInicial Valor inicial del estado`
- `@param {Object} [opciones={}]`
- `@param {boolean} [opciones.compartidoEntreComponentes=false] Si es `true`, usa el registro compartido`
- `@param {boolean} [opciones.persistirEnLocalStorage=false] Si es `true`, sincroniza con `localStorage``
- `@param {string} [opciones.descripcionDelEstado=''] Documentación viva del propósito del estado`
- `@param {string} [opciones.reglasDeNegocio=''] Reglas que debe cumplir este estado`
- `@param {number} [opciones.maximoSuscriptoresPermitidos=25] Umbral para alertar posibles fugas de memoria`
- `@returns {Signal}`

#### `function leerEstadoInmutable(signal)`

📖 Préstamo Inmutable (`&T` en Rust): Devuelve el valor actual del Signal profundamente congelado (`Object.freeze`). Cualquier intento de hacer `valor.prop = 'x'` lanzará un `TypeError` explicativo.
- `@param {Signal} signal`
- `@returns {T}`

#### `function mutarEstadoConHistorial(
  signal,
  nuevosDatosOMutador,
  motivoDelCambio = 'Actualización explícita'
)`

✍️ Préstamo Mutable Controlado (`&mut T` en Rust): Actualiza el estado de forma atómica, congela el nuevo snapshot para protegerlo contra mutaciones accidentales y guarda una entrada en el historial de auditoría.
- `@param {Signal} signal Instancia del Signal a modificar`
- `@param {any | ((estadoActualInmutable: any) => any)} nuevosDatosOMutador Objeto parcial, nuevo valor o función pura`
- `@param {string} [motivoDelCambio='Actualización explícita'] Explicación legible de por qué cambió el estado`

#### `function obtenerHistorialDeMutaciones(signal)`

📜 Obtiene el historial auditable de mutaciones realizadas con `mutarEstadoConHistorial()`.
- `@param {Signal} signal`

#### `function renderizarSiSeCumpleCondicion(config)`

🔀 Wrapper Verboso y Auto-Explicativo sobre `renderCondicional`. Ideal para desarrolladores que prefieren nombres de propiedades 100% explícitos en español.
- `@param {Object} config`
- `@param {Signal} config.estadoReactivo Signal que gobierna la condición`
- `@param {HTMLElement | null} config.contenedorDom Elemento HTML donde se montará o destruirá la vista`
- `@param {(valorEstado: any) => boolean} config.condicionParaMostrar Función booleana`
- `@param {(valorEstado: any) => string} config.plantillaHtmlSiSeCumple HTML cuando la condición es `true``
- `@param {(valorEstado: any) => string} [config.plantillaHtmlSiNoSeCumple] HTML cuando la condición es `false``

#### `function medirPresupuestoDeRenderizado(nombreOperacion, operacionFn, presupuestoMaximoMs = 16)`

⏱️ Guardián de Performance: mide cuánto tarda una función de renderizado o cálculo y alerta si supera el presupuesto de un frame a 60fps (`16ms` por defecto).
- `@param {string} nombreOperacion`
- `@param {() => T} operacionFn`
- `@param {number} [presupuestoMaximoMs=16]`
- `@returns {{ resultado: T, duracionMs: number, dentroDePresupuesto: boolean, alerta: string | null }}`

#### `function crearAmbitoConLimpiezaAutomatica(nombrePropietario, opciones = {})`

🦀 Ownership & RAII Scope (`Drop` Trait de Rust para Web Components): Agrupa todas las suscripciones a Signals, efectos, listeners del DOM y timers bajo un propietario explícito. Cuando el propietario se desmonta, `liberarMemoriaCompleta()` destruye todos los recursos garantizando 0 Memory Leaks.
- `@param {string} nombrePropietario Ej: `'<mi-componente-empleos>'``
- `@param {{ maxRecursos?: number }} [opciones={}]`

#### `function ejecutarSuiteVerificacionMita()`

let recursosActivos = []; let liberado = false; let totalLiberadosHistorico = 0; function verificarActivo() { if (liberado) { throw new Error( `[RustGuard Ownership] No puedes registrar recursos en "${nombrePropietario}" porque su ámbito ya ejecutó liberarMemoriaCompleta() (Use-After-Free prevenido).` ); } } return { nombrePropietario, /** Suscribe un callback a un Signal y lo vincula al ciclo de vida del ámbito. / vincularSignalConLimpieza(signal, callback, etiqueta = 'suscripcion-signal') { verificarActivo(); const desuscribir = signal.suscribir((valor) => { callback(congelarProfundamenteInmutable(valor)); }); recursosActivos.push({ tipo: 'signal', etiqueta, limpiar: desuscribir }); return desuscribir; }, /** Crea un efecto auto-rastreable vinculado al ámbito RAII. / ejecutarEfectoConLimpieza(efectoFn, etiqueta = 'efecto-reactivo') { verificarActivo(); const detener = crearEfecto(efectoFn); recursosActivos.push({ tipo: 'efecto', etiqueta, limpiar: detener }); return detener; }, /** Registra un `addEventListener` que se removerá automáticamente al hacer `drop`. / escucharEventoDomConLimpieza(elemento, nombreEvento, manejador) { verificarActivo(); if (!elemento || typeof elemento.addEventListener !== 'function') return () => {}; elemento.addEventListener(nombreEvento, manejador); const remover = () => elemento.removeEventListener(nombreEvento, manejador); recursosActivos.push({ tipo: 'dom-event', etiqueta: `on:${nombreEvento}`, limpiar: remover }); return remover; }, /** Registra un `setInterval` seguro que nunca quedará huérfano en memoria. / programarIntervaloConLimpieza(fn, milisegundos) { verificarActivo(); const id = setInterval(fn, milisegundos); const cancelar = () => clearInterval(id); recursosActivos.push({ tipo: 'timer', etiqueta: `interval:${milisegundos}ms`, limpiar: cancelar }); return cancelar; }, /** Ejecuta el equivalente al trait `Drop` de Rust: libera cada suscripción, efecto, listener y timer registrado, e impide usos posteriores (Use-After-Free). / liberarMemoriaCompleta() { if (liberado) return 0; const cantidad = recursosActivos.length; while (recursosActivos.length > 0) { const recurso = recursosActivos.pop(); try { recurso?.limpiar(); } catch (err) { console.error(`[RustGuard] Error liberando recurso ${recurso?.etiqueta}:`, err); } } totalLiberadosHistorico += cantidad; liberado = true; return cantidad; }, /** Permite reutilizar el ámbito tras un re-render explícito limpiando primero lo anterior. / reiniciarAmbitoParaNuevoRender() { this.liberarMemoriaCompleta(); liberado = false; }, /** Devuelve un diagnóstico completo de memoria y posibles fugas del componente. / auditarSaludDeMemoria() { const posibleFuga = recursosActivos.length > maxRecursos; return { propietario: nombrePropietario, ambitoLiberado: liberado, recursosActivosCount: recursosActivos.length, totalLiberadosHistorico, detalleRecursos: recursosActivos.map((r) => `${r.tipo}:${r.etiqueta}`), posibleFugaDetectada: posibleFuga, mensajeDiagnostico: posibleFuga ? `⚠️ Posible fuga: ${recursosActivos.length} recursos activos superan el límite (${maxRecursos}).` : `✅ Memoria saludable en "${nombrePropietario}" (${recursosActivos.length} activos, ${totalLiberadosHistorico} liberados).` }; } }; } /** 🧪 Suite Automática de Auto-Verificación de Mita-DOM (Ejecutable en Browser y en Node Tests). Verifica las garantías tipo Rust (Borrow Checker, RAII Drop, Use-After-Free, Performance e Historial).
- `@param {Signal} signal`
- `@param {(valorInmutable: any) => void} callback`
- `@param {string} [etiqueta='suscripcion-signal']`
- `@param {() => void} efectoFn`
- `@param {string} [etiqueta='efecto-reactivo']`
- `@param {EventTarget | null} elemento`
- `@param {string} nombreEvento`
- `@param {EventListenerOrEventListenerObject} manejador`
- `@param {() => void} fn`
- `@param {number} milisegundos`

### 📦 Módulo `src/seguridad.js`

#### `function sanitizarTexto(textoInseguro)`

🔒 Sanitiza strings antes de inyectarlos en el DOM Justificación: Previene que un usuario malicioso inyecte un <script> en un input.
- `@param {string} textoInseguro`
- `@returns {string}`

### 📦 Módulo `src/utils/result.js`

#### `function mitaResult(operacion)`

Patrón "Result" (Inspirado en Rust y Go) Evita el uso del destructivo `try/catch` que rompe el flujo léxico y obliga al desarrollador a manejar los errores explícitamente en una sola línea.
- `@param {Promise<T> | (() => T)} operacion - Una promesa o una función síncrona.`
- `@returns {Promise<[Error, null] | [null, T]> | [Error, null] | [null, T]} Retorna la tupla [error, data].`

### 📦 Módulo `src/core/mitaAnim.js`

#### `class MitaAnim`

MitaAnim - Envoltura pragmática sobre la Web Animations API (WAAPI). Permite ejecutar transiciones sobre el Light/Shadow DOM a 60FPS sin sobrecargar el hilo principal (compositor thread).

### 📦 Módulo `src/core/mitaTween.js`

#### `const Easings`

Símbolo público exportado por el núcleo de MitaDOM.

#### `class MitaTween`

Símbolo público exportado por el núcleo de MitaDOM.

## 🛡️ 5. UI, Formularios, Moderación, Fullstack y DevTools

> FormBuilder Auth, Consentimiento, Chat Anti-Spam, Paginación, Moderación `"DC"`, CLI `npx mita`, Mita Doc y SemVer Advisor.

### 📦 Módulo `src/utils/chatGuard.js`

#### `function crearControlSpam(opciones = {})`

🛡️ Utilidades para Chats Reactivos, Control Anti-Spam y Filtración de Colecciones en MitaDOM. Diseñadas para ayudar a crear chats, sistemas de comentarios, tablones de anuncios y buscadores de documentación sin dependencias externas. / /** Crea un guardián Anti-Spam con control de frecuencia (cooldown), detección de mensajes duplicados, límite de longitud y filtrado de palabras o enlaces no permitidos. evaluarMensaje: (texto: string, usuario?: string) => { permitido: boolean, motivo: string | null, textoLimpio: string, esperaMs: number }, reiniciar: () => void }}
- `@param {Object} [opciones={}] Configuración del guardián`
- `@param {number} [opciones.cooldownMs=1200] Tiempo mínimo entre mensajes del mismo usuario (ms)`
- `@param {number} [opciones.maxLongitud=280] Cantidad máxima de caracteres permitidos`
- `@param {string[]} [opciones.palabrasProhibidas=['spam', 'casino', 'phishing', 'estafa']] Lista negra`
- `@param {boolean} [opciones.bloquearLinks=false] Si es true, rechaza mensajes con http:// o https://`
- `@param {boolean} [opciones.bloquearDuplicados=true] Si es true, impide repetir el mismo texto seguido`
- `@returns {{`

#### `function filtrarColeccion(coleccion, filtros = {})`

const historialPorUsuario = new Map(); return { evaluarMensaje(textoRaw, usuario = 'anonimo') { const textoLimpio = String(textoRaw ?? '').trim(); const ahora = Date.now(); if (!textoLimpio) { return { permitido: false, motivo: 'El mensaje no puede estar vacío.', textoLimpio: '', esperaMs: 0 }; } if (textoLimpio.length > config.maxLongitud) { return { permitido: false, motivo: `El mensaje supera el límite de ${config.maxLongitud} caracteres.`, textoLimpio, esperaMs: 0 }; } const registro = historialPorUsuario.get(usuario); if (registro) { const transcurrido = ahora - registro.ultimoEnvioMs; if (transcurrido < config.cooldownMs) { const esperaMs = config.cooldownMs - transcurrido; return { permitido: false, motivo: `Control Anti-Spam: espera ${(esperaMs / 1000).toFixed(1)}s antes de enviar otro mensaje.`, textoLimpio, esperaMs }; } if (config.bloquearDuplicados && registro.ultimoTexto.toLowerCase() === textoLimpio.toLowerCase()) { return { permitido: false, motivo: 'Control Anti-Spam: mensaje duplicado consecutivo bloqueado.', textoLimpio, esperaMs: 0 }; } } if (config.bloquearLinks && /(https?:\/\/|www\.)/i.test(textoLimpio)) { return { permitido: false, motivo: 'Control Anti-Spam: no se permiten enlaces externos en este canal.', textoLimpio, esperaMs: 0 }; } const palabraDetectada = config.palabrasProhibidas.find((palabra) => textoLimpio.toLowerCase().includes(String(palabra).toLowerCase()) ); if (palabraDetectada) { return { permitido: false, motivo: `Control Anti-Spam: el término "${palabraDetectada}" está restringido por moderación.`, textoLimpio, esperaMs: 0 }; } historialPorUsuario.set(usuario, { ultimoEnvioMs: ahora, ultimoTexto: textoLimpio }); return { permitido: true, motivo: null, textoLimpio, esperaMs: 0 }; }, reiniciar() { historialPorUsuario.clear(); } }; } /** 🔍 Filtra una colección de objetos por término de búsqueda y categoría. Ideal para buscadores de documentación, salas de chat, listas de novedades o anuncios.
- `@param {T[]} coleccion Lista original de elementos`
- `@param {Object} [filtros={}] Opciones de filtrado`
- `@param {string} [filtros.busqueda=''] Texto a buscar`
- `@param {string} [filtros.categoria='todos'] Categoría seleccionada ('todos' o 'all' no filtra)`
- `@param {string} [filtros.campoCategoria='categoria'] Propiedad donde vive la categoría`
- `@param {string[]} [filtros.camposTexto=['titulo', 'texto', 'contenido', 'autor']] Propiedades donde buscar texto`
- `@returns {T[]} Subconjunto filtrado sin mutar la colección original`

### 📦 Módulo `src/utils/formBuilder.js`

#### `function crearFormularioReusable(opciones)`

🧱 Constructor Re-usable de Formularios + Controlador Reactivo de Autenticación Portado y evolucionado desde `food-show-1/src/components/FormBuilder.js` a HTML5 semántico puro. / import { crearEstadoCompartido } from '../core/signals.js'; import { renderCondicional } from '../core/render.js'; function escaparHtml(texto) { return String(texto ?? '') .replace(/&/g, '&amp;') .replace(/</g, '&lt;') .replace(/>/g, '&gt;') .replace(/"/g, '&quot;') .replace(/'/g, '&#39;'); } /** Crea un formulario HTML5 semántico, accesible y 100% re-usable para Login, Registro, Contacto, Anuncios o Configuración. Incluye: - Campos `text`, `email`, `password` (con botón `👁️` para mostrar/ocultar), `select`, `textarea` y `checkbox` (ej. Términos y Condiciones). - Validación declarativa por `pattern` (RegExp), `minLength` y `required`. - Mensajes de error granulares en `<output>` por cada campo sin re-renderizar el formulario. name: string, label: string, type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox', placeholder?: string, required?: boolean, pattern?: string, minLength?: number, errorMsg?: string, options?: Array<{ value: string, label: string }>, hidden?: boolean }>} opciones.fields Lista declarativa de campos
- `@param {Object} opciones`
- `@param {string} [opciones.id] ID único del formulario`
- `@param {string} [opciones.titulo] Título opcional dentro de `<legend>``
- `@param {string} [opciones.submitText='Enviar'] Texto del botón submit`
- `@param {Array<{`
- `@param {(datos: Record<string, any>) => void | Promise<void>} [opciones.onSubmit] Callback al validar con éxito`

#### `function crearControladorAuth(opciones = {})`

const datos = {}; campos.forEach((field) => { const input = formEl.querySelector(`#${formId}-${field.name}`); if (!validarCampo(field, formEl)) { todoValido = false; } if (input) { datos[field.name] = field.type === 'checkbox' ? Boolean(input.checked) : String(input.value ?? '').trim(); } }); if (todoValido) { await onSubmit(datos); } }; formEl.addEventListener('click', onClick); formEl.addEventListener('submit', onSubmitForm); return () => { formEl.removeEventListener('click', onClick); formEl.removeEventListener('submit', onSubmitForm); }; } function montarEn(contenedor) { if (!contenedor) return () => {}; contenedor.innerHTML = render(); return hydrate(contenedor); } return { id: formId, render, hydrate, montarEn, validarCampo }; } /** 🔐 Controlador Reactivo de Autenticación con Render Condicional (Login / Registro / Logout). Permite montar en cualquier contenedor un flujo completo que cambia dinámicamente entre: 1) Vista de Sesión Iniciada (Perfil + Botón Cerrar Sesión) 2) Formulario Re-usable de Login o Registro (con aceptación obligatoria de Términos)
- `@param {Object} [opciones={}]`
- `@param {string} [opciones.nombreEstado='auth:flujo_global'] Nombre del Signal compartido`
- `@param {boolean} [opciones.persistirLocal=true] Guardar sesión en localStorage`

### 📦 Módulo `src/utils/consentimiento.js`

#### `function crearGestorConsentimiento(opciones = {})`

🍪 Gestor Reactivo y Auto-Administrable de Términos y Condiciones, Cookies, Analíticas y Guía en la Nube - Garantiza privacidad por diseño: bloquea cualquier evento de analítica mientras el usuario no haya aceptado explícitamente Términos y Cookies de Analítica. - Es 100% Auto-Administrable: el administrador (o usuario con control granular) puede editar en caliente el texto de Términos y Condiciones, las reglas de cada categoría, la URL de la Guía en la Nube y exportar/importar el snapshot JSON para sincronizarlo con el File System o repositorio Git. / import { crearEstadoCompartido } from '../core/signals.js'; /** Crea o recupera un controlador compartido y auto-administrable de Consentimiento.
- `@param {Object} [opciones={}]`
- `@param {string} [opciones.nombreEstado='sistema:consentimiento_cookies']`
- `@param {boolean} [opciones.persistirLocal=true]`
- `@param {string} [opciones.versionTerminos='2026-11-22']`
- `@param {string} [opciones.textoTerminos]`
- `@param {string} [opciones.urlGuiaNube]`

### 📦 Módulo `src/utils/cliSimulator.js`

#### `function simularComandoCliMita(comandoRaw)`

🛠️ Generador y Doctor CLI de Mita-DOM (Isomórfico: funciona en Node CLI `bin/mita.js` y en el Browser Sandbox) Inspirado en lo mejor de: - Angular CLI (`ng g c`, `ng g s` con generación automática de `.test.js` y estructura limpia) - Vue / Vite CLI (separación `.html`, `.css` con `@scope` y `.js`) - SolidJS / React (signals granulares, stores desacoplados y páginas SSR/SSG/Hybrid) - Rust Cargo (`mita doctor` / `cargo check` contra fugas de memoria y anti-patrones) / function aKebabCase(texto) { return String(texto || 'mi-elemento') .trim() .replace(/([a-z0-9])([A-Z])/g, '$1-$2') .replace(/[^a-zA-Z0-9-]+/g, '-') .replace(/^-+|-+$/g, '') .toLowerCase(); } function aPascalCase(texto) { return aKebabCase(texto) .split('-') .filter(Boolean) .map((p) => p.charAt(0).toUpperCase() + p.slice(1)) .join(''); } /** Genera en memoria los archivos para un componente, store, página universal o diagnóstico `doctor`.
- `@param {string} comandoRaw Ejemplo: `'mita g c TarjetaOferta'`, `'mita g s empleos'`, `'mita g p Menu --hybrid'`, `'mita doctor'``

#### `class $`

Símbolo público exportado por el núcleo de MitaDOM.

#### `const estado$`

Símbolo público exportado por el núcleo de MitaDOM.

#### `function leer$`

Símbolo público exportado por el núcleo de MitaDOM.

#### `function actualizar$`

Símbolo público exportado por el núcleo de MitaDOM.

#### `function auditarHistorial$`

Símbolo público exportado por el núcleo de MitaDOM.

### 📦 Módulo `src/utils/crudCategorias.js`

#### `function crearControladorCrudCategorias(opciones = {})`

🗂️ Controlador CRUD Multi-Categoría + Control Granular de Estrategias de Render por Vista + Gamificación de Lectura, Resaltado de Texto y Analíticas de Precisión. Diseñado con sintaxis verbosa y auto-explicativa en español y protección de memoria tipo Rust. / import { crearEstadoReactivoInmutable, leerEstadoInmutable, mutarEstadoConHistorial, obtenerHistorialDeMutaciones } from '../core/rustGuard.js'; import { filtrarColeccion } from './chatGuard.js'; import { renderizarVistaUniversal } from '../core/ssr.js'; /** 1. 📦 CRUD Completo Multi-Categoría con Filtración, Búsqueda y Auditoría Ideal para administrar Empleos, Productos, Cursos, Documentos o Servicios con un solo motor.
- `@param {Object} [opciones={}]`
- `@param {string} [opciones.nombreEstado='crud:catalogo_multicategoria']`
- `@param {boolean} [opciones.persistirEnLocalStorage=true]`
- `@param {Array<Record<string, any>>} [opciones.registrosIniciales]`
- `@param {string[]} [opciones.categoriasPermitidas]`

#### `function crearControladorEstrategiaPorVista(opciones = {})`

Actualiza los criterios de búsqueda y filtrado en vivo. / aplicarFiltrosDeBusqueda(nuevosFiltros = {}) { return mutarEstadoConHistorial( estado, (actual) => ({ ...actual, filtrosActivos: { ...actual.filtrosActivos, ...nuevosFiltros } }), `Filtro actualizado: busqueda="${nuevosFiltros.textoBusqueda ?? ''}", categoria="${nuevosFiltros.categoriaActiva ?? ''}"` ); }, /** Devuelve la lista de registros filtrada según los filtros activos o los pasados por argumento. / listarRegistrosFiltrados(filtrosOverride) { const actual = leerEstadoInmutable(estado); const f = { ...actual.filtrosActivos, ...(filtrosOverride || {}) }; let lista = filtrarColeccion(actual.registros || [], { busqueda: f.textoBusqueda || '', categoria: f.categoriaActiva || 'todos', campoCategoria: 'categoria', camposTexto: ['titulo', 'descripcion', 'categoria'] }); if (f.soloDestacados) { lista = lista.filter((item) => Boolean(item.destacado)); } return lista; }, /** ➕ CREATE: Crea un nuevo registro validando título y categoría. / crearNuevoRegistro(datos) { const titulo = String(datos?.titulo || '').trim(); const categoria = String(datos?.categoria || 'empleos').trim().toLowerCase(); if (!titulo) { throw new Error('[CRUD] El título del registro es obligatorio.'); } const nuevo = { id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, titulo, categoria, descripcion: String(datos?.descripcion || 'Sin descripción adicional.').trim(), valorNumerico: Number(datos?.valorNumerico) || 0, destacado: Boolean(datos?.destacado), creadoEn: new Date().toISOString().split('T')[0] }; mutarEstadoConHistorial( estado, (actual) => ({ ...actual, registros: [nuevo, ...(actual.registros || [])] }), `Creado registro "${nuevo.titulo}" en categoría "${nuevo.categoria}"` ); return nuevo; }, /** ✏️ UPDATE: Actualiza un registro existente por su ID. / actualizarRegistroExistente(idRegistro, cambiosParciales, motivo = 'Actualización de registro CRUD') { let actualizado = null; mutarEstadoConHistorial( estado, (actual) => ({ ...actual, registros: (actual.registros || []).map((item) => { if (item.id !== idRegistro) return item; actualizado = { ...item, ...cambiosParciales, id: item.id }; return actualizado; }) }), motivo ); return actualizado; }, /** ⭐ Alterna la marca `destacado` de un registro. / alternarDestacadoPorId(idRegistro) { const actual = leerEstadoInmutable(estado); const encontrado = (actual.registros || []).find((r) => r.id === idRegistro); if (!encontrado) return null; return this.actualizarRegistroExistente( idRegistro, { destacado: !encontrado.destacado }, `Alternado destacado en "${encontrado.titulo}"` ); }, /** 🗑️ DELETE: Elimina un registro por ID. / eliminarRegistroPorId(idRegistro, motivo = 'Eliminación de registro CRUD') { const antes = (leerEstadoInmutable(estado).registros || []).length; mutarEstadoConHistorial( estado, (actual) => ({ ...actual, registros: (actual.registros || []).filter((item) => item.id !== idRegistro) }), motivo ); const despues = (leerEstadoInmutable(estado).registros || []).length; return despues < antes; }, /** 📊 Devuelve métricas agrupadas por categoría e historial de mutaciones. / obtenerEstadisticasPorCategoria() { const actual = leerEstadoInmutable(estado); const registros = actual.registros || []; /** @type {Record<string, number>} */ const conteoPorCategoria = {}; (actual.categorias || []).forEach((cat) => { conteoPorCategoria[cat] = 0; }); registros.forEach((r) => { conteoPorCategoria[r.categoria] = (conteoPorCategoria[r.categoria] || 0) + 1; }); return { totalRegistros: registros.length, totalDestacados: registros.filter((r) => r.destacado).length, conteoPorCategoria, historialCambios: obtenerHistorialDeMutaciones(estado) }; }, reiniciarDatosDeFabrica() { return mutarEstadoConHistorial( estado, (actual) => ({ ...actual, registros: registrosPorDefecto, filtrosActivos: { textoBusqueda: '', categoriaActiva: 'todos', soloDestacados: false } }), 'Reinicio a datos de fábrica del catálogo CRUD' ); } }; } /** 2. 🌐 Controlador Granular de Estrategia de Render por Vista (`Hybrid`, `SSR`, `SSG`, `CSR`) Permite configurar, cambiar en caliente o activar/desactivar el modo de renderizado de cada ruta específica sin tocar el resto de la aplicación.
- `@param {{ textoBusqueda?: string, categoriaActiva?: string, soloDestacados?: boolean }} nuevosFiltros`
- `@param {{ textoBusqueda?: string, categoriaActiva?: string, soloDestacados?: boolean }} [filtrosOverride]`
- `@param {{ titulo: string, categoria: string, descripcion?: string, valorNumerico?: number, destacado?: boolean }} datos`
- `@param {string} idRegistro`
- `@param {Record<string, any>} cambiosParciales`
- `@param {string} [motivo='Actualización de registro CRUD']`
- `@param {string} idRegistro`
- `@param {string} idRegistro`
- `@param {string} [motivo='Eliminación de registro CRUD']`
- `@param {Object} [opciones={}]`
- `@param {string} [opciones.nombreEstado='router:estrategias_por_vista']`

#### `function crearGestorGamificacionLectura(opciones = {})`

Cambia en caliente la estrategia (`'hybrid' | 'ssr' | 'ssg' | 'csr'`) de una vista específica. / cambiarModoDeVistaEnCaliente(ruta, nuevoModo) { const actual = this.obtenerConfiguracionDeVista(ruta); return mutarEstadoConHistorial( estado, (mapa) => ({ ...mapa, [ruta]: { ...actual, modo: nuevoModo } }), `Vista "${ruta}" cambiada a estrategia ${String(nuevoModo).toUpperCase()}` ); }, /** Activa o desactiva una vista específica de forma granular. / activarODesactivarVista(ruta, habilitada) { const actual = this.obtenerConfiguracionDeVista(ruta); return mutarEstadoConHistorial( estado, (mapa) => ({ ...mapa, [ruta]: { ...actual, habilitada: Boolean(habilitada) } }), `Vista "${ruta}" ${habilitada ? 'ACTIVADA' : 'DESACTIVADA'} por control granular` ); }, listarMapaDeVistas() { return Object.values(leerEstadoInmutable(estado)); }, /** Renderiza una clase de vista aplicando automáticamente la estrategia y el estado ON/OFF configurados para su ruta. / async renderizarVistaConConfiguracion(ruta, VistaOClase) { const cfg = this.obtenerConfiguracionDeVista(ruta); if (!cfg.habilitada) { return { ruta, habilitada: false, modoAplicado: 'disabled', head: `<title>Vista ${ruta} Desactivada</title>`, body: `<section data-vista-estado="desactivada">🔴 La vista <strong>${ruta}</strong> (${cfg.titulo}) está desactivada temporalmente por control granular.</section>` }; } const resultado = await renderizarVistaUniversal(VistaOClase, { url: ruta, modo: cfg.modo, contexto: { modo: cfg.modo, ruta } }); return { ruta, habilitada: true, ...resultado }; } }; } /** 3. 🏆 Gestor de Gamificación de Lectura, Resaltado de Texto y Analíticas de Precisión
- `@param {string} ruta`
- `@param {'hybrid' | 'ssr' | 'ssg' | 'csr'} nuevoModo`
- `@param {string} ruta`
- `@param {boolean} habilitada`
- `@param {string} ruta`
- `@param {any} VistaOClase`
- `@param {Object} [opciones={}]`
- `@param {string} [opciones.nombreEstado='docs:gamificacion_y_resaltados']`

### 📦 Módulo `src/utils/uiModeracionYComunidad.js`

#### `function obtenerHuellaDispositivoLocal()`

🛡️ Librería UI (Paginación + Data Fetching con Caché), Perfiles sin Cuenta con Huella Local de Dispositivo (Cooldown de 15 días), Chat/Grupos con Ventana Obligatoria de Aceptación (Cooldown 3s) y Moderación Integral de Anuncios (Filtro "DC" mayúsculas/minúsculas/ambos, CRUD obligatorio de Categorías, Badge "No Verificado", Descargo Legal, Reportes con Pruebas y Borrado por Usuario/Empresa). / import { crearEstadoReactivoInmutable, leerEstadoInmutable, mutarEstadoConHistorial } from '../core/rustGuard.js'; /** Genera o recupera una huella determinista del dispositivo en la DB Local (`localStorage`) para reconocer si es el mismo cliente aunque intente cambiar su nombre público.

#### `function crearControladorPaginacion(opciones = {})`

📄 Controlador Reactivo de Paginación UI (Ahorra nodos en el DOM y memoria RAM).
- `@param {Object} [opciones={}]`
- `@param {string} [opciones.nombreEstado='ui:paginacion_activa']`
- `@param {number} [opciones.tamanoPaginaInicial=4]`

#### `function crearFetcherConCacheYEstados(opciones = {})`

📡 Controlador de Data Fetching con Caché TTL y Ahorro de Recursos. Evita golpear la base de datos o red innecesariamente si los datos siguen frescos en caché.
- `@param {Object} [opciones={}]`
- `@param {string} [opciones.nombreEstado='ui:data_fetcher']`
- `@param {number} [opciones.tiempoCacheMs=60000]`

#### `function crearGestorPerfilesYDispositivo(opciones = {})`

const cacheMemoria = new Map(); const estado = crearEstadoReactivoInmutable( opciones.nombreEstado || 'ui:data_fetcher', { cargando: false, datos: null, error: null, desdeCache: false, claveActual: '', ahorroRequestsCount: 0 }, { compartidoEntreComponentes: false, descripcionDelEstado: 'Estado reactivo de carga asíncrona con caché en memoria para ahorrar red y BD.' } ); return { estado, /** Ejecuta el cargador asíncrono o devuelve instantáneamente desde la caché si no expiró el TTL. / async cargarRecurso(claveRecurso, cargadorAsyncFn, cfg = {}) { const ahora = Date.now(); const enCache = cacheMemoria.get(claveRecurso); if (!cfg.forzarRecarga && enCache && ahora - enCache.timestamp < tiempoCacheMs) { const ahorro = (leerEstadoInmutable(estado).ahorroRequestsCount || 0) + 1; mutarEstadoConHistorial( estado, { cargando: false, datos: enCache.datos, error: null, desdeCache: true, claveActual: claveRecurso, ahorroRequestsCount: ahorro }, `Respuesta instantánea desde caché para "${claveRecurso}" (Ahorro #${ahorro})` ); return { ok: true, datos: enCache.datos, desdeCache: true }; } mutarEstadoConHistorial( estado, { cargando: true, error: null, desdeCache: false, claveActual: claveRecurso }, `Iniciando petición para "${claveRecurso}"` ); try { const datos = await cargadorAsyncFn(); cacheMemoria.set(claveRecurso, { datos, timestamp: Date.now() }); mutarEstadoConHistorial( estado, { cargando: false, datos, error: null, desdeCache: false, claveActual: claveRecurso }, `Datos recibidos y cacheados para "${claveRecurso}"` ); return { ok: true, datos, desdeCache: false }; } catch (err) { const msg = err instanceof Error ? err.message : String(err); mutarEstadoConHistorial( estado, { cargando: false, error: msg, desdeCache: false, claveActual: claveRecurso }, `Error cargando "${claveRecurso}": ${msg}` ); return { ok: false, error: msg, desdeCache: false }; } }, invalidarCache(claveEspecifica) { if (claveEspecifica) { cacheMemoria.delete(claveEspecifica); } else { cacheMemoria.clear(); } } }; } // ============================================================================ // 2. PERFILES SIN CUENTA (GUEST), HUELLA DE DISPOSITIVO LOCAL Y COOLDOWN 15 DÍAS // ============================================================================ /** 👤 Gestor de Perfiles Rápidos (sin obligar a registrar cuenta), Detección de Dispositivo en DB Local, Regla de 15 Días para cambio de nombre, Bloqueo por Dispositivo/Usuario y Exportación JSON.
- `@param {string} claveRecurso`
- `@param {() => Promise<any>} cargadorAsyncFn`
- `@param {{ forzarRecarga?: boolean }} [cfg={}]`
- `@param {Object} [opciones={}]`
- `@param {string} [opciones.nombreEstado='comunidad:perfiles_y_dispositivos']`

#### `function crearControladorSalaChatYGrupos(opciones = {})`

Configura opciones de Admin: activar/desactivar la regla de no cambiar nombre en 15 días o activar/desactivar registros de cuenta. / configurarReglasAdminPerfiles(nuevaCfg = {}) { return mutarEstadoConHistorial( estado, (actual) => ({ ...actual, configAdmin: { ...actual.configAdmin, ...nuevaCfg } }), 'Reglas de perfiles actualizadas por Administración' ); }, /** Crea o actualiza el perfil rápido del usuario (sin registrar cuenta) validando: 1) Si su huella de dispositivo está bloqueada. 2) Si intenta cambiar el nombre antes de que pasen los 15 días configurados por Admin. / crearOActualizarPerfilSinCuenta(datosPerfil) { const actual = leerEstadoInmutable(estado); const nuevoNombre = String(datosPerfil?.nombre || '').trim(); if (!nuevoNombre || nuevoNombre.length < 2) { return { ok: false, motivo: 'El nombre debe tener al menos 2 caracteres.' }; } const ahora = datosPerfil?.ahoraTs ?? Date.now(); const perfilPrevio = actual.perfilActivo; const cambiaNombre = perfilPrevio.ultimoCambioNombreTs > 0 && perfilPrevio.nombre.toLowerCase() !== nuevoNombre.toLowerCase(); if (cambiaNombre && actual.configAdmin.restringirCambioNombreQuinceDias) { const diasCfg = actual.configAdmin.diasBloqueoCambioNombre || 15; const msRequeridos = diasCfg * 24 * 60 * 60 * 1000 || QUINCE_DIAS_MS; const transcurrido = ahora - perfilPrevio.ultimoCambioNombreTs; if (transcurrido < msRequeridos) { const diasRestantes = Math.ceil((msRequeridos - transcurrido) / (24 * 60 * 60 * 1000)); return { ok: false, motivo: `⏳ Restricción activa: no puedes cambiar tu nombre durante ${diasCfg} días (faltan ${diasRestantes} días). Mismo dispositivo detectado (${huellaActual}).` }; } } const actualizado = { ...perfilPrevio, huellaDispositivoId: huellaActual, nombre: nuevoNombre, empresa: String(datosPerfil?.empresa ?? perfilPrevio.empresa).trim(), bio: String(datosPerfil?.bio ?? perfilPrevio.bio).trim(), colorTema: String(datosPerfil?.colorTema ?? perfilPrevio.colorTema), verificado: false, badge: '⚠️ No Verificado', ultimoCambioNombreTs: perfilPrevio.ultimoCambioNombreTs === 0 || cambiaNombre ? ahora : perfilPrevio.ultimoCambioNombreTs }; mutarEstadoConHistorial( estado, (st) => { const otros = (st.perfilesRegistrados || []).filter( (p) => p.huellaDispositivoId !== huellaActual ); return { ...st, perfilActivo: actualizado, perfilesRegistrados: [actualizado, ...otros] }; }, `Perfil sin cuenta actualizado para "${actualizado.nombre}" (Dispositivo: ${huellaActual})` ); return { ok: true, perfil: actualizado }; }, /** 🚫 Permite al Admin prohibir que un usuario, nombre o dispositivo específico publique anuncios o use el chat. / prohibirUsuarioODispositivo(criterioIdNombreOHuella, motivo = 'Incumplimiento de normas') { const limpio = String(criterioIdNombreOHuella || '').trim(); if (!limpio) return false; mutarEstadoConHistorial( estado, (st) => ({ ...st, listaNegraDispositivosYUsuarios: [ { criterio: limpio, motivo, fecha: new Date().toISOString().split('T')[0] }, ...(st.listaNegraDispositivosYUsuarios || []).filter( (item) => item.criterio.toLowerCase() !== limpio.toLowerCase() ) ] }), `Bloqueado usuario/dispositivo "${limpio}": ${motivo}` ); return true; }, desbloquearUsuarioODispositivo(criterioIdNombreOHuella) { const limpio = String(criterioIdNombreOHuella || '').trim().toLowerCase(); mutarEstadoConHistorial( estado, (st) => ({ ...st, listaNegraDispositivosYUsuarios: (st.listaNegraDispositivosYUsuarios || []).filter( (item) => item.criterio.toLowerCase() !== limpio ) }), `Desbloqueado usuario/dispositivo "${criterioIdNombreOHuella}"` ); }, /** Verifica si el perfil actual o un nombre/huella específico está bloqueado en la DB Local. / estaBloqueadoParaPublicar(sujeto) { const st = leerEstadoInmutable(estado); const target = sujeto || st.perfilActivo; const listaNegra = st.listaNegraDispositivosYUsuarios || []; const coincidencia = listaNegra.find((b) => { const c = b.criterio.toLowerCase(); return ( c === String(target.huellaDispositivoId || '').toLowerCase() || c === String(target.nombre || '').toLowerCase() || c === String(target.idUsuario || '').toLowerCase() ); }); return { bloqueado: Boolean(coincidencia), motivo: coincidencia ? coincidencia.motivo : null }; }, /** 📤 Exporta todos los datos del perfil y huella del dispositivo para backup o sincronización. / exportarDatosUsuarioJson() { const st = leerEstadoInmutable(estado); return { exportadoEn: new Date().toISOString(), huellaDispositivoId: huellaActual, perfilActivo: st.perfilActivo, configAdmin: st.configAdmin }; }, importarDatosUsuarioJson(payload) { if (!payload || !payload.perfilActivo) return false; mutarEstadoConHistorial( estado, (st) => ({ ...st, perfilActivo: { ...st.perfilActivo, ...payload.perfilActivo, huellaDispositivoId: huellaActual } }), 'Datos de perfil sincronizados desde JSON externo' ); return true; } }; } // ============================================================================ // 3. CHAT Y GRUPOS CON VENTANA OBLIGATORIA DE ACEPTACIÓN Y COOLDOWN CONFIGURABLE (3s) // ============================================================================ /** 💬 Controlador de Salas de Chat y Grupos con: - Ventana modal obligatoria de aceptación de reglas antes de dejar entrar al chat o grupo. - Cooldown configurable entre mensajes (por defecto `3 segundos` = `3000ms`). - Permisos granulares por grupo y usuario.
- `@param {{ aceptarRegistrosDeCuenta?: boolean, restringirCambioNombreQuinceDias?: boolean, diasBloqueoCambioNombre?: number }} nuevaCfg`
- `@param {{ nombre: string, empresa?: string, bio?: string, colorTema?: string, ahoraTs?: number }} datosPerfil`
- `@param {string} criterioIdNombreOHuella`
- `@param {string} [motivo='Incumplimiento de normas']`
- `@param {{ nombre?: string, huellaDispositivoId?: string, idUsuario?: string }} [sujeto]`
- `@param {Object} [opciones={}]`
- `@param {string} [opciones.nombreEstado='comunidad:chat_grupos_gatekeeper']`
- `@param {number} [opciones.intervaloSegundosInicial=3]`

#### `function crearSistemaModeracionAnuncios(opciones = {})`

🪟 Intenta entrar a una sala de chat o grupo. Si el usuario aún no aceptó las condiciones de esa sala, NO lo deja entrar y abre la ventana de aceptación. / intentarEntrarASalaOChat(salaId) { const st = leerEstadoInmutable(estado); if (!st.chatGlobalHabilitado) { return { accesoPermitido: false, requiereAceptarVentana: false, motivo: '🔴 El chat está desactivado globalmente por Administración.' }; } const yaAcepto = Boolean(st.salasAceptadasPorUsuario?.[salaId]); if (!yaAcepto) { mutarEstadoConHistorial( estado, { mostrarVentanaAceptacionParaSala: salaId, salaActivaId: null }, `Ventana de aceptación requerida antes de entrar a "${salaId}"` ); return { accesoPermitido: false, requiereAceptarVentana: true, salaPendiente: salaId, textoReglas: st.textoReglasEntradaChat, motivo: '🪟 Debes aceptar las reglas en la ventana emergente para entrar a este chat o grupo.' }; } mutarEstadoConHistorial( estado, { salaActivaId: salaId, mostrarVentanaAceptacionParaSala: null }, `Acceso concedido a sala "${salaId}"` ); return { accesoPermitido: true, requiereAceptarVentana: false, salaActivaId: salaId }; }, /** ✅ Cuando el usuario pulsa "Aceptar y Entrar" en la ventana emergente del chat/grupo. / aceptarReglasYEntrarASala(salaId) { const clave = String(salaId || 'sala-general'); mutarEstadoConHistorial( estado, (st) => ({ ...st, salasAceptadasPorUsuario: { ...(st.salasAceptadasPorUsuario || {}), [clave]: true }, salaActivaId: clave, mostrarVentanaAceptacionParaSala: null }), `Usuario aceptó reglas y entró al grupo "${clave}"` ); return { accesoPermitido: true, salaActivaId: clave }; }, /** ❌ Cuando el usuario rechaza la ventana de condiciones: se cierra la ventana y NO entra al chat. / rechazarReglasDeEntrada() { mutarEstadoConHistorial( estado, { mostrarVentanaAceptacionParaSala: null, salaActivaId: null }, 'Usuario rechazó las reglas: entrada al chat/grupo bloqueada' ); return { accesoPermitido: false, motivo: 'No aceptaste las condiciones del grupo.' }; }, /** ⏱️ Configura cada cuántos segundos se permite enviar un mensaje (por defecto 3 segundos). / configurarIntervaloMensajesSegundos(segundos) { const seg = Math.max(0.5, Number(segundos) || 3); return mutarEstadoConHistorial( estado, { intervaloEnvioSegundos: seg }, `Cooldown de chat configurado a ${seg} segundos` ); }, activarODesactivarChatGlobal(habilitado) { return mutarEstadoConHistorial( estado, { chatGlobalHabilitado: Boolean(habilitado) }, `Chat global ${habilitado ? 'ACTIVADO' : 'DESACTIVADO'} por Admin` ); }, /** Envía un mensaje a la sala activa verificando: 1) Que haya aceptado la ventana de reglas de esa sala. 2) Que se cumpla el tiempo configurado (por defecto 3 segundos) desde su último mensaje. / enviarMensajeConCooldown(payload) { const st = leerEstadoInmutable(estado); const salaId = payload.salaId || st.salaActivaId; if (!st.chatGlobalHabilitado) { return { ok: false, motivo: 'El chat está desactivado por Administración.' }; } if (!salaId || !st.salasAceptadasPorUsuario?.[salaId]) { return { ok: false, motivo: '🚫 Acceso denegado: primero debes aceptar la ventana de reglas para entrar al chat.' }; } const texto = String(payload.texto || '').trim(); if (!texto) { return { ok: false, motivo: 'El mensaje no puede estar vacío.' }; } const autor = String(payload.autor || 'Invitado').trim(); const ahora = payload.ahoraTs ?? Date.now(); const ultimoTs = st.ultimoMensajePorUsuarioTs?.[autor] || 0; const cooldownMs = (st.intervaloEnvioSegundos || 3) * 1000; if (ultimoTs > 0 && ahora - ultimoTs < cooldownMs) { const restanteSeg = ((cooldownMs - (ahora - ultimoTs)) / 1000).toFixed(1); return { ok: false, esperaSegundos: Number(restanteSeg), motivo: `⏱️ Espera ${restanteSeg}s antes de enviar otro mensaje (intervalo configurado: ${st.intervaloEnvioSegundos}s).` }; } const nuevoMsg = { id: `msg-${ahora}-${Math.random().toString(36).slice(2, 5)}`, salaId, autor, badge: payload.badge || '⚠️ No Verificado', texto, hora: new Date(ahora).toTimeString().slice(0, 5) }; mutarEstadoConHistorial( estado, (actual) => ({ ...actual, ultimoMensajePorUsuarioTs: { ...(actual.ultimoMensajePorUsuarioTs || {}), [autor]: ahora }, mensajes: [nuevoMsg, ...(actual.mensajes || [])] }), `Mensaje enviado por "${autor}" en "${salaId}"` ); return { ok: true, mensaje: nuevoMsg }; } }; } // ============================================================================ // 4. MODERACIÓN INTEGRAL DE ANUNCIOS ("DC", CRUD CATEGORÍAS, DESCARGO LEGAL, REPORTES, PURGA ADMIN) // ============================================================================ /** 📢 Sistema Integral de Anuncios con: - Descargo de Responsabilidad Legal editable y visible. - Badge `"⚠️ No Verificado"` por defecto en cada autor. - CRUD obligatorio de Categorías (ningún anuncio se publica sin categoría válida). - Bloqueo de palabras prohibidas como `"DC"` configurable en `'minusculas'`, `'mayusculas'` o `'ambos'`. - Fecha, hora y duración predeterminada configurable. - Cola de revisión previa activable/desactivable (`requiereRevisionPrevia`) con botones `Permitir`, `Permitir Todos`, `Eliminar`. - Reportes de anuncios con justificación + pruebas/evidencia y notificación inmediata al Admin. - Botones exclusivos para Admin: borrar todo o borrar todas las publicaciones de un usuario o empresa específica.
- `@param {string} salaId`
- `@param {string} salaId`
- `@param {number} segundos`
- `@param {{ salaId: string, autor: string, texto: string, badge?: string, ahoraTs?: number }} payload`
- `@param {Object} [opciones={}]`
- `@param {string} [opciones.nombreEstado='comunidad:moderacion_anuncios']`
- `@param {any} [opciones.gestorPerfiles]`

### 📦 Módulo `src/utils/fullstackYDevtools.js`

#### `function crearControladorFetchingPorModo(opciones)`

🚀 Mita-DOM Full-Stack, UI Grid Kit, DevTools Advisor (`Mita Doc`), SemVer Advisor, Data Fetching por Modo (`al-hacer-click` vs `automatico-al-entrar`), Server Actions (Express + ORM), Paletas de Colores + Animaciones de Navegación y Bitácora Combinada por Hora. / import { crearEstadoReactivoInmutable, leerEstadoInmutable, mutarEstadoConHistorial } from '../core/rustGuard.js'; import { listarEstadosCompartidos } from '../core/signals.js'; // ============================================================================ // 1. DATA FETCHING GRANULAR: AL HACER CLIC VS AUTOMÁTICO AL ENTRAR A LA VISTA // ============================================================================ /** 📡 Controlador Pedagógico de Data Fetching con 2 Modos de Disparo: - `'al-hacer-click'` (Lazy / Bajo Demanda): NO hace ninguna petición al montar la vista; solo descarga los datos cuando el usuario pulsa explícitamente un botón. - `'automatico-al-entrar'` (Eager / Al Montar Vista): inicia la carga automáticamente al entrar a la vista y reutiliza la caché TTL en visitas posteriores.
- `@param {Object} opciones`
- `@param {string} [opciones.nombreEstado='fetch:controlador_modo']`
- `@param {'al-hacer-click' | 'automatico-al-entrar'} [opciones.modoDisparo='al-hacer-click']`
- `@param {number} [opciones.tiempoCacheMs=60000]`
- `@param {() => Promise<any>} opciones.cargadorAsyncFn`

#### `function crearAccionServidorIsomorfica(
  nombreAccion,
  controladorServidorORMFn,
  opciones = {}
)`

Se llama en `onInit()` o `render()` al entrar a la vista. Solo dispara la petición si el modo es `'automatico-al-entrar'`. / async alEntrarALaVista() { const st = leerEstadoInmutable(estado); if (st.modoDisparo === 'automatico-al-entrar') { return ejecutarPeticion(false); } return { ok: true, omitidoPorModoClick: true, mensaje: 'Petición pospuesta hasta que el usuario haga clic en el botón.' }; }, /** Se llama cuando el usuario hace clic explícitamente en el botón de carga/recarga. / async alHacerClickEnBoton(forzarRed = false) { return ejecutarPeticion(forzarRed); }, /** Cambia entre `'al-hacer-click'` y `'automatico-al-entrar'` en tiempo real. / cambiarModoDisparo(nuevoModo) { const esAuto = nuevoModo === 'automatico-al-entrar'; return mutarEstadoConHistorial( estado, { modoDisparo: esAuto ? 'automatico-al-entrar' : 'al-hacer-click', explicacionModo: esAuto ? '⚡ Automático al entrar: descarga los datos apenas se monta la vista y los guarda en caché.' : '👆 Bajo demanda (Al hacer clic): 0 peticiones al entrar; solo consulta al servidor cuando el usuario hace clic.' }, `Modo de Data Fetching cambiado a "${nuevoModo}"` ); } }; } // ============================================================================ // 2. MITA SERVER ACTIONS (NODE.JS + EXPRESS + ORM SEQUELIZE/PRISMA) // ============================================================================ /** 🖥️ Crea una Acción de Servidor Isomórfica (Inspirada en Server Actions para Node.js + Express + ORM). Permite ejecutar validaciones y mutaciones de base de datos (ORM) con estado reactivo de envío, medición de latencia y sincronización automática de Signals en el cliente.
- `@param {boolean} [forzarRed=false]`
- `@param {'al-hacer-click' | 'automatico-al-entrar'} nuevoModo`
- `@param {string} nombreAccion Ejemplo: `'empleos/crearAnuncioORM'``
- `@param {(payload: Record<string, any>) => Promise<any> | any} controladorServidorORMFn`
- `@param {{ validarPayload?: (payload: Record<string, any>) => string | null, signalsAInvalidar?: Array<any> }} [opciones={}]`

#### `function ejecutarConsejeroMitaDoc(contexto = {})`

Ejecuta la Server Action validando primero el payload y sincronizando los Signals dependientes. / async ejecutar(payload = {}) { const inicio = typeof performance !== 'undefined' ? performance.now() : Date.now(); if (typeof opciones.validarPayload === 'function') { const errorValidacion = opciones.validarPayload(payload); if (errorValidacion) { mutarEstadoConHistorial( estado, { ejecutando: false, ultimoError: errorValidacion }, `Server Action "${nombreAccion}" rechazada en validación previa: ${errorValidacion}` ); return { ok: false, error: errorValidacion }; } } mutarEstadoConHistorial( estado, { ejecutando: true, ultimoError: null }, `Ejecutando Server Action "${nombreAccion}" hacia Express + ORM` ); try { const respuesta = await controladorServidorORMFn(payload); const fin = typeof performance !== 'undefined' ? performance.now() : Date.now(); const latenciaMs = Number((fin - inicio).toFixed(2)); const actual = leerEstadoInmutable(estado); mutarEstadoConHistorial( estado, { ejecutando: false, ultimaRespuesta: respuesta, ultimoError: null, latenciaMs, ejecucionesExitosas: actual.ejecucionesExitosas + 1 }, `Server Action "${nombreAccion}" completada en ${latenciaMs}ms` ); return { ok: true, datos: respuesta, latenciaMs }; } catch (err) { const msg = err instanceof Error ? err.message : String(err); mutarEstadoConHistorial( estado, { ejecutando: false, ultimoError: msg }, `Error en Server Action "${nombreAccion}": ${msg}` ); return { ok: false, error: msg }; } } }; } // ============================================================================ // 3. CONSEJERO INTELIGENTE `MITA DOC ADVISOR` Y CALCULADOR `SEMVER ADVISOR` // ============================================================================ /** 🩺 `Mita Doc Advisor`: Analiza la aplicación en vivo y aconseja al desarrollador qué está usando BIEN y qué debería corregir para mantener 60FPS, cero fugas y HTML5 semántico.
- `@param {Record<string, any>} payload`
- `@param {{ raizDom?: ParentNode | null, latenciaUltimoRenderMs?: number }} [contexto={}]`

#### `function calcularRecomendacionSemVer(criterios = {})`

const aciertos = []; /** @type {string[]} */ const consejosMejora = []; // 1. Verificar Light DOM vs Shadow DOM y Semántica HTML5 if (raiz && typeof raiz.querySelectorAll === 'function') { const semanticos = raiz.querySelectorAll('section, article, header, nav, aside, figure, dialog, output').length; const divs = raiz.querySelectorAll('div').length; if (semanticos >= divs) { aciertos.push( `✅ Excelente HTML5 Semántico: ${semanticos} etiquetas semánticas frente a ${divs} <div>.` ); } else { consejosMejora.push( `⚠️ Se detectaron ${divs} etiquetas <div> frente a ${semanticos} semánticas. Reemplaza <div> contenedores por <section>, <article>, <figure> o <header>.` ); } } else { aciertos.push('✅ Entorno isomórfico Node.js / SSR libre de dependencias de DOM global.'); } // 2. Verificar Presupuesto de 60FPS (16.6ms) if (latencia <= 16.6) { aciertos.push( `✅ Rendimiento 60FPS saludable: último render registrado en ${latencia}ms (límite: 16.6ms).` ); } else { consejosMejora.push( `⚠️ Cuello de botella detectado (${latencia}ms > 16.6ms). Usa crearControladorPaginacion() o renderizarVistaDiferida() (@defer).` ); } // 3. Auditar Estados Compartidos y Suscriptores (Prevención de Memory Leaks) const estadosCompartidos = listarEstadosCompartidos(); const conPosibleFuga = estadosCompartidos.filter((s) => s.suscriptores > 20); if (conPosibleFuga.length === 0) { aciertos.push( `✅ Salud de Signals impecable: ${estadosCompartidos.length} estados compartidos activos con 0 fugas de suscriptores.` ); } else { consejosMejora.push( `⚠️ El estado "${conPosibleFuga[0].nombre}" tiene ${conPosibleFuga[0].suscriptores} suscriptores. Asegúrate de usar crearAmbitoConLimpiezaAutomatica().` ); } const puntajeSalud = Math.max(40, 100 - consejosMejora.length * 15); return { puntajeSalud, estadoGeneral: consejosMejora.length === 0 ? '🟢 Arquitectura Óptima (100% Mita-DOM Best Practices)' : '🟡 Arquitectura Funcional con Oportunidades de Mejora', aciertos, consejosMejora }; } /** 📦 `SemVer Release Advisor`: Ayuda al mantenedor a decidir si puede dejar la versión actual o a qué número exacto debe subir `"version"` en `package.json` según `CONTRIBUTING.md`. versionActual?: string, hayCambiosEnCodigo?: boolean, rompeCompatibilidadAnterior?: boolean, agregaNuevaFuncionalidadOExport?: boolean, corrigeBugODocumentacion?: boolean }} criterios
- `@param {{`

#### `const PALETAS_COLORES_MITA`

Símbolo público exportado por el núcleo de MitaDOM.

#### `function crearGestorTemaYAnimacionNavegacion(opciones = {})`

🎨 Gestor Reactivo de Paletas de Colores CSS3 y Manera/Animación de Navegación del Router.
- `@param {{ nombreEstado?: string }} [opciones={}]`

#### `function crearGestorBitacoraPorHora(opciones = {})`

🕒 Gestor de Changelogs Combinados, Versiones y Copias por Hora (Hourly Snapshots & Checklists) para la sección `/blog` y auditoría de entregas.


---

## 🧠 Para Profundizar y Glosario Esencial

- **Ciclo de Vida Completo (`MitaElement`):** `alCrear()` → `alAntesDeRenderizar()` → `render()` → `alMontar()` → `alCambiarProp()` → `alActualizar()` → Auto-Limpieza + `alDesmontar()`.
- **`sinRastrear(fn)` (`untrack`):** ejecuta lecturas/mutaciones internas sin registrar dependencias en `crearEfecto()`, eliminando bucles infinitos.
- **Light DOM + `@scope`:** 0 Virtual DOM y 0 Shadow DOM; el SEO, la accesibilidad y CSS3 nativo funcionan sin barreras.
- **Agent Repair Guide:** `skills/reactivity-diagnostics/SKILL.md` documenta cada código `[MITA_*]` para humanos y Agentes IA.