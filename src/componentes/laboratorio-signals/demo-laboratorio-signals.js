import {
  crearEstadoLocal,
  crearEstadoCompartido,
  obtenerEstadoCompartido,
  listarEstadosCompartidos,
  crearEfecto,
  sinRastrear,
  renderCondicional,
  vincularTexto,
  crearControlSpam,
  filtrarColeccion,
  MitaMeta,
  renderizarVistaUniversal,
  crearFormularioReusable,
  crearControladorAuth,
  crearGestorConsentimiento,
  crearEstadoReactivoInmutable,
  leerEstadoInmutable,
  mutarEstadoConHistorial,
  obtenerHistorialDeMutaciones,
  crearAmbitoConLimpiezaAutomatica,
  ejecutarSuiteVerificacionMita,
  simularComandoCliMita,
  crearControladorCrudCategorias,
  crearControladorEstrategiaPorVista,
  crearControladorPaginacion,
  crearFetcherConCacheYEstados,
  crearGestorPerfilesYDispositivo,
  crearControladorSalaChatYGrupos,
  crearSistemaModeracionAnuncios,
  obtenerUrlImagenCientifico,
  CIENTIFICOS_DEMO,
  pasarPropsAElemento,
  leerPropsDeElemento,
  renderizarVistaDiferida,
  crearFormularioReactivoConSignals,
  crearControladorFetchingPorModo,
  crearAccionServidorIsomorfica,
  ejecutarConsejeroMitaDoc,
  calcularRecomendacionSemVer,
  crearMemoAsincrono,
  crearEstadoVinculado,
  crearEstadoOptimistaConRollback,
  crearFuncionServidorEnVivo,
  definirEstrategiaRenderRuta,
  cambiarEstrategiaRender,
  emitirDiagnosticoAgente
} from 'mita-dom';
import { MitaElement } from '../../utils/MitaElement.js';
import { estadoLeccionActiva } from '../../store/labStore.js';
import { estadoSidebar } from '../../store/layoutStore.js';
import { gestorGamificacionDocs } from '../../store/docsStore.js';
import '../ui/mita-code-editor.js';
import '../ui/mita-dialog.js';
import htmlTemplate from './demo-laboratorio-signals.html?raw';
import './demo-laboratorio-signals.css';

function escaparHtml(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================================================
// 1. ESTADOS COMPARTIDOS DEL LABORATORIO (Persistidos en localStorage)
// ============================================================================
export const labConfigEmpleos = crearEstadoCompartido(
  'lab:empleos_config',
  {
    habilitado: true,
    requiereLogin: false,
    terminosCondiciones:
      'Confirmo que el anuncio es real, respeta las normas laborales vigentes en Bolivia y no exige pagos previos.',
    reglasUso:
      'Por defecto cualquier persona puede publicar sin iniciar sesión. Desde el Panel Admin puedes activar o desactivar al instante.'
  },
  {
    persistirLocal: true,
    descripcion: 'Configuración compartida entre <lab-tablon-empleos>, <lab-panel-admin> y <lab-resumen-kpi>.',
    reglas: 'Lectura pública; modificación reservada al panel de administración.'
  }
);

export const labListaEmpleos = crearEstadoCompartido(
  'lab:empleos_lista',
  [
    {
      id: 1,
      titulo: 'Cocinero de Comida Cruceña',
      puesto: 'Cocinero',
      contacto: '+591 70001122',
      estado: 'activo'
    }
  ],
  {
    persistirLocal: true,
    descripcion: 'Lista local de anuncios de empleo compartida entre componentes hermanos.',
    reglas: 'Solo permite publicar si lab:empleos_config.habilitado === true.'
  }
);

export const labChatMensajes = crearEstadoCompartido(
  'lab:chat_mensajes',
  [
    {
      id: 1,
      autor: 'Victor Code',
      canal: 'novedad',
      texto: '📣 Novedad Oficial: Lanzamiento de MitaDOM v2.7 con crearControlSpam() y Docs con DB Local.'
    },
    {
      id: 2,
      autor: 'Ana (Frontend)',
      canal: 'soporte',
      texto: '¿Cómo filtro mensajes del chat por canal sin usar Virtual DOM?'
    },
    {
      id: 3,
      autor: 'Carlos (QA)',
      canal: 'general',
      texto: 'Usa filtrarColeccion(mensajes, { busqueda, categoria, campoCategoria: "canal" }).'
    }
  ],
  {
    persistirLocal: true,
    descripcion: 'Historial compartido de chat y novedades protegido por crearControlSpam().',
    reglas: 'Bloquea spam, links externos, mensajes duplicados y aplica cooldown por usuario.'
  }
);

// ============================================================================
// 2. LECCIONES CON MULTI-ARCHIVO (ESTILO REACT.DEV/LEARN)
// ============================================================================
const LECCIONES = {
  compartir: {
    paso: 'Lección 1 de 6 • Flujo Gráfico + Estados Compartidos',
    titulo: 'Cómo se Comunican 3 Componentes en Vivo',
    objetivo: 'Observa el diagrama en vivo y prueba cómo crearEstadoCompartido() conecta componentes independientes sin props drilling.',
    comoProbar: '👉 Prueba: 1) Pulsa "Simular Toggle" en el diagrama → 2) Publica un anuncio → 3) Mira los 3 nodos reaccionar al instante.',
    tituloPreview: '⚡ 2. Diagrama Gráfico + 3 Componentes Vivos',
    archivos: [
      {
        nombre: 'empleosStore.js',
        codigo: `import { crearEstadoCompartido } from 'mita-dom';

// Estado compartido entre múltiples componentes con persistencia local
export const labConfigEmpleos = crearEstadoCompartido(
  'lab:empleos_config',
  {
    habilitado: true,
    requiereLogin: false,
    terminosCondiciones: 'Oferta real conforme a la normativa boliviana.',
    reglasUso: 'Abierto al público; Admin puede activar o pausar al instante.'
  },
  {
    persistirLocal: true,
    descripcion: 'Configuración compartida del módulo de empleos',
    reglas: 'Solo el administrador puede mutar esta configuración'
  }
);`
      },
      {
        nombre: 'tablon-empleos.js',
        codigo: `import { MitaElement, obtenerEstadoCompartido, renderCondicional } from 'mita-dom';

export class LabTablonEmpleos extends MitaElement {
  alMontar() {
    const config = obtenerEstadoCompartido('lab:empleos_config');
    const lista = obtenerEstadoCompartido('lab:empleos_lista');

    this.mostrarSi({
      estado: config,
      contenedor: this.querySelector('#lab-zona-form-empleo'),
      cuando: (cfg) => cfg.habilitado && !cfg.requiereLogin,
      mostrar: (cfg) => \`<form>Acepto: \${cfg.terminosCondiciones}</form>\`,
      sino: () => '<p>Formulario destruido del DOM por Administración.</p>'
    });
  }
}`
      },
      {
        nombre: 'panel-admin.js',
        codigo: `import { obtenerEstadoCompartido, listarEstadosCompartidos } from 'mita-dom';

// Componente 2 (Admin) muta el mismo estado por nombre:
const config = obtenerEstadoCompartido('lab:empleos_config');
config.patch({ habilitado: false });

// Auditoría instantánea de todos los estados compartidos locales:
console.table(listarEstadosCompartidos());`
      }
    ]
  },
  condicional: {
    paso: 'Lección 2 de 4 • Granular Light DOM',
    titulo: 'renderCondicional Declarativo (sin display: none)',
    objetivo: 'Destruye y construye nodos reales del DOM solo cuando cambia la evaluación booleana del Signal.',
    comoProbar: '👉 Prueba: Pulsa "Admin" y luego "Invitado" observando el DOM Check en tiempo real.',
    tituloPreview: '⚡ 2. Demo Viva: renderCondicional Real',
    archivos: [
      {
        nombre: 'acceso-condicional.js',
        codigo: `import { crearEstadoLocal, renderCondicional } from 'mita-dom';

const sesion = crearEstadoLocal({ rol: 'invitado', registroAbierto: true });

// Monta o destruye nodos reales del DOM cuando cambia la condición
const detener = renderCondicional({
  estado: sesion,
  contenedor: document.querySelector('#zona-condicional'),
  cuando: (s) => s.rol === 'admin',
  mostrar: () => '<section>🛡️ Panel Exclusivo de Administración</section>',
  sino: (s) => \`<p>Vista pública (rol actual: \${s.rol})</p>\`,
  siempreActualizar: true
});`
      }
    ]
  },
  local: {
    paso: 'Lección 3 de 4 • Estado Local',
    titulo: 'crearEstadoLocal + vincularTexto Granular',
    objetivo: 'Actualiza únicamente textContent preservando el mismo TextNode en memoria y evitando XSS.',
    comoProbar: '👉 Prueba: Escribe tu nombre y pulsa "+1 Click" sin provocar re-renders del formulario.',
    tituloPreview: '⚡ 2. Demo Viva: Estado Local Granular',
    archivos: [
      {
        nombre: 'contador-granular.js',
        codigo: `import { crearEstadoLocal, vincularTexto } from 'mita-dom';

const estado = crearEstadoLocal({ clicks: 0, nombre: 'Victor Code' });

// Solo actualiza textContent: el nodo DOM original nunca se destruye
const stopClicks = vincularTexto(
  estado,
  document.querySelector('#local-clicks-out'),
  (e) => \`Clicks acumulados: \${e.clicks}\`
);

const stopSaludo = vincularTexto(
  estado,
  document.querySelector('#local-saludo-out'),
  (e) => \`Hola, \${e.nombre || 'invitado'} 👋\`
);`
      }
    ]
  },
  efectos: {
    paso: 'Lección 4 de 6 • Reactividad y Auditoría',
    titulo: 'crearEfecto + Signal.derivar + Inspector Admin',
    objetivo: 'Auto-rastrea múltiples Signals con limpieza detener() y audita estados locales con listarEstadosCompartidos().',
    comoProbar: '👉 Prueba: Cambia Precio o Cantidad y revisa la tabla de estados persistidos en localStorage.',
    tituloPreview: '⚡ 2. Demo Viva: Efectos, Derivados e Inspector',
    archivos: [
      {
        nombre: 'efectos-y-derivados.js',
        codigo: `import { crearEstadoLocal, crearEfecto, listarEstadosCompartidos } from 'mita-dom';

const precio = crearEstadoLocal(35);
const cantidad = crearEstadoLocal(2);

// Signal derivado de solo lectura (caché reactiva)
const subtotal = cantidad.derivar((cant) => cant * precio.get());

// Efecto que rastrea automáticamente precio y cantidad
const detener = crearEfecto(() => {
  console.log('Total reactivo:', precio.get() * cantidad.get());
});

// Inspección de estados compartidos activos:
console.log(listarEstadosCompartidos());`
      }
    ]
  },
  reusables: {
    paso: 'Lección 5 de 6 • Arquitectura Re-usable',
    titulo: 'Web Components 100% Re-usables (Atributos + Estado Aislado + Eventos)',
    objetivo: 'Crea una sola clase Light DOM y reutilízala múltiples veces con atributos distintos, estado local independiente y eventos hacia el padre.',
    comoProbar: '👉 Prueba: Pulsa botones en cada tarjeta (cada una lleva su propio contador) o crea una nueva instancia en vivo.',
    tituloPreview: '♻️ 2. Demo Viva: 1 Componente, Múltiples Instancias',
    archivos: [
      {
        nombre: 'tarjeta-reusable.js',
        codigo: `import { MitaElement, crearEstadoLocal, vincularTexto } from 'mita-dom';

export class LabTarjetaReusable extends MitaElement {
  alMontar() {
    // Estado privado de ESTA instancia (no choca con otras instancias)
    this.estado = crearEstadoLocal({ usos: 0 });

    const titulo = this.getAttribute('titulo') || 'Tarjeta';
    const subtitulo = this.getAttribute('subtitulo') || '';
    const variante = this.getAttribute('variante') || 'info';
    const textoAccion = this.getAttribute('texto-accion') || 'Ejecutar';

    this.innerHTML = \`
      <article class="reusable-card variante-\${variante}">
        <header class="reusable-card-head">
          <h4>\${titulo}</h4>
          <small class="reusable-usos"></small>
        </header>
        <p>\${subtitulo}</p>
        <button type="button" class="demo-btn">\${textoAccion}</button>
      </article>
    \`;

    // Binding granular con auto-limpieza al desmontar
    const stop = vincularTexto(
      this.estado,
      this.querySelector('.reusable-usos'),
      (e) => \`\${e.usos} clics\`
    );
    this.registrarLimpieza(stop);

    // Emitir evento estándar al padre para desacoplar lógica de negocio
    this.addEventListener('click', (ev) => {
      if (!ev.target.closest('button')) return;
      const usos = this.estado.get().usos + 1;
      this.estado.patch({ usos });
      this.dispatchEvent(new CustomEvent('tarjeta-accion', {
        detail: { titulo, variante, usos },
        bubbles: true
      }));
    });
  }
}`
      },
      {
        nombre: 'uso-multi-instancia.html',
        codigo: `<!-- El mismo componente instanciado 3 veces con props diferentes -->
<lab-tarjeta-reusable
  titulo="Anuncios de Empleo"
  subtitulo="Abierto al público sin login"
  variante="exito"
  texto-accion="Publicar oferta"
></lab-tarjeta-reusable>

<lab-tarjeta-reusable
  titulo="Reglas y Términos"
  subtitulo="Editables solo por Admin"
  variante="alerta"
  texto-accion="Revisar reglas"
></lab-tarjeta-reusable>

<lab-tarjeta-reusable
  titulo="Auditoría Signals"
  subtitulo="Inspección localStorage en vivo"
  variante="info"
  texto-accion="Inspeccionar"
></lab-tarjeta-reusable>`
      }
    ]
  },
  comparativa: {
    paso: 'Lección 6 de 6 • Evolución v2.6 → v2.7',
    titulo: 'Antes (v2.6) vs Después (v2.7): Por qué hoy es más claro',
    objetivo: 'Compara el código antiguo repetitivo contra las nuevas APIs declarativas y prueba cada mejora en tiempo real.',
    comoProbar: '👉 Prueba: Alterna entre pestañas "antes-v2.6.js" y "despues-v2.7.js" y ejecuta cada prueba en el panel derecho.',
    tituloPreview: '🚀 2. Demo Viva: Verificador de Mejoras v2.7',
    archivos: [
      {
        nombre: 'despues-v2.7.js',
        codigo: `// ✅ MITA-DOM v2.7.0 (Claro, explícito y auto-limpiable)
import {
  crearEstadoCompartido,
  obtenerEstadoCompartido,
  crearEfecto,
  sinRastrear,
  renderCondicional,
  vincularTexto
} from 'mita-dom';

// 1. Compartir estado por nombre (sin imports circulares)
const cfg = crearEstadoCompartido('app:modulo', { activo: true }, { persistirLocal: true });

// 2. Estado derivado fluido (.derivar)
const etiqueta = cfg.derivar((c) => (c.activo ? 'ACTIVO' : 'PAUSADO'));

// 3. Efecto auto-rastreable con limpieza en 1 línea
const stopEfecto = crearEfecto(() => console.log('Estado:', etiqueta.get()));

// 4. Render condicional declarativo (0 display: none)
const stopRender = renderCondicional({
  estado: cfg,
  contenedor: zona,
  cuando: (c) => c.activo,
  mostrar: () => '<form>Activo</form>',
  sino: () => '<p>Pausado</p>'
});

// 5. Binding seguro de solo texto
const stopTexto = vincularTexto(etiqueta, badgeNodo);`
      },
      {
        nombre: 'antes-v2.6.js',
        codigo: `// ❌ ANTES (v2.6.0 — Más repetitivo y propenso a memory leaks)
import { crearEstadoGlobal, SignalDerivado, renderCondicional } from 'mita-dom';

// 1. Tenías que pasar la referencia del store manualmente por todos lados
const cfg = crearEstadoGlobal({ activo: true }, { persistKey: 'app_modulo' });

// 2. Derivado manual sin método .derivar()
const etiqueta = new SignalDerivado(cfg, (c) => (c.activo ? 'ACTIVO' : 'PAUSADO'));

// 3. Sin crearEfecto(): debías guardar callbacks y desuscribir uno por uno
const onLog = (v) => console.log('Estado:', v);
etiqueta.suscribir(onLog);

// 4. renderCondicional con 5 argumentos posicionales sin cleanup
renderCondicional(cfg, zona, (c) => c.activo, () => '<form>Activo</form>', () => '<p>Pausado</p>');

// 5. Texto manual propenso a olvidar desuscribir
const onBadge = (v) => { badgeNodo.textContent = v; };
etiqueta.suscribir(onBadge);`
      }
    ]
  },
  chat: {
    paso: 'Lección 7 de 7 • Chats, Anti-Spam y Modales',
    titulo: 'Chat con Control Anti-Spam, Filtración y Modal de Novedades',
    objetivo: 'Protege salas de chat con crearControlSpam(), filtra con filtrarColeccion() y publica novedades con <mita-dialog> en Light DOM.',
    comoProbar: '👉 Prueba: 1) Envía un mensaje normal → 2) Pulsa "Simular Spam" → 3) Filtra por canal o abre el Modal de Novedades.',
    tituloPreview: '💬 2. Sala de Chat + Escudo Anti-Spam + Modal',
    archivos: [
      {
        nombre: 'chat-antispam.js',
        codigo: `import {
  crearEstadoCompartido,
  crearControlSpam,
  filtrarColeccion
} from 'mita-dom';

// 1. Guardián Anti-Spam (cooldown + duplicados + lista negra + links)
const guardian = crearControlSpam({
  cooldownMs: 1200,
  maxLongitud: 220,
  palabrasProhibidas: ['spam', 'casino', 'phishing', 'estafa'],
  bloquearLinks: true,
  bloquearDuplicados: true
});

export function intentarEnviarMensaje(autor, texto, canal = 'general') {
  const check = guardian.evaluarMensaje(texto, autor);
  if (!check.permitido) {
    return { ok: false, motivo: check.motivo };
  }
  // Mensaje limpio y aprobado
  return { ok: true, texto: check.textoLimpio, canal };
}`
      },
      {
        nombre: 'modal-novedades.js',
        codigo: `// Modal Nativo Re-utilizable (<mita-dialog>) en Light DOM
const modal = document.querySelector('#lab-modal-novedad');

// Abrir para publicar una notificación o novedad oficial:
document.querySelector('#btn-open-novedad').addEventListener('click', () => {
  modal.abrir();
});

// Al enviar el formulario del modal, agrega la novedad y cierra:
formNovedad.addEventListener('submit', (e) => {
  e.preventDefault();
  labChatMensajes.set([nuevaNovedad, ...labChatMensajes.get()]);
  modal.cerrar();
});`
      }
    ]
  },
  estrategias: {
    paso: 'Lección 8 de 9 • Render Universal (SSR / SSG / Hybrid / SPA)',
    titulo: 'Estrategias SSR, SSG, Hybrid + Islas y SEO MitaMeta',
    objetivo: 'Ejecuta el mismo componente en 4 estrategias de renderizado con soporte de Islas (mita-client="only" y mita-server="only").',
    comoProbar: '👉 Prueba: Pulsa los botones "Hybrid (Islands)", "SSR", "SSG" y "CSR / SPA" para inspeccionar el HTML y <head> generados.',
    tituloPreview: '🌐 2. Simulador en Vivo: SSR vs SSG vs Hybrid vs SPA',
    archivos: [
      {
        nombre: 'render-universal.js',
        codigo: `import { MitaElement, MitaMeta, renderizarVistaUniversal } from 'mita-dom';

export class VistaLandingRestaurante extends MitaElement {
  static ssrLoader(ctx) {
    MitaMeta.useHead({
      title: 'MitaDOM v2.7 — ' + ctx.modo.toUpperCase(),
      description: 'Arquitectura Universal con Islas Light DOM'
    });
    return { platoEstrella: 'Majadito de Pato', modo: ctx.modo };
  }

  renderSSR() {
    return \`
      <article data-vista="restaurante">
        <header mita-server="only">
          <h2>🍽️ Especial: \${this.ssrData?.platoEstrella}</h2>
          <small>Estático del servidor (0 JS en cliente)</small>
        </header>
        <mita-carrito-vivo mita-client="only"></mita-carrito-vivo>
      </article>
    \`;
  }
}

// Prueba en modo 'ssr', 'ssg', 'hybrid' o 'csr':
const salida = await renderizarVistaUniversal(VistaLandingRestaurante, {
  url: '/menu',
  modo: 'hybrid'
});`
      }
    ]
  },
  authcookies: {
    paso: 'Lección 9 de 9 • Auth FormBuilder + Cookies & Analíticas',
    titulo: 'FormBuilder Reusable, Login/Registro Condicional y Cookies',
    objetivo: 'Construye formularios semánticos con crearFormularioReusable(), alterna Login/Registro/Logout con crearControladorAuth() y controla analíticas con crearGestorConsentimiento().',
    comoProbar: '👉 Prueba: 1) Inicia sesión o Regístrate → 2) Cierra sesión → 3) Dispara un evento de analítica con y sin consentimiento de cookies.',
    tituloPreview: '🔐 2. Demo Viva: Auth Condicional + Cookies & Analíticas',
    archivos: [
      {
        nombre: 'auth-formbuilder.js',
        codigo: `import { crearControladorAuth, crearFormularioReusable } from 'mita-dom';

// Controlador reactivo que usa renderCondicional internamente:
// - Sin sesión: muestra Login o Registro (con Términos y Condiciones)
// - Con sesión: destruye el formulario y monta el panel con botón Cerrar Sesión
const auth = crearControladorAuth({
  nombreEstado: 'lab:auth_demo',
  persistirLocal: true,
  terminosTexto: 'Acepto los Términos y Condiciones y la Política de Privacidad.'
});

const detenerAuth = auth.montarFlujoCondicional(
  document.querySelector('#auth-stage')
);`
      },
      {
        nombre: 'cookies-y-analiticas.js',
        codigo: `import { crearGestorConsentimiento } from 'mita-dom';

// Gestor reactivo de Términos, Cookies y Analíticas Condicionales
const consent = crearGestorConsentimiento({
  nombreEstado: 'lab:cookies_demo',
  versionTerminos: '2026-11-22'
});

// Bloqueado automáticamente si cookiesAnaliticas === false
const resultado = consent.registrarAnalitica('click_oferta', {
  modulo: 'empleos'
});
console.log(resultado); // { enviado: true/false, motivo }`
      }
    ]
  },
  rustguard: {
    paso: 'Lección 10 de 10 • Rust Memory Guard + CLI + Test Runner',
    titulo: 'Protección Tipo Rust (&T, &mut T, RAII Drop), CLI y Tests en Vivo',
    objetivo: 'Previene mutaciones accidentales y fugas de memoria con garantías inspiradas en Rust, genera código con npx mita CLI y ejecuta tests automáticos y manuales.',
    comoProbar: '👉 Prueba: 1) Intenta violar el Borrow Checker (&T) → 2) Ejecuta un comando CLI → 3) Corre la Suite Automática de Tests.',
    tituloPreview: '🦀 2. Rust Memory Guard + Simulador CLI + Test Runner',
    archivos: [
      {
        nombre: 'rust-memory-guard.js',
        codigo: `import {
  crearEstadoReactivoInmutable,
  leerEstadoInmutable,
  mutarEstadoConHistorial,
  obtenerHistorialDeMutaciones,
  crearAmbitoConLimpiezaAutomatica
} from 'mita-dom';

// 1. Estado protegido por Borrow Checker (&T congelado con Object.freeze)
const cuenta = crearEstadoReactivoInmutable('rust:cuenta_demo', {
  titular: 'Victor Code',
  saldoBs: 1000
});

// Préstamo inmutable (&T): si haces lectura.saldoBs = 0 lanza TypeError
const lectura = leerEstadoInmutable(cuenta);

// Préstamo mutable (&mut T) con motivo obligatorio para auditoría:
mutarEstadoConHistorial(
  cuenta,
  (actual) => ({ ...actual, saldoBs: actual.saldoBs + 250 }),
  'Abono verificado por RustGuard'
);

// 2. Ownership & RAII Drop: 0 fugas de memoria al desmontar
const ambito = crearAmbitoConLimpiezaAutomatica('<mi-componente>');
ambito.vincularSignalConLimpieza(cuenta, (v) => console.log(v.saldoBs));
ambito.liberarMemoriaCompleta(); // Drop!`
      },
      {
        nombre: 'cli-y-tests.js',
        codigo: `import {
  simularComandoCliMita,
  ejecutarSuiteVerificacionMita
} from 'mita-dom';

// 1. Generador CLI (Angular / Vue / Solid / Cargo style)
const generado = simularComandoCliMita('mita g component TarjetaEmpleo');
console.log(generado.archivos);

// 2. Suite automática de auto-verificación en tiempo real
const reporteQA = ejecutarSuiteVerificacionMita();
console.table(reporteQA.resultados);`
      }
    ]
  },
  crudvistas: {
    paso: 'Lección 11 de 11 • CRUD Multi-Categoría + Modos de Render por Vista',
    titulo: 'CRUD Completo con FormBuilder Re-usable y Control Granular de Vistas',
    objetivo: 'Busca, filtra, registra, destaca y elimina elementos de cualquier categoría con crearControladorCrudCategorias() y cambia o desactiva estrategias (Hybrid/SSR/SSG/CSR) por vista.',
    comoProbar: '👉 Prueba: 1) Registra un ítem con el FormBuilder → 2) Filtra por categoría → 3) Cambia el modo de /empleos o desactiva /admin.',
    tituloPreview: '🗂️ 2. CRUD Multi-Categoría + Estrategia por Vista en Vivo',
    archivos: [
      {
        nombre: 'crud-multicategoria.js',
        codigo: `import {
  crearControladorCrudCategorias,
  crearFormularioReusable
} from 'mita-dom';

const crud = crearControladorCrudCategorias({
  nombreEstado: 'lab:crud_multicategoria',
  categoriasPermitidas: ['empleos', 'productos', 'cursos', 'documentos', 'servicios']
});

// Formulario Re-usable para registrar cualquier categoría:
const form = crearFormularioReusable({
  id: 'lab-crud-form',
  titulo: '➕ Registrar en Catálogo Multi-Categoría',
  submitText: 'Guardar Registro',
  fields: [
    { name: 'titulo', label: 'Título *', required: true, minLength: 3 },
    {
      name: 'categoria',
      label: 'Categoría *',
      type: 'select',
      options: [
        { value: 'empleos', label: '💼 Empleos' },
        { value: 'productos', label: '📦 Productos' },
        { value: 'cursos', label: '🎓 Cursos' },
        { value: 'documentos', label: '📄 Documentos' },
        { value: 'servicios', label: '🛠️ Servicios' }
      ]
    },
    { name: 'valorNumerico', label: 'Valor / Salario (Bs.)', type: 'number' }
  ],
  onSubmit: (datos) => crud.crearNuevoRegistro(datos)
});`
      },
      {
        nombre: 'estrategias-por-vista.js',
        codigo: `import { crearControladorEstrategiaPorVista } from 'mita-dom';

const controlVistas = crearControladorEstrategiaPorVista({
  nombreEstado: 'lab:vistas_control_granular'
});

// 1. Cambiar estrategia de una vista específica en caliente:
controlVistas.cambiarModoDeVistaEnCaliente('/empleos', 'hybrid');
controlVistas.cambiarModoDeVistaEnCaliente('/docs', 'ssg');

// 2. Activar o desactivar una vista específica en cualquier momento:
controlVistas.activarODesactivarVista('/admin', false);`
      }
    ]
  },
  comunidad: {
    paso: 'Lección 12 de 12 • UI Paginación + Chat Gate (3s) + Moderación ("DC")',
    titulo: 'Perfiles sin Cuenta (15 días), Ventana de Entrada a Chat (3s) y Moderación "DC"',
    objetivo: 'Crea perfiles sin cuenta con huella local de dispositivo (regla 15 días), exige aceptar reglas para entrar a chats (cooldown 3s) y modera anuncios ("DC", CRUD categorías, reportes con pruebas y descargo legal).',
    comoProbar: '👉 Prueba: 1) Intenta entrar a un grupo de chat → 2) Prueba cambiar tu nombre antes de 15 días → 3) Intenta publicar un anuncio con "dc" o repórtalo con pruebas.',
    tituloPreview: '🛡️ 2. Demo Viva: Perfiles + Chat Gate (3s) + Moderación Anuncios ("DC")',
    archivos: [
      {
        nombre: 'perfiles-y-chat-gate.js',
        codigo: `import {
  crearGestorPerfilesYDispositivo,
  crearControladorSalaChatYGrupos
} from 'mita-dom';

// 1. Perfil rápido sin registrar cuenta + Huella de dispositivo en DB Local
// Incluye regla de 15 días para no cambiar el nombre (activable/desactivable por Admin)
const perfiles = crearGestorPerfilesYDispositivo();
perfiles.crearOActualizarPerfilSinCuenta({
  nombre: 'Carlos Bolivia',
  empresa: 'Constructora Sur'
});

// 2. Chat y Grupos con Ventana Obligatoria de Aceptación y Cooldown de 3s
const chat = crearControladorSalaChatYGrupos({ intervaloSegundosInicial: 3 });

// Si no ha aceptado las reglas de 'grupo-empleos', abre la ventana y NO deja entrar:
const intento = chat.intentarEntrarASalaOChat('grupo-empleos');
if (intento.requiereAceptarVentana) {
  // Cuando el usuario pulsa "Aceptar" en la ventana:
  chat.aceptarReglasYEntrarASala('grupo-empleos');
}`
      },
      {
        nombre: 'moderacion-anuncios-dc.js',
        codigo: `import {
  crearSistemaModeracionAnuncios,
  crearControladorPaginacion,
  crearFetcherConCacheYEstados
} from 'mita-dom';

const mod = crearSistemaModeracionAnuncios();
const paginador = crearControladorPaginacion({ tamanoPaginaInicial: 3 });
const fetcher = crearFetcherConCacheYEstados({ tiempoCacheMs: 60000 });

// 1. CRUD Obligatorio de Categorías:
mod.crearCategoria({ id: 'logistica', nombre: '🚚 Logística' });

// 2. Bloquea automáticamente palabras prohibidas como "DC" (mayúsculas, minúsculas o ambos)
// y asigna el badge "⚠️ No Verificado" por defecto:
const pub = mod.publicarAnuncio({
  titulo: 'Chofer Repartidor',
  descripcion: 'Turno completo',
  categoria: 'logistica',
  autorNombre: 'Carlos Bolivia',
  empresa: 'Constructora Sur'
});

// 3. Reportar anuncio con justificación + pruebas (notifica al Admin):
mod.reportarAnuncioConPruebas({
  idAnuncio: pub.anuncio.id,
  justificacion: 'Exige pago previo',
  pruebasEvidencia: 'Captura WhatsApp #99'
});`
      }
    ]
  },
  props: {
    paso: 'Lección 13 de 14 • Pasar Props a un Componente (Estilo React.dev Mejorado)',
    titulo: 'Passing Props: utils.js + <lab-cientifico-avatar> + Profile (Sin div-soup)',
    objetivo: 'Pasa objetos complejos person ({ name, imageId }) y números size (100, 80, 50) a múltiples instancias de un Web Component usando pasarPropsAElemento() y leerPropsDeElemento().',
    comoProbar: '👉 Prueba: 1) Cambia el tamaño (size) de Katsuko Saruhashi a 120px → 2) Alterna entre los 3 científicos o ajusta las props en vivo.',
    tituloPreview: '👩‍🔬 2. Demo Viva: 3 Instancias <lab-cientifico-avatar> con Props',
    archivos: [
      {
        nombre: 'utils.js',
        codigo: `// utils.js — Exactamente el helper de https://react.dev/learn/passing-props-to-a-component
// También exportado nativamente por 'mita-dom' como obtenerUrlImagenCientifico()
export function getImageUrl(person, size = 's') {
  return (
    'https://react.dev/images/docs/scientists/' +
    person.imageId +
    size +
    '.jpg'
  );
}`
      },
      {
        nombre: 'mita-avatar.js',
        codigo: `import { MitaElement, leerPropsDeElemento, obtenerUrlImagenCientifico } from 'mita-dom';

export class LabCientificoAvatar extends MitaElement {
  render() {
    // Lee props con valores por defecto (size = 100) igual que function Avatar({ person, size = 100 })
    const { person, size } = leerPropsDeElemento(this, {
      size: 100,
      person: { name: 'Katsuko Saruhashi', imageId: 'YfeOqp2', profesion: 'Geoquímica' }
    });

    // HTML5 semántico (<figure> + <img> + <figcaption>, cero <div> innecesarios)
    this.innerHTML = \`
      <figure class="scientist-card">
        <img
          class="avatar scientist-avatar-img"
          src="\${obtenerUrlImagenCientifico(person)}"
          alt="\${person.name}"
          width="\${size}"
          height="\${size}"
        />
        <figcaption>
          <strong>\${person.name}</strong>
          <small>\${size}x\${size}px • ID: \${person.imageId}</small>
        </figcaption>
      </figure>
    \`;
  }
}`
      },
      {
        nombre: 'App.js',
        codigo: `import { pasarPropsAElemento } from 'mita-dom';
import './mita-avatar.js';

// Equivalente exacto a export default function Profile() de React.dev:
pasarPropsAElemento(document.querySelector('#avatar-katsuko'), {
  size: 100,
  person: { name: 'Katsuko Saruhashi', imageId: 'YfeOqp2' }
});

pasarPropsAElemento(document.querySelector('#avatar-aklilu'), {
  size: 80,
  person: { name: 'Aklilu Lemma', imageId: 'OKS67lh' }
});

pasarPropsAElemento(document.querySelector('#avatar-lin'), {
  size: 50,
  person: { name: 'Lin Lanying', imageId: '1bX5QH6' }
});`
      }
    ]
  },
  angular: {
    paso: 'Lección 14 de 14 • Tutoriales Angular.dev en Mita-DOM (@defer + Signal Forms)',
    titulo: 'Deferrable Views (@defer) + Signal Forms + Antigravity AI Tutor',
    objetivo: 'Aplica las mejores funcionalidades de https://angular.dev/tutorials en Mita-DOM: carga diferida con @placeholder/@loading y formularios reactivos con Signals.',
    comoProbar: '👉 Prueba: 1) Pulsa el bloque @placeholder para disparar la Vista Diferida (@defer) → 2) Escribe en el Signal Form y observa la validación reactiva instantánea.',
    tituloPreview: '🅰️ 2. Demo Viva: Vistas Diferidas (@defer) + Signal Forms',
    archivos: [
      {
        nombre: 'deferrable-views.js',
        codigo: `import { renderizarVistaDiferida } from 'mita-dom';

// Inspirado en https://angular.dev/tutorials/deferrable-views (@defer on interaction)
const vistaDiferida = renderizarVistaDiferida({
  contenedor: document.querySelector('#defer-mount'),
  disparador: 'interaccion',
  plantillaPlaceholder: () => \`
    <button type="button" class="demo-btn">
      📦 @placeholder: Clic para Cargar Biografías Completas (@defer)
    </button>
  \`,
  plantillaCargando: () => '<p>⏳ @loading: Descargando chunk diferido...</p>',
  cargarContenidoDiferido: async () => \`
    <article>✅ Contenido @defer montado bajo demanda (0 costo en carga inicial)</article>
  \`
});`
      },
      {
        nombre: 'signal-forms.js',
        codigo: `import { crearFormularioReactivoConSignals } from 'mita-dom';

// Inspirado en https://angular.dev/tutorials/signal-forms
const formCientifico = crearFormularioReactivoConSignals({
  nombre: { valorInicial: 'Katsuko Saruhashi', requerido: true, minLongitud: 3 },
  email: {
    valorInicial: 'katsuko@geoquimica.jp',
    requerido: true,
    patronRegex: '^[^\\\\s@]+@[^\\\\s@]+\\\\.[^\\\\s@]+$'
  },
  imageId: { valorInicial: 'YfeOqp2', requerido: true, minLongitud: 5 }
});

// Mutación reactiva instantánea al escribir en cada campo:
formCientifico.establecerValorCampo('nombre', 'Aklilu Lemma');`
      }
    ]
  },
  fullstack: {
    paso: 'Lección 15 de 15 • Full-Stack Express+ORM, Fetch (Click vs Auto), Estrategias Visuales y Mita Doc',
    titulo: 'Cómo Entender las Estrategias de Render, Fetch por Modo, Server Actions y SemVer',
    objetivo: 'Comprende visualmente CSR vs SSR vs SSG vs Hybrid, compara pedir datos solo al hacer clic vs automáticamente al entrar, ejecuta una Server Action (Express + ORM) y consulta Mita Doc Advisor.',
    comoProbar: '👉 Prueba: 1) Explora la metáfora visual de las 4 estrategias → 2) Prueba Fetch "Al Hacer Clic" vs "Automático" → 3) Ejecuta la Server Action ORM.',
    tituloPreview: '🏛️ 2. Estrategias Visuales + Fetch (Click/Auto) + Server Actions + Mita Doc',
    archivos: [
      {
        nombre: 'fetch-click-vs-auto.js',
        codigo: `import { crearControladorFetchingPorModo } from 'mita-dom';

// Modo 1: 'al-hacer-click' (0 peticiones al entrar; ahorra 100% de red inicial)
export const fetchBajoDemanda = crearControladorFetchingPorModo({
  nombreEstado: 'lab:fetch_click',
  modoDisparo: 'al-hacer-click',
  tiempoCacheMs: 60000,
  cargadorAsyncFn: async () => ({ origen: 'Express + MySQL ORM', registros: 128 })
});

// Al montar la vista: si es 'al-hacer-click' NO gasta red; si es 'automatico-al-entrar' descarga:
await fetchBajoDemanda.alEntrarALaVista();

// Al pulsar el botón explícito:
await fetchBajoDemanda.alHacerClickEnBoton();`
      },
      {
        nombre: 'server-actions-express-orm.js',
        codigo: `import {
  crearAccionServidorIsomorfica,
  ejecutarConsejeroMitaDoc,
  calcularRecomendacionSemVer
} from 'mita-dom';

// 1. Server Action para Node.js + Express + Sequelize/MySQL ORM
export const guardarEmpleoORM = crearAccionServidorIsomorfica(
  'empleos/guardarEnMySQL',
  async (payload) => ({
    id: Date.now(),
    tablaORM: 'job_announcements',
    ...payload
  }),
  {
    validarPayload: (p) => (!p.titulo ? 'El título es obligatorio para MySQL ORM' : null)
  }
);

// 2. Consejero Mita Doc + SemVer Advisor (CONTRIBUTING.md)
console.log(ejecutarConsejeroMitaDoc());
console.log(calcularRecomendacionSemVer({ versionActual: '2.7.0', agregaNuevaFuncionalidadOExport: true }));`
      }
    ]
  },
  solid2: {
    paso: 'Lección 16 de 17',
    titulo: '🧬 Ciclo de Vida MitaElement + Solid 2.0 Async Graph + Live SSE + Diagnósticos IA',
    objetivo:
      'Domina el ciclo de vida oficial (alCrear -> render -> alMontar -> alCambiarProp -> alDesmontar), cascadas asíncronas sin race conditions (Solid 2.0 + Angular linkedSignal), streams live() SSE, rollback optimista y cambio de estrategia de render en 1 línea.',
    comoProbar:
      '1) Cambia el Departamento para ver la cascada asíncrona sin parpadeos. 2) Inicia el Stream Live (async function*). 3) Prueba el Rollback Optimista y dispara un Diagnóstico para Agentes IA.',
    tituloPreview: '🧬 Demo Viva: Solid 2.0 Async Graph + Live SSE + Estrategia 1-Línea',
    archivos: [
      {
        nombre: 'ciclo-de-vida-claro.js',
        codigo: `import { MitaElement, crearEstadoLocal } from 'mita-dom';

export class TarjetaCicloClaro extends MitaElement {
  static get observedAttributes() {
    return ['color-acento'];
  }

  // 1. Constructor: crea tus Signals aquí (sin depender del DOM)
  alCrear() {
    this.clicks = crearEstadoLocal(0);
  }

  // 2. Pinta Light DOM una sola vez (con Error Boundary)
  render() {
    this.innerHTML = '<article><h4 class="titulo">Hola MitaDOM</h4><output class="contador"></output></article>';
  }

  // 3. DOM listo: enlaza Signals granulares (auto-limpiados al desmontar)
  alMontar() {
    this.vincularTexto(this.clicks, '.contador', (n) => \`Clics: \${n}\`);
  }

  // 4. Reacciona a atributos observados en camelCase
  alCambiarProp(prop, _antes, nuevo) {
    if (prop === 'colorAcento') this.querySelector('.titulo').style.color = nuevo;
  }

  // 5. Limpieza adicional opcional
  alDesmontar() {
    this.clicks.destroy();
  }
}`
      },
      {
        nombre: 'solid2-async-graph-y-live.js',
        codigo: `import {
  crearEstadoLocal,
  crearMemoAsincrono,
  crearEstadoVinculado,
  crearFuncionServidorEnVivo,
  crearEstadoOptimistaConRollback,
  cambiarEstrategiaRender
} from 'mita-dom';

// 1. Cascada Asíncrona (Solid 2.0 + Angular linkedSignal)
const departamento = crearEstadoLocal('Santa Cruz');
const ciudades = crearMemoAsincrono(async () => {
  const dep = departamento.get();
  return dep === 'Santa Cruz' ? ['Santa Cruz', 'Montero'] : ['Cochabamba', 'Quillacollo'];
});
const ciudadActiva = crearEstadoVinculado(
  () => ciudades.estado.get().valor || [],
  (lista) => lista[0] || ''
);

// 2. Stream en Vivo (Solid 2.0 live async function*)
const pedidosEnVivo = crearFuncionServidorEnVivo('cocina/pedidos', async function* () {
  yield '🔥 Pedido #104 en parrilla';
  yield '✅ Pedido #104 listo para mesa 5';
});

// 3. Optimistic Rollback + Estrategia de Render en 1 línea
const likes = crearEstadoOptimistaConRollback(12);
cambiarEstrategiaRender('/empleos', 'RESUMABLE', { cacheSegundos: 60 });`
      }
    ]
  },
  v28syntax: {
    paso: 'Lección 17 de 17 • Novedades v2.8.0 (2026-11-24)',
    titulo: '🚀 Sintaxis v2.8.0: sinRastrear(), 8 Subpath Exports y Ciclo de Vida',
    objetivo:
      'Aprende la sintaxis oficial de MitaDOM v2.8.0: evita bucles infinitos con sinRastrear() (untrack), importa módulos granulares vía Subpath Exports, activa logs puntuales con { debug: true } e inspecciona obtenerCicloDeVida() en vivo.',
    comoProbar:
      '1) Pulsa "+1 Auditoría (sinRastrear)" y observa que el efecto sigue en 1 ejecución. 2) Pulsa "+1 Filtro (Rastreado)" para dispararlo. 3) Explora los 8 Subpath Exports e inspecciona el ciclo de vida real.',
    tituloPreview: '🚀 Demo Viva v2.8.0: sinRastrear() + Subpath Exports + Ciclo de Vida',
    archivos: [
      {
        nombre: 'sintaxis-v28-sinrastrear.js',
        codigo: `import { crearEstadoLocal, crearEfecto, sinRastrear } from 'mita-dom/signals';

// 1. Consola silenciosa por defecto en Vitest/CI/producción (opt-in con { debug: true })
const filtroActivo = crearEstadoLocal(1);
const auditoriaInterna = crearEstadoLocal(0, { debug: true });

// 2. sinRastrear() lee y muta auditoriaInterna SIN suscribir el efecto a ella (0 bucles)
const detener = crearEfecto(() => {
  const actual = filtroActivo.get();
  sinRastrear(() => {
    const prev = auditoriaInterna.get();
    console.debug('Filtro:', actual, '| Auditoría no rastreada:', prev);
  });
});

// Mutar auditoriaInterna NO vuelve a disparar el efecto:
auditoriaInterna.set(auditoriaInterna.get() + 1);
// Mutar filtroActivo SÍ dispara el efecto:
filtroActivo.set(2);
detener();`
      },
      {
        nombre: 'subpath-exports-y-ciclo.js',
        codigo: `// 8 Subpath Exports oficiales de mita-dom@2.8.0 (100% tree-shakeables)
import { crearEstadoLocal, sinRastrear } from 'mita-dom/signals';
import { crearMemoAsincrono, cambiarEstrategiaRender } from 'mita-dom/async';
import { MitaElement } from 'mita-dom/element';
import { crearEstadoReactivoInmutable } from 'mita-dom/rust';
import { renderizarVistaUniversal } from 'mita-dom/ssr';
import { pasarPropsAElemento } from 'mita-dom/props';
import { renderizarVistaDiferida } from 'mita-dom/ui';
import { ejecutarConsejeroMitaDoc } from 'mita-dom/devtools';

// Inspección real del ciclo de vida de cualquier Web Component MitaElement:
class MiWidget extends MitaElement {
  alCrear() { this.conteo = crearEstadoLocal(0); }
  render() { this.innerHTML = '<output class="val">0</output>'; }
  alMontar() {
    this.vincularTexto(this.conteo, '.val');
    console.log(this.obtenerCicloDeVida());
    // => { componente: 'mi-widget', faseActual: 'montado', montado: true, renders: 1, limpiezasPendientes: 1 }
  }
}`
      }
    ]
  }
};

// ============================================================================
// 3. WEB COMPONENTS HERMANOS PARA LECCIÓN 1 (COMPARTIR ESTADO)
// ============================================================================
class LabResumenKpi extends MitaElement {
  constructor() {
    super();
    this._limpiezas = [];
  }

  async render() {
    const config = obtenerEstadoCompartido('lab:empleos_config') || labConfigEmpleos;
    const lista = obtenerEstadoCompartido('lab:empleos_lista') || labListaEmpleos;

    this.innerHTML = `
      <article class="demo-panel">
        <header class="demo-panel-head">
          <h3>📊 KPIs Derivados + Efecto</h3>
          <span class="demo-tag">&lt;lab-resumen-kpi&gt;</span>
        </header>
        <ul class="demo-kpi-list">
          <li class="demo-kpi-item">
            <small>Módulo</small>
            <strong id="kpi-modulo">...</strong>
          </li>
          <li class="demo-kpi-item">
            <small>Ofertas (.derivar)</small>
            <strong id="kpi-activos">0</strong>
          </li>
          <li class="demo-kpi-item">
            <small>Acceso</small>
            <strong id="kpi-acceso">...</strong>
          </li>
        </ul>
        <output id="kpi-efecto-log" class="demo-log-output"></output>
      </article>
    `;

    const activosDerivado = lista.derivar(
      (items) => items.filter((item) => item.estado === 'activo').length
    );

    const stopModulo = vincularTexto(
      config,
      this.querySelector('#kpi-modulo'),
      (cfg) => (cfg.habilitado ? '🟢 Activo' : '🔴 Pausado')
    );

    const stopAcceso = vincularTexto(
      config,
      this.querySelector('#kpi-acceso'),
      (cfg) => (cfg.requiereLogin ? '🔐 Con Sesión' : '🌐 Sin Login')
    );

    const stopActivos = vincularTexto(
      activosDerivado,
      this.querySelector('#kpi-activos'),
      (cantidad) => `${cantidad} ofertas`
    );

    const stopEfecto = crearEfecto(() => {
      const cfg = config.get();
      const total = activosDerivado.get();
      const logEl = this.querySelector('#kpi-efecto-log');
      if (logEl) {
        logEl.textContent = `⚡ crearEfecto() => habilitado=${cfg.habilitado} | login=${cfg.requiereLogin} | activas=${total}`;
      }
    });

    this._limpiezas.push(stopModulo, stopAcceso, stopActivos, stopEfecto, () => activosDerivado.destroy());
  }

  disconnectedCallback() {
    this._limpiezas.forEach((fn) => fn());
    this._limpiezas = [];
  }
}

class LabTablonEmpleos extends MitaElement {
  constructor() {
    super();
    this._limpiezas = [];
  }

  async render() {
    const config = obtenerEstadoCompartido('lab:empleos_config') || labConfigEmpleos;
    const lista = obtenerEstadoCompartido('lab:empleos_lista') || labListaEmpleos;

    this.innerHTML = `
      <article class="demo-panel">
        <header class="demo-panel-head">
          <h3>💼 Tablón Público de Empleos</h3>
          <span class="demo-tag">&lt;lab-tablon-empleos&gt;</span>
        </header>
        <p id="lab-reglas-publicas" class="demo-rules-note"></p>
        <section id="lab-zona-form-empleo"></section>
        <ul id="lab-lista-empleos" class="demo-jobs-ul"></ul>
      </article>
    `;

    const stopReglas = config.suscribir((cfg) => {
      const box = this.querySelector('#lab-reglas-publicas');
      if (box) {
        box.innerHTML = `<strong>📜 Reglas:</strong> ${escaparHtml(cfg.reglasUso)}`;
      }
    });

    const stopCondicional = renderCondicional({
      estado: config,
      contenedor: this.querySelector('#lab-zona-form-empleo'),
      cuando: (cfg) => cfg.habilitado === true && cfg.requiereLogin === false,
      mostrar: (cfg) => `
        <form id="lab-form-empleo" class="demo-form">
          <label class="demo-label">
            Título del anuncio *
            <input id="lab-titulo" name="titulo" class="demo-input" placeholder="Ej: Mesero turno tarde" required />
          </label>
          <label class="demo-label">
            Puesto *
            <input id="lab-puesto" name="puesto" class="demo-input" placeholder="Ej: Mesero" required />
          </label>
          <label class="demo-label">
            Contacto *
            <input id="lab-contacto" name="contacto" class="demo-input" placeholder="Ej: +591 70000000" required />
          </label>
          <label class="demo-check">
            <input type="checkbox" id="lab-terminos" required />
            <span>Acepto: <em>${escaparHtml(cfg.terminosCondiciones)}</em></span>
          </label>
          <button type="submit" class="demo-btn">Publicar (Sincroniza al Instante)</button>
        </form>
      `,
      sino: (cfg) => {
        if (!cfg.habilitado) {
          return `
            <p class="demo-paused-alert">
              <strong>🔴 Formulario destruido del DOM por <code>renderCondicional</code>.</strong>
              El componente hermano <code>&lt;lab-panel-admin&gt;</code> desactivó este módulo.
            </p>
          `;
        }
        return `
          <p class="demo-paused-alert">
            <strong>🔐 Sesión Requerida:</strong> Administración exigió inicio de sesión para publicar.
          </p>
        `;
      },
      siempreActualizar: true
    });

    const stopLista = lista.suscribir((anuncios) => {
      const feed = this.querySelector('#lab-lista-empleos');
      if (!feed) return;
      feed.innerHTML = anuncios
        .map(
          (job) => `
          <li>
            <strong>${escaparHtml(job.titulo)}</strong> (${escaparHtml(job.puesto)})
            <small>📞 ${escaparHtml(job.contacto)} • Estado: ${escaparHtml(job.estado)}</small>
          </li>
        `
        )
        .join('');
    });

    const onSubmit = (event) => {
      if (event.target.id !== 'lab-form-empleo') return;
      event.preventDefault();
      const form = event.target;
      const titulo = form.querySelector('#lab-titulo').value.trim();
      const puesto = form.querySelector('#lab-puesto').value.trim();
      const contacto = form.querySelector('#lab-contacto').value.trim();
      if (!titulo || !puesto || !contacto) return;

      lista.set([
        { id: Date.now(), titulo, puesto, contacto, estado: 'activo' },
        ...lista.get()
      ]);
      form.reset();
    };

    this.addEventListener('submit', onSubmit);
    this._limpiezas.push(stopReglas, stopCondicional, stopLista, () => this.removeEventListener('submit', onSubmit));
  }

  disconnectedCallback() {
    this._limpiezas.forEach((fn) => fn());
    this._limpiezas = [];
  }
}

class LabPanelAdmin extends MitaElement {
  constructor() {
    super();
    this._limpiezas = [];
  }

  async render() {
    const config = obtenerEstadoCompartido('lab:empleos_config') || labConfigEmpleos;
    const lista = obtenerEstadoCompartido('lab:empleos_lista') || labListaEmpleos;

    this.innerHTML = `
      <article class="demo-panel">
        <header class="demo-panel-head">
          <h3>🛡️ Control Admin + Inspector</h3>
          <span class="demo-tag">&lt;lab-panel-admin&gt;</span>
        </header>

        <form id="lab-admin-form" class="demo-form">
          <label class="demo-check">
            <input type="checkbox" id="lab-chk-habilitado" />
            <span><strong>Habilitar Anuncios</strong> (controla &lt;lab-tablon-empleos&gt;)</span>
          </label>
          <label class="demo-check">
            <input type="checkbox" id="lab-chk-login" />
            <span><strong>Requerir inicio de sesión</strong></span>
          </label>
          <label class="demo-label">
            Términos y Condiciones (localStorage):
            <textarea id="lab-txt-terminos" class="demo-textarea"></textarea>
          </label>
          <label class="demo-label">
            Reglas de funcionalidad:
            <textarea id="lab-txt-reglas" class="demo-textarea"></textarea>
          </label>
          <button type="submit" class="demo-btn">Guardar Cambios</button>
        </form>

        <pre id="lab-inspector-json" class="demo-pre"></pre>
      </article>
    `;

    const pintarInspector = () => {
      const pre = this.querySelector('#lab-inspector-json');
      if (pre) pre.textContent = JSON.stringify(listarEstadosCompartidos(), null, 2);
    };

    const stopCfg = config.suscribir((cfg) => {
      const chkHab = this.querySelector('#lab-chk-habilitado');
      const chkLog = this.querySelector('#lab-chk-login');
      const txtTer = this.querySelector('#lab-txt-terminos');
      const txtReg = this.querySelector('#lab-txt-reglas');

      if (chkHab) chkHab.checked = Boolean(cfg.habilitado);
      if (chkLog) chkLog.checked = Boolean(cfg.requiereLogin);
      if (txtTer && document.activeElement !== txtTer) txtTer.value = cfg.terminosCondiciones;
      if (txtReg && document.activeElement !== txtReg) txtReg.value = cfg.reglasUso;
      pintarInspector();
    });

    const stopLista = lista.suscribir(() => pintarInspector());

    const onChange = (event) => {
      if (event.target.id === 'lab-chk-habilitado') {
        config.patch({ habilitado: event.target.checked });
      } else if (event.target.id === 'lab-chk-login') {
        config.patch({ requiereLogin: event.target.checked });
      }
    };

    const onSubmit = (event) => {
      if (event.target.id !== 'lab-admin-form') return;
      event.preventDefault();
      config.patch({
        habilitado: this.querySelector('#lab-chk-habilitado').checked,
        requiereLogin: this.querySelector('#lab-chk-login').checked,
        terminosCondiciones: this.querySelector('#lab-txt-terminos').value.trim(),
        reglasUso: this.querySelector('#lab-txt-reglas').value.trim()
      });
    };

    this.addEventListener('change', onChange);
    this.addEventListener('submit', onSubmit);

    this._limpiezas.push(
      stopCfg,
      stopLista,
      () => this.removeEventListener('change', onChange),
      () => this.removeEventListener('submit', onSubmit)
    );
  }

  disconnectedCallback() {
    this._limpiezas.forEach((fn) => fn());
    this._limpiezas = [];
  }
}

if (!customElements.get('lab-resumen-kpi')) customElements.define('lab-resumen-kpi', LabResumenKpi);
if (!customElements.get('lab-tablon-empleos')) customElements.define('lab-tablon-empleos', LabTablonEmpleos);
if (!customElements.get('lab-panel-admin')) customElements.define('lab-panel-admin', LabPanelAdmin);

// ============================================================================
// 3.5 WEB COMPONENT 100% RE-USABLE (<lab-tarjeta-reusable>)
// ============================================================================
class LabTarjetaReusable extends MitaElement {
  async render() {
    this.estadoInstancia = crearEstadoLocal({ usos: 0 });
    const titulo = this.getAttribute('titulo') || 'Tarjeta Reusable';
    const subtitulo = this.getAttribute('subtitulo') || '';
    const variante = this.getAttribute('variante') || 'info';
    const textoAccion = this.getAttribute('texto-accion') || 'Ejecutar';

    this.innerHTML = `
      <article class="reusable-card variante-${escaparHtml(variante)}">
        <header class="reusable-card-head">
          <h4>${escaparHtml(titulo)}</h4>
          <small class="demo-tag reusable-usos">0 clics</small>
        </header>
        <p>${escaparHtml(subtitulo)}</p>
        <button type="button" class="demo-btn reusable-btn">${escaparHtml(textoAccion)}</button>
      </article>
    `;

    const stopTexto = vincularTexto(
      this.estadoInstancia,
      this.querySelector('.reusable-usos'),
      (e) => `${e.usos} clics`
    );
    this.registrarLimpieza(stopTexto);

    const onClick = (event) => {
      if (!event.target.closest('.reusable-btn')) return;
      const usos = this.estadoInstancia.get().usos + 1;
      this.estadoInstancia.patch({ usos });
      this.dispatchEvent(
        new CustomEvent('tarjeta-accion', {
          detail: { titulo, variante, usos },
          bubbles: true
        })
      );
    };
    this.addEventListener('click', onClick);
    this.registrarLimpieza(() => this.removeEventListener('click', onClick));
    this.registrarLimpieza(() => this.estadoInstancia.destroy());
  }
}

if (!customElements.get('lab-tarjeta-reusable')) {
  customElements.define('lab-tarjeta-reusable', LabTarjetaReusable);
}

// ============================================================================
// 3.6 COMPONENTE <lab-cientifico-avatar> (Lección 13: Passing Props de React.dev)
// ============================================================================
class LabCientificoAvatar extends MitaElement {
  async render() {
    const { person, size } = leerPropsDeElemento(this, {
      size: 100,
      person: CIENTIFICOS_DEMO[0]
    });
    const url = obtenerUrlImagenCientifico(person, 's');

    this.innerHTML = `
      <figure class="scientist-card" data-scientist-name="${escaparHtml(person.name)}">
        <img
          class="avatar scientist-avatar-img"
          src="${escaparHtml(url)}"
          alt="${escaparHtml(person.name)}"
          width="${Number(size) || 80}"
          height="${Number(size) || 80}"
        />
        <figcaption>
          <strong>${escaparHtml(person.name)}</strong>
          <p>${escaparHtml(person.profesion || 'Científico/a')}</p>
          <small class="demo-tag">size={${Number(size) || 80}} • imageId="${escaparHtml(person.imageId)}"</small>
        </figcaption>
      </figure>
    `;
  }
}

if (!customElements.get('lab-cientifico-avatar')) {
  customElements.define('lab-cientifico-avatar', LabCientificoAvatar);
}

// ============================================================================
// 4. VISTA PRINCIPAL: <demo-laboratorio-signals> (Sandbox Split Semántico)
// ============================================================================
export class DemoLaboratorioSignals extends MitaElement {
  constructor() {
    super();
    this.leccionActiva = estadoLeccionActiva.get() || 'compartir';
    this.archivoActivoIdx = 0;
    this._limpiezasPreview = [];
    this._stopLeccion = null;
  }

  async render() {
    this.innerHTML = htmlTemplate;
    this.iniciarControlesSandbox();

    // Escuchar cambios de lección desde <mita-lab-nav> (dentro del <aside id="sidebar">)
    this._stopLeccion = estadoLeccionActiva.suscribir((clave) => {
      this.cargarLeccion(clave);
    });
  }

  limpiarPreview() {
    this._limpiezasPreview.forEach((fn) => fn());
    this._limpiezasPreview = [];
  }

  iniciarControlesSandbox() {
    const btnOpenLessons = this.querySelector('#btn-open-lessons');
    if (btnOpenLessons) {
      btnOpenLessons.addEventListener('click', () => {
        estadoSidebar.patch({ abierto: true });
        setTimeout(() => {
          const searchEl = document.querySelector('#lab-nav-search');
          if (searchEl instanceof HTMLElement) searchEl.focus();
        }, 50);
      });
    }

    const btnChallenge = this.querySelector('#btn-complete-lab-challenge');
    const gamifPill = this.querySelector('#lab-gamif-pill');
    const actualizarPillGamif = () => {
      const res = gestorGamificacionDocs.obtenerResumenGamificacion(28);
      if (gamifPill) {
        gamifPill.textContent = `${res.nivelActual} • ${res.puntosXP} XP`;
      }
    };
    actualizarPillGamif();

    if (btnChallenge) {
      btnChallenge.addEventListener('click', () => {
        gestorGamificacionDocs.marcarDocumentoComoLeido(`lab_${this.leccionActiva}`, 40);
        actualizarPillGamif();
        this.mostrarEstadoPreview('🏆 ¡Reto completado! +50 XP sumados a tu perfil');
      });
    }

    const tracksHub = this.querySelector('.lab-tracks-hub');
    if (tracksHub) {
      tracksHub.addEventListener('click', (event) => {
        const btn = event.target.closest('button[data-track-leccion]');
        if (!btn) return;
        const destino = btn.getAttribute('data-track-leccion');
        if (destino) estadoLeccionActiva.set(destino);
      });
    }

    const tabs = this.querySelector('#sandbox-tabs');
    if (tabs) {
      tabs.addEventListener('click', (event) => {
        const tab = event.target.closest('button[data-file-idx]');
        if (!tab) return;
        this.archivoActivoIdx = Number(tab.getAttribute('data-file-idx')) || 0;
        this.renderPestanasArchivo();
        this.renderEditorArchivo();
      });
    }

    const btnDownload = this.querySelector('#btn-sb-download');
    if (btnDownload) {
      btnDownload.addEventListener('click', () => this.descargarArchivoActual());
    }

    const btnReload = this.querySelector('#btn-sb-reload');
    if (btnReload) {
      btnReload.addEventListener('click', () => {
        this.renderPreviewLeccion();
        this.mostrarEstadoPreview('↻ Vista recargada');
      });
    }

    const btnReset = this.querySelector('#btn-sb-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        labConfigEmpleos.reset();
        labListaEmpleos.reset();
        this.renderEditorArchivo();
        this.renderPreviewLeccion();
        this.mostrarEstadoPreview('✕ Código y estado reiniciados');
      });
    }

    const btnExpand = this.querySelector('#btn-sb-expand');
    const workspace = this.querySelector('#sandbox-workspace');
    if (btnExpand && workspace) {
      btnExpand.addEventListener('click', () => {
        const expandido = workspace.classList.toggle('sandbox-expanded');
        btnExpand.setAttribute('aria-expanded', String(expandido));
        btnExpand.textContent = expandido ? '⌃ Mostrar menos' : '⌄ Mostrar más';
      });
    }

    const cheatsheetGrid = this.querySelector('#lab-cheatsheet-grid');
    if (cheatsheetGrid) {
      cheatsheetGrid.addEventListener('click', (event) => {
        const btn = event.target.closest('button[data-ir-leccion]');
        if (!btn) return;
        const destino = btn.getAttribute('data-ir-leccion');
        if (destino) {
          estadoLeccionActiva.set(destino);
          const sandboxCard = this.querySelector('.sandbox-card');
          if (sandboxCard && typeof sandboxCard.scrollIntoView === 'function') {
            sandboxCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    }
  }

  mostrarEstadoPreview(texto) {
    const out = this.querySelector('#preview-status');
    if (out) out.textContent = texto;
  }

  cargarLeccion(clave) {
    this.leccionActiva = LECCIONES[clave] ? clave : 'compartir';
    this.archivoActivoIdx = 0;

    const leccion = LECCIONES[this.leccionActiva];
    const stepEl = this.querySelector('#lab-active-step');
    const titleEl = this.querySelector('#lab-active-title');
    const goalEl = this.querySelector('#lab-active-goal');
    const tryEl = this.querySelector('#lab-active-try');
    const heading = this.querySelector('#preview-heading');

    if (stepEl) stepEl.textContent = leccion.paso;
    if (titleEl) titleEl.textContent = leccion.titulo;
    if (goalEl) goalEl.textContent = leccion.objetivo;
    if (tryEl) tryEl.textContent = leccion.comoProbar;
    if (heading) heading.textContent = leccion.tituloPreview;

    this.renderPestanasArchivo();
    this.renderEditorArchivo();
    this.renderPreviewLeccion();
    this.mostrarEstadoPreview('● Reactivo');
  }

  renderPestanasArchivo() {
    const tabs = this.querySelector('#sandbox-tabs');
    if (!tabs) return;
    const archivos = LECCIONES[this.leccionActiva].archivos;
    tabs.innerHTML = archivos
      .map(
        (file, idx) => `
        <button
          type="button"
          role="tab"
          class="sandbox-tab-btn"
          data-file-idx="${idx}"
          aria-selected="${idx === this.archivoActivoIdx ? 'true' : 'false'}"
        >${escaparHtml(file.nombre)}</button>
      `
      )
      .join('');
  }

  renderEditorArchivo() {
    const slot = this.querySelector('#sandbox-editor-slot');
    if (!slot) return;
    const archivo = LECCIONES[this.leccionActiva].archivos[this.archivoActivoIdx];
    if (!archivo) return;

    slot.innerHTML = `
      <mita-code-editor archivo="${escaparHtml(archivo.nombre)}" lenguaje="javascript" editable="true">
        <code>${escaparHtml(archivo.codigo)}</code>
      </mita-code-editor>
    `;
  }

  descargarArchivoActual() {
    const archivo = LECCIONES[this.leccionActiva].archivos[this.archivoActivoIdx];
    const editor = this.querySelector('mita-code-editor');
    const contenido = editor?.codigoLimpio || archivo?.codigo || '';
    if (!archivo || typeof Blob === 'undefined' || typeof URL.createObjectURL !== 'function') return;

    const blob = new Blob([contenido], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = archivo.nombre;
    link.click();
    URL.revokeObjectURL(url);
    this.mostrarEstadoPreview(`⬇ Descargado ${archivo.nombre}`);
  }

  renderPreviewLeccion() {
    this.limpiarPreview();
    const stage = this.querySelector('#sandbox-preview-slot');
    if (!stage) return;

    if (this.leccionActiva === 'compartir') {
      stage.innerHTML = `
        <figure id="flow-diagram-live" class="flow-diagram">
          <figcaption>
            <span>📡 Flujo Visual en Tiempo Real (Sin Props Drilling)</span>
            <button type="button" id="btn-flow-simular" class="demo-btn">⚡ Simular Toggle Admin</button>
          </figcaption>
          <ol class="flow-nodes">
            <li id="flow-node-emisor" class="flow-node">
              <strong>1. Emisor</strong>
              <span><code>&lt;lab-panel-admin&gt;</code></span>
              <small>.patch({ habilitado })</small>
            </li>
            <li class="flow-arrow" aria-hidden="true">──▶</li>
            <li id="flow-node-signal" class="flow-node flow-node-hub">
              <strong>2. Signal Compartido</strong>
              <span id="flow-signal-state">...</span>
              <small>localStorage sincronizado</small>
            </li>
            <li class="flow-arrow" aria-hidden="true">──▶</li>
            <li id="flow-node-receptor" class="flow-node">
              <strong>3. Receptores</strong>
              <span>Tablón + KPI Derivado</span>
              <small id="flow-receptor-state">...</small>
            </li>
          </ol>
        </figure>
        <lab-resumen-kpi></lab-resumen-kpi>
        <lab-tablon-empleos></lab-tablon-empleos>
        <lab-panel-admin></lab-panel-admin>
      `;

      const pulsarFlujo = () => {
        const nodos = [
          stage.querySelector('#flow-node-emisor'),
          stage.querySelector('#flow-node-signal'),
          stage.querySelector('#flow-node-receptor')
        ];
        nodos.forEach((n) => n?.classList.add('flow-active'));
        setTimeout(() => nodos.forEach((n) => n?.classList.remove('flow-active')), 450);
      };

      const stopFlowCfg = labConfigEmpleos.suscribir((cfg) => {
        const sigEl = stage.querySelector('#flow-signal-state');
        const recEl = stage.querySelector('#flow-receptor-state');
        if (sigEl) sigEl.textContent = `habilitado: ${cfg.habilitado} | login: ${cfg.requiereLogin}`;
        if (recEl) recEl.textContent = cfg.habilitado ? 'Formulario MONTADO en DOM' : 'Formulario DESTRUIDO';
        pulsarFlujo();
      });

      const stopFlowLista = labListaEmpleos.suscribir((lista) => {
        const recEl = stage.querySelector('#flow-receptor-state');
        if (recEl) recEl.textContent = `${lista.length} anuncios | habilitado: ${labConfigEmpleos.get().habilitado}`;
        pulsarFlujo();
      });

      const onSimular = (event) => {
        if (event.target.id !== 'btn-flow-simular') return;
        labConfigEmpleos.patch({ habilitado: !labConfigEmpleos.get().habilitado });
      };

      stage.addEventListener('click', onSimular);
      this._limpiezasPreview.push(stopFlowCfg, stopFlowLista, () => stage.removeEventListener('click', onSimular));
      return;
    }

    if (this.leccionActiva === 'condicional') {
      const sesion = crearEstadoLocal({ rol: 'invitado' });
      stage.innerHTML = `
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>🔀 Cambiar Rol Reactivo</h3>
            <span class="demo-tag">renderCondicional</span>
          </header>
          <nav class="demo-btn-group" aria-label="Selector de rol">
            <button type="button" class="demo-btn demo-btn-ghost" data-rol="invitado">Invitado</button>
            <button type="button" class="demo-btn demo-btn-ghost" data-rol="editor">Editor</button>
            <button type="button" class="demo-btn" data-rol="admin">Admin</button>
          </nav>
          <section id="condicional-stage"></section>
          <output id="condicional-dom-count" class="demo-log-output"></output>
        </article>
      `;

      const zona = stage.querySelector('#condicional-stage');
      const outDom = stage.querySelector('#condicional-dom-count');
      const stopCond = renderCondicional({
        estado: sesion,
        contenedor: zona,
        cuando: (s) => s.rol === 'admin',
        mostrar: () => `
          <section id="panel-secreto-admin" class="demo-panel">
            <strong>🛡️ Panel Exclusivo Admin Montado en el DOM</strong>
            <p>Este nodo solo existe en memoria cuando <code>rol === 'admin'</code>.</p>
          </section>
        `,
        sino: (s) => `
          <p class="demo-paused-alert">
            Vista pública (rol actual: <strong>${escaparHtml(s.rol)}</strong>). El nodo <code>#panel-secreto-admin</code> NO existe en el DOM.
          </p>
        `,
        siempreActualizar: true
      });

      const stopLog = sesion.suscribir(() => {
        const existe = Boolean(stage.querySelector('#panel-secreto-admin'));
        if (outDom) {
          outDom.textContent = `DOM Check: #panel-secreto-admin en documento = ${existe}`;
        }
      });

      const onClickRol = (event) => {
        const btn = event.target.closest('button[data-rol]');
        if (!btn) return;
        sesion.patch({ rol: btn.getAttribute('data-rol') });
      };

      stage.addEventListener('click', onClickRol);
      this._limpiezasPreview.push(stopCond, stopLog, () => stage.removeEventListener('click', onClickRol), () => sesion.destroy());
      return;
    }

    if (this.leccionActiva === 'local') {
      const estado = crearEstadoLocal({ clicks: 0, nombre: 'Victor Code' });
      stage.innerHTML = `
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>🏠 Estado Local + vincularTexto</h3>
            <span class="demo-tag">0 re-render innerHTML</span>
          </header>
          <p id="local-saludo-out"></p>
          <strong id="local-clicks-out"></strong>
          <label class="demo-label">
            Escribe tu nombre:
            <input id="local-nombre-input" class="demo-input" value="Victor Code" />
          </label>
          <nav class="demo-btn-group">
            <button type="button" id="local-btn-mas" class="demo-btn">+1 Click</button>
            <button type="button" id="local-btn-menos" class="demo-btn demo-btn-ghost">-1</button>
            <button type="button" id="local-btn-reset" class="demo-btn demo-btn-ghost">Reset</button>
          </nav>
          <output class="demo-log-output">✅ Mismo TextNode preservado en cada mutación.</output>
        </article>
      `;

      const stopClicks = vincularTexto(estado, stage.querySelector('#local-clicks-out'), (e) => `Clicks acumulados: ${e.clicks}`);
      const stopSaludo = vincularTexto(estado, stage.querySelector('#local-saludo-out'), (e) => `Hola, ${e.nombre || 'invitado'} 👋`);

      const onClick = (event) => {
        if (event.target.id === 'local-btn-mas') estado.patch({ clicks: estado.get().clicks + 1 });
        if (event.target.id === 'local-btn-menos') estado.patch({ clicks: estado.get().clicks - 1 });
        if (event.target.id === 'local-btn-reset') estado.reset();
      };
      const onInput = (event) => {
        if (event.target.id === 'local-nombre-input') estado.patch({ nombre: event.target.value });
      };

      stage.addEventListener('click', onClick);
      stage.addEventListener('input', onInput);
      this._limpiezasPreview.push(
        stopClicks,
        stopSaludo,
        () => stage.removeEventListener('click', onClick),
        () => stage.removeEventListener('input', onInput),
        () => estado.destroy()
      );
      return;
    }

    if (this.leccionActiva === 'efectos') {
      const precio = crearEstadoLocal(35);
      const cantidad = crearEstadoLocal(2);
      const totalConIva = cantidad.derivar((c) => (c * precio.get() * 1.13).toFixed(2));

      const filasAuditor = listarEstadosCompartidos()
        .map(
          (st) => `
          <tr>
            <td><code>${escaparHtml(st.nombre)}</code></td>
            <td>${st.suscriptores}</td>
            <td><code>${escaparHtml(st.persistKey || 'memoria')}</code></td>
          </tr>
        `
        )
        .join('');

      stage.innerHTML = `
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>⚡ crearEfecto + Signal.derivar</h3>
            <span class="demo-tag">Auto-tracking</span>
          </header>
          <label class="demo-label">
            Precio (Bs.):
            <input type="number" id="ef-precio" class="demo-input" value="35" min="1" />
          </label>
          <label class="demo-label">
            Cantidad:
            <input type="number" id="ef-cantidad" class="demo-input" value="2" min="1" />
          </label>
          <output id="ef-total-out" class="demo-log-output"></output>
        </article>

        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>📋 Auditoría listarEstadosCompartidos()</h3>
            <span class="demo-tag">Admin</span>
          </header>
          <table class="demo-table">
            <thead>
              <tr><th>Estado</th><th>Suscriptores</th><th>Storage Key</th></tr>
            </thead>
            <tbody>${filasAuditor}</tbody>
          </table>
        </article>
      `;

      const stopEfecto = crearEfecto(() => {
        const p = precio.get();
        const c = cantidad.get();
        const out = stage.querySelector('#ef-total-out');
        if (out) {
          out.textContent = `Subtotal: Bs. ${(p * c).toFixed(2)} | Derivado (+13%): Bs. ${totalConIva.get()}`;
        }
      });

      const onInput = (event) => {
        if (event.target.id === 'ef-precio') precio.set(Number(event.target.value) || 0);
        if (event.target.id === 'ef-cantidad') cantidad.set(Number(event.target.value) || 0);
      };

      stage.addEventListener('input', onInput);
      this._limpiezasPreview.push(
        stopEfecto,
        () => stage.removeEventListener('input', onInput),
        () => totalConIva.destroy(),
        () => precio.destroy(),
        () => cantidad.destroy()
      );
      return;
    }

    if (this.leccionActiva === 'reusables') {
      stage.innerHTML = `
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>♻️ 3 Instancias del Mismo Componente</h3>
            <span class="demo-tag">&lt;lab-tarjeta-reusable&gt;</span>
          </header>
          <section id="reusable-instances" class="reusable-grid">
            <lab-tarjeta-reusable
              titulo="Anuncios de Empleo"
              subtitulo="Abierto al público sin login"
              variante="exito"
              texto-accion="Publicar oferta"
            ></lab-tarjeta-reusable>
            <lab-tarjeta-reusable
              titulo="Reglas y Términos"
              subtitulo="Editables solo por Admin"
              variante="alerta"
              texto-accion="Revisar reglas"
            ></lab-tarjeta-reusable>
            <lab-tarjeta-reusable
              titulo="Auditoría Signals"
              subtitulo="Inspección localStorage en vivo"
              variante="info"
              texto-accion="Inspeccionar"
            ></lab-tarjeta-reusable>
          </section>
          <output id="reusable-event-log" class="demo-log-output">
            👂 Padre esperando evento CustomEvent('tarjeta-accion')...
          </output>
          <nav class="demo-btn-group">
            <button type="button" id="btn-add-reusable" class="demo-btn demo-btn-ghost">
              + Clonar Nueva Instancia Reusable
            </button>
          </nav>
        </article>
      `;

      let contadorInstancias = 3;
      const onEventoTarjeta = (event) => {
        const log = stage.querySelector('#reusable-event-log');
        const detail = event.detail || {};
        if (log) {
          log.textContent = `📡 Evento 'tarjeta-accion' recibido desde "${detail.titulo}" (variante: ${detail.variante}, usos propios: ${detail.usos})`;
        }
      };

      const onAddInstancia = (event) => {
        if (event.target.id !== 'btn-add-reusable') return;
        contadorInstancias++;
        const grid = stage.querySelector('#reusable-instances');
        if (!grid) return;
        const nueva = document.createElement('lab-tarjeta-reusable');
        nueva.setAttribute('titulo', `Instancia Dinámica #${contadorInstancias}`);
        nueva.setAttribute('subtitulo', 'Estado local aislado creado en tiempo real');
        nueva.setAttribute('variante', contadorInstancias % 2 === 0 ? 'exito' : 'info');
        nueva.setAttribute('texto-accion', 'Probar instancia');
        grid.appendChild(nueva);
      };

      stage.addEventListener('tarjeta-accion', onEventoTarjeta);
      stage.addEventListener('click', onAddInstancia);
      this._limpiezasPreview.push(
        () => stage.removeEventListener('tarjeta-accion', onEventoTarjeta),
        () => stage.removeEventListener('click', onAddInstancia)
      );
      return;
    }

    if (this.leccionActiva === 'comparativa') {
      const demoSig = crearEstadoLocal({ count: 1, activo: true });
      const doble = demoSig.derivar((s) => s.count * 2);

      stage.innerHTML = `
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>🚀 Prueba en Vivo cada Mejora v2.7.0</h3>
            <span class="demo-tag">Antes vs Después</span>
          </header>
          <ul class="compare-checklist">
            <li class="compare-row">
              <span><strong>1. crearEfecto + .derivar()</strong> — Auto-rastreo sin boilerplate</span>
              <button type="button" class="demo-btn" data-test-v27="efecto">Probar (+1)</button>
            </li>
            <li class="compare-row">
              <span><strong>2. renderCondicional declarativo</strong> — Destruye/monta sin display: none</span>
              <button type="button" class="demo-btn demo-btn-ghost" data-test-v27="condicional">Alternar ON/OFF</button>
            </li>
            <li class="compare-row">
              <span><strong>3. listarEstadosCompartidos()</strong> — Auditoría de estados globales</span>
              <button type="button" class="demo-btn demo-btn-ghost" data-test-v27="auditar">Auditar Ahora</button>
            </li>
          </ul>
          <section id="v27-cond-mount"></section>
          <output id="v27-compare-out" class="demo-log-output"></output>
        </article>
      `;

      const stopCond = renderCondicional({
        estado: demoSig,
        contenedor: stage.querySelector('#v27-cond-mount'),
        cuando: (s) => s.activo,
        mostrar: (s) => `<p class="demo-rules-note">🟢 Bloque ACTIVO en DOM (count=${s.count}, doble=${doble.get()})</p>`,
        sino: () => `<p class="demo-paused-alert">🔴 Bloque desmontado limpiamente por renderCondicional()</p>`,
        siempreActualizar: true
      });

      const stopEf = crearEfecto(() => {
        const out = stage.querySelector('#v27-compare-out');
        if (out) {
          out.textContent = `⚡ crearEfecto() => count=${demoSig.get().count} | derivado doble=${doble.get()} | activo=${demoSig.get().activo}`;
        }
      });

      const onClickTest = (event) => {
        const btn = event.target.closest('button[data-test-v27]');
        if (!btn) return;
        const tipo = btn.getAttribute('data-test-v27');
        if (tipo === 'efecto') {
          demoSig.patch({ count: demoSig.get().count + 1 });
        } else if (tipo === 'condicional') {
          demoSig.patch({ activo: !demoSig.get().activo });
        } else if (tipo === 'auditar') {
          const out = stage.querySelector('#v27-compare-out');
          const nombres = listarEstadosCompartidos().map((s) => s.nombre).join(', ');
          if (out) out.textContent = `📋 Estados compartidos activos: ${nombres}`;
        }
      };

      stage.addEventListener('click', onClickTest);
      this._limpiezasPreview.push(
        stopCond,
        stopEf,
        () => stage.removeEventListener('click', onClickTest),
        () => doble.destroy(),
        () => demoSig.destroy()
      );
      return;
    }

    if (this.leccionActiva === 'chat') {
      const filtroChat = crearEstadoLocal({ busqueda: '', canal: 'todos' });
      const guardian = crearControlSpam({
        cooldownMs: 800,
        maxLongitud: 200,
        palabrasProhibidas: ['spam', 'casino', 'phishing', 'estafa'],
        bloquearLinks: true,
        bloquearDuplicados: true
      });

      stage.innerHTML = `
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>💬 Sala de Chat + Novedades</h3>
            <button type="button" id="btn-open-novedad" class="demo-btn">📣 Publicar Novedad (Modal)</button>
          </header>

          <search class="demo-btn-group">
            <input
              type="search"
              id="chat-search-input"
              class="demo-input"
              placeholder="🔍 Buscar en el chat..."
            />
            <select id="chat-channel-select" class="demo-input" aria-label="Filtrar por canal">
              <option value="todos">Todos los canales</option>
              <option value="general">💬 General</option>
              <option value="novedad">📣 Novedades</option>
              <option value="soporte">🛠️ Soporte</option>
            </select>
          </search>

          <ul id="chat-messages-list" class="demo-jobs-ul"></ul>

          <form id="chat-send-form" class="demo-form">
            <label class="demo-label">
              Autor:
              <input id="chat-autor-input" class="demo-input" value="Usuario Demo" required />
            </label>
            <label class="demo-label">
              Mensaje (protegido por <code>crearControlSpam</code>):
              <input id="chat-texto-input" class="demo-input" placeholder="Escribe un mensaje limpio..." required />
            </label>
            <nav class="demo-btn-group">
              <button type="submit" class="demo-btn">Enviar Mensaje</button>
              <button type="button" id="btn-test-spam" class="demo-btn demo-btn-ghost">🚫 Simular Spam ("casino")</button>
              <button type="button" id="btn-test-link" class="demo-btn demo-btn-ghost">🚫 Simular Link Externo</button>
            </nav>
          </form>

          <output id="chat-guard-status" class="demo-log-output">
            🛡️ Escudo Anti-Spam activo (cooldown, anti-duplicados, bloqueo de links y palabras prohibidas).
          </output>

          <mita-dialog id="lab-modal-novedad">
            <span slot="titulo">📣 Publicar Novedad o Notificación Oficial</span>
            <form id="form-modal-novedad" class="demo-form">
              <label class="demo-label">
                Título de la Novedad:
                <input id="novedad-titulo" class="demo-input" placeholder="Ej: Nueva versión v2.7.1 lista" required />
              </label>
              <label class="demo-label">
                Detalle:
                <textarea id="novedad-detalle" class="demo-textarea" placeholder="Describe la notificación..." required></textarea>
              </label>
              <nav class="demo-btn-group">
                <button type="submit" class="demo-btn">Publicar en el Feed</button>
              </nav>
            </form>
          </mita-dialog>
        </article>
      `;

      const stopRenderChat = crearEfecto(() => {
        const { busqueda, canal } = filtroChat.get();
        const filtrados = filtrarColeccion(labChatMensajes.get(), {
          busqueda,
          categoria: canal,
          campoCategoria: 'canal',
          camposTexto: ['autor', 'texto', 'canal']
        });

        const ul = stage.querySelector('#chat-messages-list');
        if (!ul) return;
        if (filtrados.length === 0) {
          ul.innerHTML = `<li><em>No hay mensajes que coincidan con el filtro actual.</em></li>`;
          return;
        }
        ul.innerHTML = filtrados
          .map(
            (m) => `
            <li>
              <header class="reusable-card-head">
                <strong>${escaparHtml(m.autor)}</strong>
                <span class="demo-tag">${escaparHtml(m.canal)}</span>
              </header>
              <span>${escaparHtml(m.texto)}</span>
            </li>
          `
          )
          .join('');
      });

      const statusOut = stage.querySelector('#chat-guard-status');
      const procesarEnvio = (autor, texto, canal = 'general') => {
        const evalRes = guardian.evaluarMensaje(texto, autor);
        if (!evalRes.permitido) {
          if (statusOut) statusOut.textContent = `❌ Bloqueado: ${evalRes.motivo}`;
          return false;
        }
        labChatMensajes.set([
          { id: Date.now(), autor, canal, texto: evalRes.textoLimpio },
          ...labChatMensajes.get()
        ]);
        if (statusOut) statusOut.textContent = `✅ Mensaje aprobado y publicado en canal "${canal}".`;
        return true;
      };

      const onInputFiltro = (e) => {
        if (e.target.id === 'chat-search-input') filtroChat.patch({ busqueda: e.target.value });
        if (e.target.id === 'chat-channel-select') filtroChat.patch({ canal: e.target.value });
      };

      const onClickChat = (e) => {
        const modal = stage.querySelector('#lab-modal-novedad');
        if (e.target.id === 'btn-open-novedad' && modal) {
          modal.abrir();
        } else if (e.target.id === 'btn-test-spam') {
          procesarEnvio('Bot Spam', 'Gana dinero facil en este casino online', 'general');
        } else if (e.target.id === 'btn-test-link') {
          procesarEnvio('Bot Link', 'Mira https://spam.ejemplo.com', 'general');
        }
      };

      const onSubmitChat = (e) => {
        if (e.target.id === 'chat-send-form') {
          e.preventDefault();
          const autor = stage.querySelector('#chat-autor-input').value.trim() || 'Invitado';
          const inputTxt = stage.querySelector('#chat-texto-input');
          if (procesarEnvio(autor, inputTxt.value, 'general')) {
            inputTxt.value = '';
          }
        } else if (e.target.id === 'form-modal-novedad') {
          e.preventDefault();
          const modal = stage.querySelector('#lab-modal-novedad');
          const tit = stage.querySelector('#novedad-titulo').value.trim();
          const det = stage.querySelector('#novedad-detalle').value.trim();
          if (tit && det) {
            labChatMensajes.set([
              { id: Date.now(), autor: 'Equipo MitaDOM', canal: 'novedad', texto: `📣 ${tit}: ${det}` },
              ...labChatMensajes.get()
            ]);
            e.target.reset();
            if (modal) modal.cerrar();
            if (statusOut) statusOut.textContent = `📣 Novedad oficial publicada mediante <mita-dialog>.`;
          }
        }
      };

      stage.addEventListener('input', onInputFiltro);
      stage.addEventListener('change', onInputFiltro);
      stage.addEventListener('click', onClickChat);
      stage.addEventListener('submit', onSubmitChat);

      this._limpiezasPreview.push(
        stopRenderChat,
        () => stage.removeEventListener('input', onInputFiltro),
        () => stage.removeEventListener('change', onInputFiltro),
        () => stage.removeEventListener('click', onClickChat),
        () => stage.removeEventListener('submit', onSubmitChat),
        () => filtroChat.destroy()
      );
      return;
    }

    if (this.leccionActiva === 'estrategias') {
      const modoSignal = crearEstadoLocal('hybrid');

      class VistaDemoUniversal {
        async onInit(ctx) {
          this.plato = 'Majadito de Pato Cruceño';
          this.estrategia = ctx.modo || 'hybrid';
          MitaMeta.useHead({
            title: `MitaDOM v2.7 (${String(this.estrategia).toUpperCase()})`,
            meta: [{ name: 'description', content: `Renderizado con estrategia ${this.estrategia} e Islas Light DOM.` }]
          });
        }

        render() {
          return [
            '<article data-vista="universal">',
            '  <header mita-server="only">',
            `    <h4>🍽️ ${this.plato} (${this.estrategia})</h4>`,
            '    <small>Isla mita-server="only": Cero hidratación en cliente</small>',
            '  </header>',
            '  <mita-carrito-interactivo mita-client="only">🛒 Carrito Cliente</mita-carrito-interactivo>',
            '</article>'
          ].join('\n');
        }
      }

      stage.innerHTML = `
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>🌐 Selector de Estrategia Universal</h3>
            <span id="ssr-badge-mode" class="demo-tag">HYBRID</span>
          </header>

          <nav class="demo-btn-group" aria-label="Estrategias de renderizado">
            <button type="button" class="demo-btn" data-ssr-mode="hybrid">🏝️ Hybrid (Islands)</button>
            <button type="button" class="demo-btn demo-btn-ghost" data-ssr-mode="ssr">🖥️ SSR Dinámico</button>
            <button type="button" class="demo-btn demo-btn-ghost" data-ssr-mode="ssg">📄 SSG Estático</button>
            <button type="button" class="demo-btn demo-btn-ghost" data-ssr-mode="csr">⚡ CSR / SPA</button>
          </nav>

          <p id="ssr-mode-explanation" class="demo-rules-note"></p>

          <section class="demo-form">
            <strong class="demo-label">1. &lt;head&gt; SEO generado por <code>MitaMeta.renderSSRHead()</code>:</strong>
            <pre id="ssr-head-out" class="demo-pre"></pre>
          </section>

          <section class="demo-form">
            <strong class="demo-label">2. HTML resultante de <code>renderizarVistaUniversal()</code>:</strong>
            <pre id="ssr-html-out" class="demo-pre"></pre>
          </section>
        </article>
      `;

      const explicaciones = {
        hybrid: '🏝️ Hybrid: Renderiza HTML en servidor y vacía el interior de <tag mita-client="only"></tag> para hidratar solo esa isla en el navegador.',
        ssr: '🖥️ SSR: Ejecuta onInit() por cada petición HTTP y limpia las islas exclusivas de cliente para evitar errores en Node.js.',
        ssg: '📄 SSG: Pre-genera HTML estático en tiempo de compilación (Build Time) e inyecta window.__MITA_SSG__ = true.',
        csr: '⚡ CSR / SPA: Entrega el contenedor shell instantáneo para que el Router del navegador monte los Web Components en el cliente.'
      };

      const actualizarSimulacion = async (modo) => {
        const res = await renderizarVistaUniversal(VistaDemoUniversal, {
          url: '/restaurante/menu',
          modo,
          contexto: { modo }
        });
        const badge = stage.querySelector('#ssr-badge-mode');
        const exp = stage.querySelector('#ssr-mode-explanation');
        const headOut = stage.querySelector('#ssr-head-out');
        const htmlOut = stage.querySelector('#ssr-html-out');

        if (badge) badge.textContent = res.modoAplicado.toUpperCase();
        if (exp) exp.textContent = explicaciones[res.modoAplicado] || '';
        if (headOut) headOut.textContent = res.head;
        if (htmlOut) htmlOut.textContent = res.body;
      };

      const stopModo = modoSignal.suscribir((modo) => {
        actualizarSimulacion(modo);
      });

      const onClickModo = (event) => {
        const btn = event.target.closest('button[data-ssr-mode]');
        if (!btn) return;
        stage.querySelectorAll('button[data-ssr-mode]').forEach((b) => b.classList.add('demo-btn-ghost'));
        btn.classList.remove('demo-btn-ghost');
        modoSignal.set(btn.getAttribute('data-ssr-mode'));
      };

      stage.addEventListener('click', onClickModo);
      this._limpiezasPreview.push(
        stopModo,
        () => stage.removeEventListener('click', onClickModo),
        () => modoSignal.destroy()
      );
      return;
    }

    if (this.leccionActiva === 'authcookies') {
      const authCtrl = crearControladorAuth({
        nombreEstado: 'lab:auth_demo',
        persistirLocal: true
      });

      const consentCtrl = crearGestorConsentimiento({
        nombreEstado: 'lab:cookies_demo',
        persistirLocal: true
      });

      stage.innerHTML = `
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>🔐 1. Flujo Auth Condicional (FormBuilder)</h3>
            <span class="demo-tag">crearControladorAuth</span>
          </header>
          <section id="lab-auth-mount"></section>
          <section id="lab-reusable-form-extra"></section>
        </article>

        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>🍪 2. Términos, Cookies y Analíticas Condicionales</h3>
            <span id="cookies-status-badge" class="demo-tag">...</span>
          </header>
          <p class="demo-rules-note">
            <code>registrarAnalitica()</code> verifica automáticamente que <code>terminosAceptados</code> y <code>cookiesAnaliticas</code> sean <code>true</code> antes de registrar eventos.
          </p>
          <nav class="demo-btn-group">
            <button type="button" id="btn-cookies-all" class="demo-btn">✅ Aceptar Todo (Términos + Analíticas)</button>
            <button type="button" id="btn-cookies-essential" class="demo-btn demo-btn-ghost">🛡️ Solo Esenciales</button>
            <button type="button" id="btn-cookies-revoke" class="demo-btn demo-btn-ghost">✕ Revocar</button>
            <button type="button" id="btn-fire-analytics" class="demo-btn">📊 Disparar Evento Analítica</button>
          </nav>
          <output id="cookies-analytics-log" class="demo-log-output"></output>
        </article>
      `;

      const stopAuth = authCtrl.montarFlujoCondicional(stage.querySelector('#lab-auth-mount'));

      const formExtra = crearFormularioReusable({
        id: 'lab-quick-feedback-form',
        titulo: '📝 FormBuilder Reusable: Sugerencia Rápida',
        submitText: 'Validar con FormBuilder',
        fields: [
          {
            name: 'modulo',
            label: 'Módulo evaluado',
            placeholder: 'Ej: Auth + Cookies',
            required: true,
            minLength: 3
          }
        ],
        onSubmit: (datos) => {
          const out = stage.querySelector('#cookies-analytics-log');
          if (out) out.textContent = `✅ FormBuilder validó: modulo="${datos.modulo}"`;
        }
      });
      const stopFormExtra = formExtra.montarEn(stage.querySelector('#lab-reusable-form-extra'));

      const stopConsent = consentCtrl.estado.suscribir((st) => {
        const badge = stage.querySelector('#cookies-status-badge');
        const log = stage.querySelector('#cookies-analytics-log');
        if (badge) {
          badge.textContent = st.cookiesAnaliticas ? '🟢 Analíticas ON' : '🔴 Analíticas Bloqueadas';
        }
        if (log) {
          log.textContent = `Estado: terminos=${st.terminosAceptados} | analiticas=${st.cookiesAnaliticas} | eventos registrados=${st.eventosAnalitica.length}`;
        }
      });

      const onClickCookies = (event) => {
        const log = stage.querySelector('#cookies-analytics-log');
        if (event.target.id === 'btn-cookies-all') {
          consentCtrl.aceptarTodo();
        } else if (event.target.id === 'btn-cookies-essential') {
          consentCtrl.soloEsenciales();
        } else if (event.target.id === 'btn-cookies-revoke') {
          consentCtrl.revocarConsentimiento();
        } else if (event.target.id === 'btn-fire-analytics') {
          const res = consentCtrl.registrarAnalitica('click_demo_laboratorio', { origen: 'leccion_9' });
          if (log) {
            log.textContent = res.enviado
              ? `📊 Evento "${res.evento.evento}" registrado (#${consentCtrl.estado.get().eventosAnalitica.length})`
              : `🚫 Analítica bloqueada: ${res.motivo}`;
          }
        }
      };

      stage.addEventListener('click', onClickCookies);
      this._limpiezasPreview.push(
        stopAuth,
        stopFormExtra,
        stopConsent,
        () => stage.removeEventListener('click', onClickCookies)
      );
      return;
    }

    if (this.leccionActiva === 'rustguard') {
      const estadoRust = crearEstadoReactivoInmutable('lab:rust_demo', {
        titular: 'Victor Code',
        saldoBs: 1000
      });
      const ambitoDemo = crearAmbitoConLimpiezaAutomatica('<demo-rust-scope>');

      stage.innerHTML = `
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>🦀 1. Rust Borrow Checker (&amp;T / &amp;mut T) + RAII Drop</h3>
            <span id="rust-scope-badge" class="demo-tag">Activos: 1</span>
          </header>
          <p id="rust-state-view" class="demo-rules-note"></p>
          <nav class="demo-btn-group">
            <button type="button" id="btn-rust-violate" class="demo-btn demo-btn-ghost">
              🚫 Intentar Mutar &amp;T Directo (Bloqueado)
            </button>
            <button type="button" id="btn-rust-mutate" class="demo-btn">
              ✍️ mutarEstadoConHistorial (+Bs. 250)
            </button>
            <button type="button" id="btn-rust-drop" class="demo-btn demo-btn-ghost">
              🦀 liberarMemoriaCompleta (RAII Drop)
            </button>
          </nav>
          <output id="rust-guard-log" class="demo-log-output">
            🛡️ Borrow Checker activo: las lecturas están congeladas con Object.freeze recursivo.
          </output>
        </article>

        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>🛠️ 2. Simulador Interactivo CLI (<code>npx mita</code>)</h3>
            <span class="demo-tag">Angular / Vue / Solid / Cargo</span>
          </header>
          <nav class="demo-btn-group">
            <button type="button" class="demo-btn" data-cli-cmd="mita g component TarjetaEmpleo">
              g component TarjetaEmpleo
            </button>
            <button type="button" class="demo-btn demo-btn-ghost" data-cli-cmd="mita g store empleos">
              g store empleos
            </button>
            <button type="button" class="demo-btn demo-btn-ghost" data-cli-cmd="mita g page Catalogo --hybrid">
              g page Catalogo --hybrid
            </button>
            <button type="button" class="demo-btn demo-btn-ghost" data-cli-cmd="mita doctor">
              🩺 mita doctor
            </button>
          </nav>
          <pre id="cli-sim-out" class="demo-pre"></pre>
        </article>

        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>🧪 3. Tests Automáticos + Checklist Manual en Vivo</h3>
            <button type="button" id="btn-run-autotests" class="demo-btn">
              ▶ Ejecutar Suite Automática
            </button>
          </header>
          <ul id="autotests-results-list" class="demo-jobs-ul"></ul>
        </article>
      `;

      const actualizarVistaRust = () => {
        const snap = leerEstadoInmutable(estadoRust);
        const view = stage.querySelector('#rust-state-view');
        const badge = stage.querySelector('#rust-scope-badge');
        const salud = ambitoDemo.auditarSaludDeMemoria();
        if (view) {
          view.textContent = `Estado Inmutable (&T): titular="${snap.titular}" | saldo=Bs. ${snap.saldoBs}`;
        }
        if (badge) {
          badge.textContent = salud.ambitoLiberado
            ? '🦀 Dropped (0 Fugas)'
            : `Activos: ${salud.recursosActivosCount}`;
        }
      };

      ambitoDemo.vincularSignalConLimpieza(estadoRust, () => actualizarVistaRust(), 'vista-saldo');

      const pintarCli = (cmd) => {
        const res = simularComandoCliMita(cmd);
        const pre = stage.querySelector('#cli-sim-out');
        if (pre) {
          pre.textContent =
            `// Comando: ${res.comando}\n// ${res.resumen}\n` +
            res.archivos.map((a) => `// --- ${a.ruta} ---\n${a.contenido}`).join('\n');
        }
      };
      pintarCli('mita g component TarjetaEmpleo');

      const pintarAutoTests = () => {
        const suite = ejecutarSuiteVerificacionMita();
        const ul = stage.querySelector('#autotests-results-list');
        if (!ul) return;
        ul.innerHTML = suite.resultados
          .map(
            (t) => `
            <li>
              <strong>${t.aprobado ? '✅' : '❌'} ${escaparHtml(t.nombre)}</strong>
              <small>${escaparHtml(t.detalle)}</small>
            </li>
          `
          )
          .join('');
      };
      pintarAutoTests();

      const onClickRust = (event) => {
        const log = stage.querySelector('#rust-guard-log');
        const cliBtn = event.target.closest('button[data-cli-cmd]');
        if (cliBtn) {
          pintarCli(cliBtn.getAttribute('data-cli-cmd'));
          return;
        }

        if (event.target.id === 'btn-rust-violate') {
          const lectura = leerEstadoInmutable(estadoRust);
          try {
            lectura.saldoBs = 999999;
          } catch (err) {
            if (log) {
              log.textContent = `🦀 Borrow Checker bloqueó mutación directa (&T): ${err.message} (Saldo intacto: Bs. ${estadoRust.get().saldoBs})`;
            }
          }
        } else if (event.target.id === 'btn-rust-mutate') {
          mutarEstadoConHistorial(
            estadoRust,
            (actual) => ({ ...actual, saldoBs: actual.saldoBs + 250 }),
            'Depósito autorizado desde Lección 10'
          );
          const hist = obtenerHistorialDeMutaciones(estadoRust);
          if (log && hist[0]) {
            log.textContent = `✅ Préstamo Mutable (&mut T) exitoso. Motivo auditado: "${hist[0].motivo}" (Total cambios: ${hist.length})`;
          }
        } else if (event.target.id === 'btn-rust-drop') {
          const liberados = ambitoDemo.liberarMemoriaCompleta();
          actualizarVistaRust();
          if (log) {
            log.textContent = `🦀 RAII Drop ejecutado: ${liberados} recursos liberados. Suscriptores restantes en Signal: ${estadoRust.suscriptores.size}`;
          }
        } else if (event.target.id === 'btn-run-autotests') {
          pintarAutoTests();
          if (log) log.textContent = `🧪 Suite automática ejecutada: 4/4 pruebas de memoria e inmutabilidad en verde.`;
        }
      };

      stage.addEventListener('click', onClickRust);
      this._limpiezasPreview.push(
        () => ambitoDemo.liberarMemoriaCompleta(),
        () => stage.removeEventListener('click', onClickRust),
        () => estadoRust.destroy()
      );
      return;
    }

    if (this.leccionActiva === 'crudvistas') {
      const crudCtrl = crearControladorCrudCategorias({
        nombreEstado: 'lab:crud_multicategoria'
      });
      const vistasCtrl = crearControladorEstrategiaPorVista({
        nombreEstado: 'lab:vistas_control_granular'
      });

      stage.innerHTML = `
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>🗂️ 1. CRUD Multi-Categoría + Buscador + FormBuilder</h3>
            <span id="crud-stats-badge" class="demo-tag">...</span>
          </header>

          <search class="demo-btn-group">
            <input
              type="search"
              id="crud-search-input"
              class="demo-input"
              placeholder="🔍 Buscar por título, categoría o descripción..."
            />
            <select id="crud-cat-select" class="demo-input" aria-label="Filtrar por categoría">
              <option value="todos">Todas las categorías</option>
              <option value="empleos">💼 Empleos</option>
              <option value="productos">📦 Productos</option>
              <option value="cursos">🎓 Cursos</option>
              <option value="documentos">📄 Documentos</option>
              <option value="servicios">🛠️ Servicios</option>
            </select>
          </search>

          <section id="crud-form-slot"></section>
          <ul id="crud-items-list" class="demo-jobs-ul"></ul>
          <output id="crud-audit-log" class="demo-log-output">
            📦 Motor CRUD listo con Borrow Checker e historial de mutaciones.
          </output>
        </article>

        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>🌐 2. Control Granular de Estrategia por Vista (Hybrid / SSR / SSG / CSR)</h3>
            <span class="demo-tag">ON/OFF por Ruta</span>
          </header>
          <ul id="vistas-control-list" class="demo-jobs-ul"></ul>
          <output id="vistas-control-log" class="demo-log-output">
            🎛️ Cambia el modo de cualquier vista o desactívala con 1 clic.
          </output>
        </article>
      `;

      const formCrud = crearFormularioReusable({
        id: 'lab-crud-reusable-form',
        titulo: '➕ FormBuilder Reusable: Registrar en Cualquier Categoría',
        submitText: 'Guardar en Catálogo CRUD',
        fields: [
          {
            name: 'titulo',
            label: 'Título o Nombre *',
            placeholder: 'Ej: Consultoría Arquitectura Light DOM',
            required: true,
            minLength: 3
          },
          {
            name: 'categoria',
            label: 'Categoría *',
            type: 'select',
            required: true,
            options: [
              { value: 'empleos', label: '💼 Empleos' },
              { value: 'productos', label: '📦 Productos' },
              { value: 'cursos', label: '🎓 Cursos' },
              { value: 'documentos', label: '📄 Documentos' },
              { value: 'servicios', label: '🛠️ Servicios' }
            ]
          },
          {
            name: 'valorNumerico',
            label: 'Valor / Salario / Precio (Bs.)',
            type: 'number',
            placeholder: '1200'
          }
        ],
        onSubmit: (datos) => {
          const creado = crudCtrl.crearNuevoRegistro(datos);
          const log = stage.querySelector('#crud-audit-log');
          if (log) {
            log.textContent = `✅ Creado "${creado.titulo}" en categoría "${creado.categoria}" (Bs. ${creado.valorNumerico}).`;
          }
        }
      });
      const stopFormCrud = formCrud.montarEn(stage.querySelector('#crud-form-slot'));

      const pintarCrud = () => {
        const items = crudCtrl.listarRegistrosFiltrados();
        const stats = crudCtrl.obtenerEstadisticasPorCategoria();
        const badge = stage.querySelector('#crud-stats-badge');
        const ul = stage.querySelector('#crud-items-list');
        if (badge) {
          badge.textContent = `${items.length} visibles / ${stats.totalRegistros} total (⭐ ${stats.totalDestacados})`;
        }
        if (!ul) return;
        if (items.length === 0) {
          ul.innerHTML = `<li><em>No hay registros para el filtro actual.</em></li>`;
          return;
        }
        ul.innerHTML = items
          .map(
            (item) => `
            <li data-crud-id="${escaparHtml(item.id)}">
              <header class="reusable-card-head">
                <strong>${item.destacado ? '⭐ ' : ''}${escaparHtml(item.titulo)}</strong>
                <span class="demo-tag">${escaparHtml(item.categoria)} • Bs. ${item.valorNumerico}</span>
              </header>
              <small>${escaparHtml(item.descripcion)}</small>
              <nav class="demo-btn-group">
                <button type="button" class="demo-btn demo-btn-ghost" data-crud-star="${escaparHtml(item.id)}">
                  ${item.destacado ? '★ Quitar Destacado' : '☆ Destacar'}
                </button>
                <button type="button" class="demo-btn demo-btn-ghost" data-crud-del="${escaparHtml(item.id)}">
                  🗑️ Eliminar
                </button>
              </nav>
            </li>
          `
          )
          .join('');
      };

      const pintarVistas = () => {
        const vistas = vistasCtrl.listarMapaDeVistas();
        const ul = stage.querySelector('#vistas-control-list');
        if (!ul) return;
        ul.innerHTML = vistas
          .map(
            (v) => `
            <li data-vista-row="${escaparHtml(v.ruta)}">
              <header class="reusable-card-head">
                <strong><code>${escaparHtml(v.ruta)}</code> — ${escaparHtml(v.titulo)}</strong>
                <span class="demo-tag">${v.habilitada ? `🟢 ${v.modo.toUpperCase()}` : '🔴 DESACTIVADA'}</span>
              </header>
              <small>${escaparHtml(v.explicacion)}</small>
              <nav class="demo-btn-group">
                <button type="button" class="demo-btn ${v.modo === 'hybrid' ? '' : 'demo-btn-ghost'}" data-vista-ruta="${escaparHtml(v.ruta)}" data-vista-modo="hybrid">Hybrid</button>
                <button type="button" class="demo-btn ${v.modo === 'ssr' ? '' : 'demo-btn-ghost'}" data-vista-ruta="${escaparHtml(v.ruta)}" data-vista-modo="ssr">SSR</button>
                <button type="button" class="demo-btn ${v.modo === 'ssg' ? '' : 'demo-btn-ghost'}" data-vista-ruta="${escaparHtml(v.ruta)}" data-vista-modo="ssg">SSG</button>
                <button type="button" class="demo-btn ${v.modo === 'csr' ? '' : 'demo-btn-ghost'}" data-vista-ruta="${escaparHtml(v.ruta)}" data-vista-modo="csr">CSR</button>
                <button type="button" class="demo-btn demo-btn-ghost" data-vista-toggle="${escaparHtml(v.ruta)}">
                  ${v.habilitada ? '⏸️ Desactivar Vista' : '▶️ Activar Vista'}
                </button>
              </nav>
            </li>
          `
          )
          .join('');
      };

      const stopCrudSub = crudCtrl.estado.suscribir(() => pintarCrud());
      const stopVistasSub = vistasCtrl.estado.suscribir(() => pintarVistas());

      const onInputCrud = (e) => {
        if (e.target.id === 'crud-search-input') {
          crudCtrl.aplicarFiltrosDeBusqueda({ textoBusqueda: e.target.value });
        } else if (e.target.id === 'crud-cat-select') {
          crudCtrl.aplicarFiltrosDeBusqueda({ categoriaActiva: e.target.value });
        }
      };

      const onClickCrudVistas = async (e) => {
        const starBtn = e.target.closest('button[data-crud-star]');
        if (starBtn) {
          crudCtrl.alternarDestacadoPorId(starBtn.getAttribute('data-crud-star'));
          return;
        }

        const delBtn = e.target.closest('button[data-crud-del]');
        if (delBtn) {
          crudCtrl.eliminarRegistroPorId(delBtn.getAttribute('data-crud-del'), 'Eliminado desde Lección 11');
          return;
        }

        const modoBtn = e.target.closest('button[data-vista-modo]');
        if (modoBtn) {
          const ruta = modoBtn.getAttribute('data-vista-ruta');
          const modo = modoBtn.getAttribute('data-vista-modo');
          vistasCtrl.cambiarModoDeVistaEnCaliente(ruta, modo);
          const vlog = stage.querySelector('#vistas-control-log');
          if (vlog) vlog.textContent = `🌐 Ruta "${ruta}" configurada en modo ${modo.toUpperCase()}.`;
          return;
        }

        const toggleBtn = e.target.closest('button[data-vista-toggle]');
        if (toggleBtn) {
          const ruta = toggleBtn.getAttribute('data-vista-toggle');
          const cfgActual = vistasCtrl.obtenerConfiguracionDeVista(ruta);
          vistasCtrl.activarODesactivarVista(ruta, !cfgActual.habilitada);
          const sim = await vistasCtrl.renderizarVistaConConfiguracion(
            ruta,
            class {
              render() {
                return `<article>Vista ${ruta} activa</article>`;
              }
            }
          );
          const vlog = stage.querySelector('#vistas-control-log');
          if (vlog) {
            vlog.textContent = `🎛️ Ruta "${ruta}" => modoAplicado="${sim.modoAplicado}" | HTML: ${sim.body}`;
          }
        }
      };

      stage.addEventListener('input', onInputCrud);
      stage.addEventListener('change', onInputCrud);
      stage.addEventListener('click', onClickCrudVistas);

      this._limpiezasPreview.push(
        stopFormCrud,
        stopCrudSub,
        stopVistasSub,
        () => stage.removeEventListener('input', onInputCrud),
        () => stage.removeEventListener('change', onInputCrud),
        () => stage.removeEventListener('click', onClickCrudVistas)
      );
      return;
    }

    if (this.leccionActiva === 'comunidad') {
      const perfilesCtrl = crearGestorPerfilesYDispositivo({
        nombreEstado: 'lab:perfiles_dispositivo'
      });
      const chatCtrl = crearControladorSalaChatYGrupos({
        nombreEstado: 'lab:chat_gate_3s',
        intervaloSegundosInicial: 3
      });
      const modCtrl = crearSistemaModeracionAnuncios({
        nombreEstado: 'lab:moderacion_dc',
        gestorPerfiles: perfilesCtrl
      });
      const pagCtrl = crearControladorPaginacion({
        nombreEstado: 'lab:paginacion_anuncios',
        tamanoPaginaInicial: 2
      });
      const fetcherCtrl = crearFetcherConCacheYEstados({
        nombreEstado: 'lab:fetcher_cache',
        tiempoCacheMs: 60000
      });

      stage.innerHTML = `
        <!-- 1. Perfil sin Cuenta + Huella Dispositivo Local + Regla 15 Días -->
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>👤 1. Perfil sin Cuenta + Huella Local + Regla 15 Días</h3>
            <span id="guest-device-badge" class="demo-tag">...</span>
          </header>
          <p id="guest-profile-summary" class="demo-rules-note"></p>
          <form id="form-guest-profile" class="demo-form">
            <label class="demo-label">
              Nombre público (sin registrar cuenta):
              <input id="guest-name-in" class="demo-input" value="Carlos Bolivia" required />
            </label>
            <label class="demo-label">
              Empresa (opcional):
              <input id="guest-company-in" class="demo-input" value="Grupo El Sol SRL" />
            </label>
            <label class="demo-check">
              <input type="checkbox" id="chk-admin-15days" checked />
              <span><strong>🛡️ Regla Admin:</strong> Prohibir cambio de nombre durante 15 días en el mismo dispositivo</span>
            </label>
            <nav class="demo-btn-group">
              <button type="submit" class="demo-btn">Guardar Perfil sin Cuenta</button>
              <button type="button" id="btn-ban-current-device" class="demo-btn demo-btn-ghost">🚫 Bloquear/Desbloquear Dispositivo</button>
              <button type="button" id="btn-export-user-json" class="demo-btn demo-btn-ghost">📤 Exportar Datos Usuario</button>
            </nav>
          </form>
          <output id="guest-profile-log" class="demo-log-output">
            🪪 Registro formal de cuentas desactivado: operas con perfil rápido en DB Local.
          </output>
        </article>

        <!-- 2. Salas de Chat y Grupos con Ventana Obligatoria de Aceptación y Cooldown 3s -->
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>💬 2. Chat y Grupos con Ventana de Reglas + Cooldown (3s)</h3>
            <span id="chat-gate-badge" class="demo-tag">Sin Sala Activa</span>
          </header>
          <nav class="demo-btn-group" aria-label="Seleccionar grupo de chat">
            <button type="button" class="demo-btn" data-enter-room="grupo-empleos">💼 Entrar a Grupo Ofertas</button>
            <button type="button" class="demo-btn demo-btn-ghost" data-enter-room="grupo-soporte">🛠️ Entrar a Grupo Soporte</button>
            <label class="demo-check">
              <span>⏱️ Intervalo (seg):</span>
              <input type="number" id="chat-cooldown-sec" class="demo-input" value="3" min="1" max="30" style="width:70px;" />
            </label>
          </nav>

          <!-- Ventana Emergente de Aceptación Obligatoria para Entrar al Chat/Grupo -->
          <section id="chat-gate-window" class="demo-paused-alert" hidden>
            <strong>🪟 Ventana de Aceptación Obligatoria antes de Entrar al Grupo</strong>
            <p id="chat-gate-rules-txt"></p>
            <nav class="demo-btn-group">
              <button type="button" id="btn-accept-chat-gate" class="demo-btn">✅ Acepto las Reglas (Entrar al Chat)</button>
              <button type="button" id="btn-reject-chat-gate" class="demo-btn demo-btn-ghost">❌ No Acepto (Salir)</button>
            </nav>
          </section>

          <form id="form-chat-gate-msg" class="demo-form">
            <input id="chat-gate-msg-in" class="demo-input" placeholder="Escribe un mensaje (debes haber aceptado la ventana y respetar los 3s)..." />
            <button type="submit" class="demo-btn">Enviar Mensaje al Grupo</button>
          </form>
          <output id="chat-gate-log" class="demo-log-output">
            🪟 Selecciona un grupo: si no aceptas la ventana de condiciones, no podrás entrar ni chatear.
          </output>
        </article>

        <!-- 3. Moderación de Anuncios ("DC"), CRUD Categorías, Descargo Legal, Reportes, Purga Admin y Paginación UI -->
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>📢 3. Moderación ("DC"), CRUD Categorías, Descargo Legal y Paginación UI</h3>
            <span id="mod-notifications-badge" class="demo-tag">🔔 0 Reportes</span>
          </header>

          <p id="mod-legal-disclaimer" class="demo-rules-note"></p>

          <!-- CRUD Obligatorio de Categorías + Opciones Globales Admin -->
          <section class="demo-btn-group">
            <input id="input-new-cat-name" class="demo-input" placeholder="🗂️ Nueva categoría (ej: Alquileres)..." style="max-width:220px;" />
            <button type="button" id="btn-add-category" class="demo-btn demo-btn-ghost">+ Crear Categoría</button>
            <label class="demo-check">
              <input type="checkbox" id="chk-require-review" />
              <span>⏳ Requerir Revisión Previa Admin</span>
            </label>
            <button type="button" id="btn-fetch-cache-demo" class="demo-btn demo-btn-ghost">📡 Probar Data Fetcher (Caché)</button>
          </section>

          <!-- Buscador en todo el anuncio -->
          <search class="demo-btn-group">
            <input type="search" id="mod-ad-search" class="demo-input" placeholder="🔍 Buscar en todo el anuncio (título, empresa, fecha/hora, autor)..." />
          </search>

          <!-- Publicar anuncio o probar bloqueo de "DC" -->
          <form id="form-publish-mod-ad" class="demo-form">
            <input id="mod-ad-title" class="demo-input" placeholder="Título del anuncio *" required />
            <select id="mod-ad-cat" class="demo-input" aria-label="Categoría obligatoria"></select>
            <nav class="demo-btn-group">
              <button type="submit" class="demo-btn">Publicar Anuncio (Badge "No Verificado")</button>
              <button type="button" id="btn-test-dc-word" class="demo-btn demo-btn-ghost">🚫 Probar Anuncio con "dc" / "DC"</button>
              <button type="button" id="btn-report-first-ad" class="demo-btn demo-btn-ghost">🚨 Reportar 1er Anuncio (+Pruebas)</button>
            </nav>
          </form>

          <!-- Botones Exclusivos para Admin -->
          <nav class="demo-btn-group" aria-label="Acciones exclusivas del Administrador">
            <button type="button" id="btn-admin-approve-all" class="demo-btn demo-btn-ghost">✅ Admin: Permitir Todos</button>
            <button type="button" id="btn-admin-purge-company" class="demo-btn demo-btn-ghost">🧹 Admin: Borrar Todo de "Grupo El Sol SRL"</button>
            <button type="button" id="btn-admin-purge-all" class="demo-btn demo-btn-ghost">🧨 Admin: Borrar Todo</button>
          </nav>

          <ul id="mod-ads-paginated-list" class="demo-jobs-ul"></ul>
          <section id="mod-pagination-slot"></section>
          <output id="mod-admin-log" class="demo-log-output"></output>
        </article>
      `;

      let salaPendienteId = null;

      const pintarTodoComunidad = () => {
        // 1. Perfil y Dispositivo
        const stPerfil = perfilesCtrl.estado.get();
        const p = stPerfil.perfilActivo;
        const blq = perfilesCtrl.estaBloqueadoParaPublicar();
        const badgeDev = stage.querySelector('#guest-device-badge');
        const sumPerfil = stage.querySelector('#guest-profile-summary');
        if (badgeDev) badgeDev.textContent = `Dispositivo: ${perfilesCtrl.huellaActual.slice(0, 12)}`;
        if (sumPerfil) {
          sumPerfil.textContent = `Perfil activo: "${p.nombre}" | Empresa: "${p.empresa || 'N/A'}" | Sello: ${p.badge} | Estado: ${blq.bloqueado ? '🚫 BLOQUEADO' : '🟢 Habilitado'}`;
        }

        // 2. Chat Gatekeeper
        const stChat = chatCtrl.estado.get();
        const badgeChat = stage.querySelector('#chat-gate-badge');
        const gateWin = stage.querySelector('#chat-gate-window');
        const gateTxt = stage.querySelector('#chat-gate-rules-txt');
        if (badgeChat) {
          badgeChat.textContent = stChat.salaActivaId
            ? `🟢 En: ${stChat.salaActivaId} (${stChat.intervaloEnvioSegundos}s)`
            : '🔒 Sin Sala (Acepta Reglas)';
        }
        if (gateWin) {
          gateWin.hidden = !stChat.mostrarVentanaAceptacionParaSala;
        }
        if (gateTxt) {
          gateTxt.textContent = stChat.textoReglasEntradaChat;
        }

        // 3. Moderación de Anuncios + Paginación UI
        const stMod = modCtrl.estado.get();
        const legalEl = stage.querySelector('#mod-legal-disclaimer');
        const notifBadge = stage.querySelector('#mod-notifications-badge');
        const catSelect = stage.querySelector('#mod-ad-cat');
        if (legalEl) legalEl.textContent = stMod.descargoLegalResponsabilidad;
        if (notifBadge) {
          notifBadge.textContent = `🔔 ${stMod.reportesYNotificacionesAdmin.length} Reportes Admin`;
        }
        if (catSelect) {
          const valPrevio = catSelect.value;
          catSelect.innerHTML = modCtrl
            .listarCategoriasActivas()
            .map((c) => `<option value="${escaparHtml(c.id)}">${escaparHtml(c.nombre)}</option>`)
            .join('');
          if (valPrevio && catSelect.querySelector(`option[value="${valPrevio}"]`)) {
            catSelect.value = valPrevio;
          }
        }

        const q = stage.querySelector('#mod-ad-search')?.value || '';
        const filtrados = modCtrl.buscarYFiltrarAnuncios({
          textoBusqueda: q,
          incluirPendientesAdmin: true
        });
        const paginaData = pagCtrl.obtenerItemsDePagina(filtrados);
        const ulAds = stage.querySelector('#mod-ads-paginated-list');
        const pagSlot = stage.querySelector('#mod-pagination-slot');

        if (ulAds) {
          ulAds.innerHTML =
            paginaData.itemsPagina.length === 0
              ? `<li><em>No hay anuncios en esta página o filtro.</em></li>`
              : paginaData.itemsPagina
                  .map(
                    (ad) => `
                  <li data-ad-id="${escaparHtml(ad.id)}">
                    <header class="reusable-card-head">
                      <strong>${escaparHtml(ad.titulo)}</strong>
                      <span class="demo-tag">${escaparHtml(ad.badgeVerificacion)} • ${escaparHtml(ad.categoria)}</span>
                    </header>
                    <small>👤 ${escaparHtml(ad.autorNombre)} (${escaparHtml(ad.empresa || 'Particular')}) • 🕒 ${escaparHtml(ad.creadoEnFechaHora)} (${ad.duracionHoras}h) • Estado: ${escaparHtml(ad.estadoRevision)} • 🚨 Reportes: ${ad.reportesCount}</small>
                  </li>
                `
                  )
                  .join('');
        }
        if (pagSlot) {
          pagSlot.innerHTML = pagCtrl.renderizarControlesHtml(filtrados.length);
        }
      };

      const stopP = perfilesCtrl.estado.suscribir(pintarTodoComunidad);
      const stopC = chatCtrl.estado.suscribir(pintarTodoComunidad);
      const stopM = modCtrl.estado.suscribir(pintarTodoComunidad);
      const stopPag = pagCtrl.estado.suscribir(pintarTodoComunidad);

      const onSubmitComunidad = (e) => {
        if (e.target.id === 'form-guest-profile') {
          e.preventDefault();
          const nombre = stage.querySelector('#guest-name-in')?.value || '';
          const empresa = stage.querySelector('#guest-company-in')?.value || '';
          const res = perfilesCtrl.crearOActualizarPerfilSinCuenta({ nombre, empresa });
          const log = stage.querySelector('#guest-profile-log');
          if (log) {
            log.textContent = res.ok
              ? `✅ Perfil actualizado: "${res.perfil.nombre}" (${res.perfil.badge}) en dispositivo ${res.perfil.huellaDispositivoId}`
              : `❌ ${res.motivo}`;
          }
        } else if (e.target.id === 'form-chat-gate-msg') {
          e.preventDefault();
          const input = stage.querySelector('#chat-gate-msg-in');
          const autor = perfilesCtrl.estado.get().perfilActivo.nombre;
          const res = chatCtrl.enviarMensajeConCooldown({
            salaId: chatCtrl.estado.get().salaActivaId,
            autor,
            texto: input?.value || ''
          });
          const log = stage.querySelector('#chat-gate-log');
          if (log) {
            log.textContent = res.ok
              ? `💬 Mensaje enviado a "${res.mensaje.salaId}": "${res.mensaje.texto}"`
              : res.motivo;
          }
          if (res.ok && input) input.value = '';
        } else if (e.target.id === 'form-publish-mod-ad') {
          e.preventDefault();
          const titulo = stage.querySelector('#mod-ad-title')?.value || '';
          const categoria = stage.querySelector('#mod-ad-cat')?.value || 'empleos';
          const p = perfilesCtrl.estado.get().perfilActivo;
          const res = modCtrl.publicarAnuncio({
            titulo,
            descripcion: 'Publicado desde el Laboratorio Mita-DOM v2.7',
            categoria,
            autorNombre: p.nombre,
            empresa: p.empresa
          });
          const log = stage.querySelector('#mod-admin-log');
          if (log) {
            log.textContent = res.ok
              ? `✅ Anuncio publicado con sello "${res.anuncio.badgeVerificacion}" (Estado: ${res.anuncio.estadoRevision})`
              : res.motivo;
          }
        }
      };

      const onClickComunidad = async (e) => {
        const roomBtn = e.target.closest('button[data-enter-room]');
        if (roomBtn) {
          salaPendienteId = roomBtn.getAttribute('data-enter-room');
          const res = chatCtrl.intentarEntrarASalaOChat(salaPendienteId);
          const log = stage.querySelector('#chat-gate-log');
          if (log) log.textContent = res.motivo || `🟢 Entraste a ${res.salaActivaId}`;
          return;
        }

        const pageBtn = e.target.closest('button[data-page-action]');
        if (pageBtn) {
          const total = modCtrl.buscarYFiltrarAnuncios({ incluirPendientesAdmin: true }).length;
          if (pageBtn.getAttribute('data-page-action') === 'next') pagCtrl.paginaSiguiente(total);
          if (pageBtn.getAttribute('data-page-action') === 'prev') pagCtrl.paginaAnterior(total);
          return;
        }

        if (e.target.id === 'btn-accept-chat-gate' && salaPendienteId) {
          chatCtrl.aceptarReglasYEntrarASala(salaPendienteId);
          const log = stage.querySelector('#chat-gate-log');
          if (log) log.textContent = `✅ Reglas aceptadas: acceso concedido al grupo "${salaPendienteId}".`;
        } else if (e.target.id === 'btn-reject-chat-gate') {
          const res = chatCtrl.rechazarReglasDeEntrada();
          const log = stage.querySelector('#chat-gate-log');
          if (log) log.textContent = `🚫 ${res.motivo}`;
        } else if (e.target.id === 'btn-ban-current-device') {
          const blq = perfilesCtrl.estaBloqueadoParaPublicar();
          if (blq.bloqueado) {
            perfilesCtrl.desbloquearUsuarioODispositivo(perfilesCtrl.huellaActual);
          } else {
            perfilesCtrl.prohibirUsuarioODispositivo(perfilesCtrl.huellaActual, 'Bloqueo preventivo desde Admin');
          }
          pintarTodoComunidad();
        } else if (e.target.id === 'btn-export-user-json') {
          const json = perfilesCtrl.exportarDatosUsuarioJson();
          const log = stage.querySelector('#guest-profile-log');
          if (log) log.textContent = `📤 Exportado JSON: usuario="${json.perfilActivo.nombre}", huella="${json.huellaDispositivoId}"`;
        } else if (e.target.id === 'btn-add-category') {
          const nameIn = stage.querySelector('#input-new-cat-name');
          if (nameIn && nameIn.value.trim()) {
            const cat = modCtrl.crearCategoria({ id: nameIn.value, nombre: `🗂️ ${nameIn.value.trim()}` });
            nameIn.value = '';
            const log = stage.querySelector('#mod-admin-log');
            if (log) log.textContent = `✅ Categoría "${cat.nombre}" agregada al CRUD obligatorio.`;
          }
        } else if (e.target.id === 'btn-test-dc-word') {
          const res = modCtrl.publicarAnuncio({
            titulo: 'Oferta urgente en dc / DC',
            descripcion: 'Prueba de filtro case-insensitive',
            categoria: 'empleos'
          });
          const log = stage.querySelector('#mod-admin-log');
          if (log) log.textContent = res.motivo;
        } else if (e.target.id === 'btn-report-first-ad') {
          const primero = modCtrl.estado.get().anuncios[0];
          if (primero) {
            const rep = modCtrl.reportarAnuncioConPruebas({
              idAnuncio: primero.id,
              reportadoPor: perfilesCtrl.estado.get().perfilActivo.nombre,
              justificacion: 'Publicación sospechosa reportada con pruebas',
              pruebasEvidencia: 'Evidencia verificada #104'
            });
            const log = stage.querySelector('#mod-admin-log');
            if (log && rep.ok) {
              log.textContent = `🚨 Reporte enviado al Admin sobre "${primero.titulo}" con pruebas: "${rep.reporte.pruebasEvidencia}".`;
            }
          }
        } else if (e.target.id === 'btn-admin-approve-all') {
          modCtrl.permitirTodosLosAnunciosPendientes();
          const log = stage.querySelector('#mod-admin-log');
          if (log) log.textContent = `✅ Admin aprobó todos los anuncios pendientes en cola.`;
        } else if (e.target.id === 'btn-admin-purge-company') {
          const borrados = modCtrl.borrarPublicacionesPorUsuarioOEmpresa('Grupo El Sol SRL');
          const log = stage.querySelector('#mod-admin-log');
          if (log) log.textContent = `🧹 Admin borró ${borrados} publicaciones de la empresa "Grupo El Sol SRL".`;
        } else if (e.target.id === 'btn-admin-purge-all') {
          const total = modCtrl.borrarTodosLosAnunciosPorAdmin();
          const log = stage.querySelector('#mod-admin-log');
          if (log) log.textContent = `🧨 Admin vació todo el tablón (${total} anuncios eliminados).`;
        } else if (e.target.id === 'btn-fetch-cache-demo') {
          const res = await fetcherCtrl.cargarRecurso('api:anuncios_resumen', async () => ({
            total: modCtrl.estado.get().anuncios.length
          }));
          const log = stage.querySelector('#mod-admin-log');
          if (log) {
            log.textContent = `📡 Data Fetcher: desdeCache=${res.desdeCache} (Peticiones ahorradas a BD: ${fetcherCtrl.estado.get().ahorroRequestsCount})`;
          }
        }
      };

      const onChangeComunidad = (e) => {
        if (e.target.id === 'chk-admin-15days') {
          perfilesCtrl.configurarReglasAdminPerfiles({
            restringirCambioNombreQuinceDias: e.target.checked
          });
        } else if (e.target.id === 'chat-cooldown-sec') {
          chatCtrl.configurarIntervaloMensajesSegundos(Number(e.target.value) || 3);
        } else if (e.target.id === 'chk-require-review') {
          modCtrl.configurarOpcionesGlobalesModeracion({
            requiereRevisionPreviaAdmin: e.target.checked
          });
        } else if (e.target.id === 'mod-ad-search') {
          pintarTodoComunidad();
        }
      };

      stage.addEventListener('submit', onSubmitComunidad);
      stage.addEventListener('click', onClickComunidad);
      stage.addEventListener('change', onChangeComunidad);
      stage.addEventListener('input', onChangeComunidad);

      this._limpiezasPreview.push(
        stopP,
        stopC,
        stopM,
        stopPag,
        () => stage.removeEventListener('submit', onSubmitComunidad),
        () => stage.removeEventListener('click', onClickComunidad),
        () => stage.removeEventListener('change', onChangeComunidad),
        () => stage.removeEventListener('input', onChangeComunidad)
      );
      return;
    }

    if (this.leccionActiva === 'props') {
      stage.innerHTML = `
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>👩‍🔬 Profile() — Pasando Props <code>person</code> y <code>size</code> a 3 <code>&lt;lab-cientifico-avatar&gt;</code></h3>
            <span class="demo-tag">react.dev/learn/passing-props-to-a-component</span>
          </header>

          <section class="scientists-grid" id="scientists-profile-grid">
            <lab-cientifico-avatar id="avatar-katsuko"></lab-cientifico-avatar>
            <lab-cientifico-avatar id="avatar-aklilu"></lab-cientifico-avatar>
            <lab-cientifico-avatar id="avatar-lin"></lab-cientifico-avatar>
          </section>

          <section class="demo-form">
            <label class="demo-label">
              🎛️ Cambiar Prop <code>size</code> de Katsuko Saruhashi en vivo:
              <nav class="demo-btn-group">
                <button type="button" class="demo-btn demo-btn-ghost" data-katsuko-size="60">size={60}</button>
                <button type="button" class="demo-btn" data-katsuko-size="100">size={100} (Original)</button>
                <button type="button" class="demo-btn demo-btn-ghost" data-katsuko-size="120">size={120} (🎯 Reto)</button>
              </nav>
            </label>
          </section>

          <output id="props-inspector-out" class="demo-log-output">
            📦 Props pasadas con pasarPropsAElemento(): Katsuko (100px), Aklilu (80px), Lin (50px).
          </output>
        </article>
      `;

      const elKatsuko = stage.querySelector('#avatar-katsuko');
      const elAklilu = stage.querySelector('#avatar-aklilu');
      const elLin = stage.querySelector('#avatar-lin');

      pasarPropsAElemento(elKatsuko, {
        size: 100,
        person: CIENTIFICOS_DEMO[0]
      });
      pasarPropsAElemento(elAklilu, {
        size: 80,
        person: CIENTIFICOS_DEMO[1]
      });
      pasarPropsAElemento(elLin, {
        size: 50,
        person: CIENTIFICOS_DEMO[2]
      });

      const onClickProps = (event) => {
        const btn = event.target.closest('button[data-katsuko-size]');
        if (!btn) return;
        const nuevoSize = Number(btn.getAttribute('data-katsuko-size')) || 100;
        pasarPropsAElemento(elKatsuko, {
          size: nuevoSize,
          person: CIENTIFICOS_DEMO[0]
        });
        const out = stage.querySelector('#props-inspector-out');
        if (out) {
          out.textContent = `✅ Prop actualizada en <lab-cientifico-avatar id="avatar-katsuko">: size={${nuevoSize}}, url="${obtenerUrlImagenCientifico(CIENTIFICOS_DEMO[0])}"`;
        }
      };

      stage.addEventListener('click', onClickProps);
      this._limpiezasPreview.push(() => stage.removeEventListener('click', onClickProps));
      return;
    }

    if (this.leccionActiva === 'angular') {
      const sigForm = crearFormularioReactivoConSignals(
        {
          nombre: { valorInicial: 'Katsuko Saruhashi', requerido: true, minLongitud: 3 },
          correo: {
            valorInicial: 'katsuko@ciencia.jp',
            requerido: true,
            patronRegex: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
          },
          imageId: { valorInicial: 'YfeOqp2', requerido: true, minLongitud: 5 }
        },
        'lab:angular_signal_form'
      );

      stage.innerHTML = `
        <!-- 1. Deferrable Views (@defer de Angular.dev) -->
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>⏳ 1. Deferrable Views (<code>@defer</code> en Mita-DOM)</h3>
            <span id="defer-phase-badge" class="demo-tag">@placeholder</span>
          </header>
          <section id="lab-defer-slot"></section>
          <nav class="demo-btn-group">
            <button type="button" id="btn-trigger-defer" class="demo-btn">⚡ Disparar Carga Diferida (@defer)</button>
            <button type="button" id="btn-reset-defer" class="demo-btn demo-btn-ghost">↺ Volver a @placeholder</button>
          </nav>
        </article>

        <!-- 2. Signal Forms (Angular.dev Signal Forms) -->
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>📝 2. Signal Forms (Validación Reactiva por Campo)</h3>
            <span id="sigform-valid-badge" class="demo-tag">...</span>
          </header>
          <form id="lab-signal-form" class="demo-form" novalidate>
            <label class="demo-label">
              Nombre del Científico (mínimo 3 caracteres):
              <input id="sf-nombre" name="nombre" class="demo-input" value="Katsuko Saruhashi" />
              <small id="sf-err-nombre" class="mita-form-error"></small>
            </label>
            <label class="demo-label">
              Correo Institucional:
              <input id="sf-correo" name="correo" class="demo-input" value="katsuko@ciencia.jp" />
              <small id="sf-err-correo" class="mita-form-error"></small>
            </label>
            <label class="demo-label">
              ID de Imagen (mínimo 5 caracteres):
              <input id="sf-imageId" name="imageId" class="demo-input" value="YfeOqp2" />
              <small id="sf-err-imageId" class="mita-form-error"></small>
            </label>
            <button type="submit" id="btn-sf-submit" class="demo-btn">Enviar Signal Form</button>
          </form>
          <pre id="sigform-json-out" class="demo-pre"></pre>
        </article>
      `;

      const deferCtrl = renderizarVistaDiferida({
        contenedor: stage.querySelector('#lab-defer-slot'),
        disparador: 'interaccion',
        plantillaPlaceholder: () => `
          <p class="demo-paused-alert" id="defer-placeholder-box">
            📦 <strong>Bloque @placeholder:</strong> El componente pesado de biografías científicas aún no se ha descargado. Haz clic aquí o en "Disparar Carga Diferida".
          </p>
        `,
        plantillaCargando: () => `<p class="demo-rules-note">⏳ <strong>@loading:</strong> Hidratando biografías científicas...</p>`,
        cargarContenidoDiferido: async () => `
          <article id="defer-loaded-content" class="demo-rules-note">
            <strong>✅ Vista @defer Completada:</strong> Biografías de Katsuko Saruhashi, Aklilu Lemma y Lin Lanying cargadas bajo demanda.
          </article>
        `
      });

      const stopDeferBadge = deferCtrl.estado?.suscribir((st) => {
        const b = stage.querySelector('#defer-phase-badge');
        if (b) b.textContent = `@${st.fase}`;
      });

      const stopSigForm = sigForm.estado.suscribir((st) => {
        const badge = stage.querySelector('#sigform-valid-badge');
        const pre = stage.querySelector('#sigform-json-out');
        const btnSub = stage.querySelector('#btn-sf-submit');
        if (badge) {
          badge.textContent = st.esFormularioValido ? '🟢 Válido' : '🔴 Inválido';
        }
        if (btnSub) {
          btnSub.disabled = !st.esFormularioValido;
        }
        ['nombre', 'correo', 'imageId'].forEach((campo) => {
          const errEl = stage.querySelector(`#sf-err-${campo}`);
          if (errEl) errEl.textContent = st.campos[campo]?.error || '';
        });
        if (pre) {
          pre.textContent = JSON.stringify(st, null, 2);
        }
      });

      const onInputSigForm = (e) => {
        const name = e.target.name;
        if (name && ['nombre', 'correo', 'imageId'].includes(name)) {
          sigForm.establecerValorCampo(name, e.target.value);
        }
      };

      const onClickAngular = async (e) => {
        if (e.target.id === 'btn-trigger-defer') {
          await deferCtrl.dispararCargaAhora();
        } else if (e.target.id === 'btn-reset-defer') {
          deferCtrl.reiniciarAPlaceholder();
        }
      };

      const onSubmitSigForm = (e) => {
        if (e.target.id !== 'lab-signal-form') return;
        e.preventDefault();
        sigForm.procesarEnvio();
      };

      stage.addEventListener('input', onInputSigForm);
      stage.addEventListener('click', onClickAngular);
      stage.addEventListener('submit', onSubmitSigForm);

      this._limpiezasPreview.push(
        () => deferCtrl.limpiar(),
        () => stopDeferBadge && stopDeferBadge(),
        stopSigForm,
        () => stage.removeEventListener('input', onInputSigForm),
        () => stage.removeEventListener('click', onClickAngular),
        () => stage.removeEventListener('submit', onSubmitSigForm)
      );
      return;
    }

    if (this.leccionActiva === 'fullstack') {
      const fetchCtrl = crearControladorFetchingPorModo({
        nombreEstado: 'lab:fetch_por_modo',
        modoDisparo: 'al-hacer-click',
        tiempoCacheMs: 60000,
        cargadorAsyncFn: async () => ({
          motor: 'Node.js + Express + Sequelize MySQL ORM',
          totalOfertasActivas: 24,
          timestamp: new Date().toTimeString().slice(0, 8)
        })
      });

      const serverActionOrm = crearAccionServidorIsomorfica(
        'empleos/crearEnMySQL',
        async (payload) => ({
          idMySQL: 901,
          tabla: 'job_announcements',
          titulo: payload.titulo,
          estado: 'INSERTADO_EN_ORM'
        }),
        {
          validarPayload: (p) => (!p.titulo ? 'El título es obligatorio antes de invocar al ORM' : null)
        }
      );

      const mapaVisualEstrategias = {
        hybrid: {
          titulo: '🏝️ HYBRID + ISLAS (Lo Mejor de los 3 Mundos)',
          metafora: '🍽️ El restaurante sirve el plato principal ya cocinado (HTML del servidor para SEO instantáneo) y solo enciende la hornilla en la mesa para la salsa interactiva (<tag mita-client="only">).',
          pasos: '1) Servidor Node.js genera HTML completo → 2) <header mita-server="only"> usa 0% JS en el navegador → 3) <mita-chat mita-client="only"> se hidrata solo donde hay interacción.',
          cuandoUsar: 'Ideal para Portadas, Tiendas y Tablones públicos que necesitan SEO + widgets reactivos.'
        },
        ssr: {
          titulo: '🖥️ SSR (Server-Side Rendering por Petición)',
          metafora: '🍽️ Cada vez que llega un cliente, el chef en el servidor consulta MySQL y cocina el plato desde cero en ese milisegundo.',
          pasos: '1) Petición HTTP entra a Express → 2) Consulta Sequelize ORM en vivo → 3) Devuelve HTML fresco con MitaMeta.renderSSRHead().',
          cuandoUsar: 'Ideal para páginas con precios, stock o anuncios que cambian cada segundo y requieren SEO.'
        },
        ssg: {
          titulo: '📄 SSG (Static Site Generation en Build Time)',
          metafora: '🍽️ Se cocinan y empacan todos los platos durante npm run build. En producción el servidor solo entrega la caja lista en < 2ms (0 consultas a MySQL).',
          pasos: '1) npm run build ejecuta renderizarVistaUniversal({ modo: "ssg" }) → 2) Genera archivos .html estáticos → 3) CDN los sirve al instante.',
          cuandoUsar: 'Ideal para Documentación (/docs), Blogs (/blog) y Guías.'
        },
        csr: {
          titulo: '⚡ CSR / SPA (Client-Side Rendering en el Navegador)',
          metafora: '🍽️ El servidor entrega solo el plato vacío (<main id="app">) y el navegador del usuario descarga JS y cocina todo en la mesa.',
          pasos: '1) Servidor entrega index.html ligero → 2) Router monta Web Components en el navegador → 3) Transiciones instantáneas sin recargar página.',
          cuandoUsar: 'Ideal para Dashboards privados (/admin, /configuracion) donde Google no necesita indexar.'
        }
      };

      stage.innerHTML = `
        <!-- 1. Explicación Visual Definitiva de las 4 Estrategias de Render -->
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>🍽️ 1. Entiende las 4 Estrategias de Render en 1 Minuto</h3>
            <span id="visual-strat-badge" class="demo-tag">HYBRID</span>
          </header>
          <nav class="demo-btn-group">
            <button type="button" class="demo-btn" data-vis-strat="hybrid">🏝️ Hybrid + Islas</button>
            <button type="button" class="demo-btn demo-btn-ghost" data-vis-strat="ssr">🖥️ SSR Dinámico</button>
            <button type="button" class="demo-btn demo-btn-ghost" data-vis-strat="ssg">📄 SSG Estático</button>
            <button type="button" class="demo-btn demo-btn-ghost" data-vis-strat="csr">⚡ CSR / SPA</button>
          </nav>
          <section id="visual-strat-card" class="demo-rules-note"></section>
        </article>

        <!-- 2. Data Fetching: Al Hacer Clic vs Automático al Entrar + Server Action ORM -->
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>📡 2. Data Fetching (Click vs Auto) + Server Action (Express + ORM)</h3>
            <span id="fetch-mode-badge" class="demo-tag">al-hacer-click</span>
          </header>
          <nav class="demo-btn-group">
            <button type="button" id="btn-mode-click" class="demo-btn">👆 Modo: Solo al Hacer Clic</button>
            <button type="button" id="btn-mode-auto" class="demo-btn demo-btn-ghost">⚡ Modo: Automático al Entrar</button>
            <button type="button" id="btn-fire-fetch-click" class="demo-btn demo-btn-ghost">📥 Hacer Clic para Pedir Datos</button>
          </nav>
          <output id="fetch-mode-log" class="demo-log-output"></output>

          <form id="form-server-action-orm" class="demo-form">
            <label class="demo-label">
              🖥️ Probar Mita Server Action (<code>POST /_mita/actions/empleos/crearEnMySQL</code>):
              <input id="sa-orm-title" class="demo-input" value="Ingeniero Backend Node + Express + ORM" required />
            </label>
            <button type="submit" class="demo-btn">Ejecutar Server Action en ORM</button>
          </form>
          <output id="sa-orm-log" class="demo-log-output">
            🗄️ Server Action lista para validar e insertar en Sequelize/MySQL ORM.
          </output>
        </article>

        <!-- 3. Mita Doc Advisor + SemVer Advisor (CONTRIBUTING.md) -->
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>🩺 3. Mita Doc Advisor + SemVer Release Advisor</h3>
            <button type="button" id="btn-lab-run-mitadoc" class="demo-btn">🩺 Auditar con Mita Doc</button>
          </header>
          <output id="lab-mitadoc-out" class="demo-log-output"></output>
        </article>
      `;

      const pintarEstrategiaVisual = (clave) => {
        const info = mapaVisualEstrategias[clave] || mapaVisualEstrategias.hybrid;
        const badge = stage.querySelector('#visual-strat-badge');
        const card = stage.querySelector('#visual-strat-card');
        if (badge) badge.textContent = clave.toUpperCase();
        if (card) {
          card.innerHTML = `
            <strong>${escaparHtml(info.titulo)}</strong><br />
            <span>${escaparHtml(info.metafora)}</span><br />
            <small><strong>Flujo:</strong> ${escaparHtml(info.pasos)}</small><br />
            <small><strong>Cuándo usarla:</strong> ${escaparHtml(info.cuandoUsar)}</small>
          `;
        }
      };
      pintarEstrategiaVisual('hybrid');

      const stopFetchSub = fetchCtrl.estado.suscribir((st) => {
        const badge = stage.querySelector('#fetch-mode-badge');
        const log = stage.querySelector('#fetch-mode-log');
        if (badge) badge.textContent = st.modoDisparo;
        if (log) {
          log.textContent = `${st.explicacionModo} | Estado=${st.estadoCarga} | Red=${st.totalPeticionesRed} | Caché=${st.totalAhorradasCache}`;
        }
      });

      const ejecutarAuditoriaLab = () => {
        const diag = ejecutarConsejeroMitaDoc({ raizDom: stage, latenciaUltimoRenderMs: 3.2 });
        const semver = calcularRecomendacionSemVer({
          versionActual: '2.7.0',
          hayCambiosEnCodigo: true,
          agregaNuevaFuncionalidadOExport: true
        });
        const out = stage.querySelector('#lab-mitadoc-out');
        if (out) {
          out.textContent = `🩺 Mita Doc (${diag.puntajeSalud}/100): ${diag.aciertos[0]} | 📦 SemVer (CONTRIBUTING.md): ${semver.versionActual} ➔ ${semver.versionRecomendada} (${semver.tipoSubida})`;
        }
      };
      ejecutarAuditoriaLab();

      const onClickFullstack = async (e) => {
        const stratBtn = e.target.closest('button[data-vis-strat]');
        if (stratBtn) {
          pintarEstrategiaVisual(stratBtn.getAttribute('data-vis-strat'));
          return;
        }
        if (e.target.id === 'btn-mode-click') {
          fetchCtrl.cambiarModoDisparo('al-hacer-click');
          await fetchCtrl.alEntrarALaVista();
        } else if (e.target.id === 'btn-mode-auto') {
          fetchCtrl.cambiarModoDisparo('automatico-al-entrar');
          await fetchCtrl.alEntrarALaVista();
        } else if (e.target.id === 'btn-fire-fetch-click') {
          await fetchCtrl.alHacerClickEnBoton();
        } else if (e.target.id === 'btn-lab-run-mitadoc') {
          ejecutarAuditoriaLab();
        }
      };

      const onSubmitSA = async (e) => {
        if (e.target.id !== 'form-server-action-orm') return;
        e.preventDefault();
        const titulo = stage.querySelector('#sa-orm-title')?.value || '';
        const res = await serverActionOrm.ejecutar({ titulo });
        const log = stage.querySelector('#sa-orm-log');
        if (log) {
          log.textContent = res.ok
            ? `✅ Server Action "${serverActionOrm.nombreAccion}" ejecutada en ${res.latenciaMs}ms => ID #${res.datos.idMySQL} (${res.datos.estado})`
            : `❌ Error: ${res.error}`;
        }
      };

      stage.addEventListener('click', onClickFullstack);
      stage.addEventListener('submit', onSubmitSA);

      this._limpiezasPreview.push(
        stopFetchSub,
        () => stage.removeEventListener('click', onClickFullstack),
        () => stage.removeEventListener('submit', onSubmitSA)
      );
      return;
    }

    if (this.leccionActiva === 'solid2') {
      const catalogoBolivia = {
        'Santa Cruz': ['Santa Cruz de la Sierra', 'Montero', 'Warnes'],
        Cochabamba: ['Cochabamba', 'Quillacollo', 'Sacaba'],
        'La Paz': ['La Paz', 'El Alto', 'Copacabana']
      };

      const depSignal = crearEstadoLocal('Santa Cruz');
      const ciudadesAsync = crearMemoAsincrono(
        async () => {
          const dep = depSignal.get();
          await new Promise((r) => setTimeout(r, 40));
          return catalogoBolivia[dep] || [];
        },
        { valorInicial: catalogoBolivia['Santa Cruz'], umbralEsperaProlongadaMs: 25, nombre: 'lab:ciudadesBolivia' }
      );
      const ciudadVinculada = crearEstadoVinculado(
        () => ciudadesAsync.estado.get().valor || [],
        (lista) => lista[0] || ''
      );
      const likesOptimistas = crearEstadoOptimistaConRollback(25);
      const streamCocina = crearFuncionServidorEnVivo('cocina/pedidos', async function* () {
        const pasos = ['🧾 Pedido #208 recibido', '🔥 En parrilla (Keperí)', '✅ Listo para entregar'];
        for (const paso of pasos) {
          yield paso;
          await new Promise((r) => setTimeout(r, 30));
        }
      });
      definirEstrategiaRenderRuta('/empleos', 'SSR');

      stage.innerHTML = `
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>⚡ Cascada Asíncrona (Solid 2.0 + Angular linkedSignal)</h3>
            <span class="demo-tag" id="solid2-pending-badge">Listo</span>
          </header>
          <p class="demo-help">Cambia de departamento: <code>crearMemoAsincrono</code> cancela race conditions y <code>crearEstadoVinculado</code> resetea la ciudad automáticamente.</p>
          <section class="demo-form-inline">
            <select id="solid2-dep-select" class="demo-input" aria-label="Departamento">
              <option value="Santa Cruz">Santa Cruz</option>
              <option value="Cochabamba">Cochabamba</option>
              <option value="La Paz">La Paz</option>
            </select>
            <select id="solid2-city-select" class="demo-input" aria-label="Ciudad"></select>
          </section>
          <output id="solid2-cascade-out" class="demo-log-output"></output>
        </article>

        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>📡 Live Server Function (async function*) + Optimistic Rollback</h3>
            <span class="demo-tag" id="solid2-likes-badge">25 likes</span>
          </header>
          <nav class="demo-btn-group" aria-label="Controles live y rollback">
            <button type="button" id="btn-solid2-live" class="demo-btn">▶ Iniciar Stream Live SSE</button>
            <button type="button" id="btn-solid2-opt-ok" class="demo-btn demo-btn-ghost">👍 Like Optimista (OK)</button>
            <button type="button" id="btn-solid2-opt-fail" class="demo-btn demo-btn-ghost">💥 Simular Fallo + Rollback</button>
          </nav>
          <output id="solid2-live-out" class="demo-log-output">Stream inactivo. Pulsa "Iniciar Stream Live SSE".</output>
          <output id="solid2-opt-out" class="demo-log-output">Sin mutación optimista todavía.</output>
        </article>

        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>🤖 Estrategia 1-Línea + Diagnóstico para Agentes IA</h3>
            <span class="demo-tag" id="solid2-strat-badge">SSR</span>
          </header>
          <nav class="demo-btn-group" aria-label="Cambiar estrategia en 1 línea">
            <button type="button" class="demo-btn demo-btn-ghost" data-solid2-strat="CSR">CSR</button>
            <button type="button" class="demo-btn demo-btn-ghost" data-solid2-strat="SSR">SSR</button>
            <button type="button" class="demo-btn demo-btn-ghost" data-solid2-strat="SSG">SSG</button>
            <button type="button" class="demo-btn demo-btn-ghost" data-solid2-strat="HYBRID">HYBRID</button>
            <button type="button" class="demo-btn" data-solid2-strat="RESUMABLE">RESUMABLE (Qwik)</button>
            <button type="button" id="btn-solid2-diag" class="demo-btn demo-btn-ghost">🩺 Emitir Diagnóstico IA</button>
          </nav>
          <output id="solid2-agent-out" class="demo-log-output">Ruta /empleos configurada en modo SSR.</output>
        </article>
      `;

      const pintarCascada = () => {
        const st = ciudadesAsync.estado.get();
        const badge = stage.querySelector('#solid2-pending-badge');
        const citySel = stage.querySelector('#solid2-city-select');
        const out = stage.querySelector('#solid2-cascade-out');
        if (badge) {
          badge.textContent = st.pendiente ? (st.esperaProlongada ? '⏳ Long Hold' : '⏳ Cargando...') : '✅ Sincronizado';
        }
        if (citySel) {
          const lista = st.valor || [];
          citySel.innerHTML = lista
            .map((c) => `<option value="${escaparHtml(c)}" ${c === ciudadVinculada.get() ? 'selected' : ''}>${escaparHtml(c)}</option>`)
            .join('');
        }
        if (out) {
          out.textContent = `Selección activa: ${ciudadVinculada.get()} (${depSignal.get()}) • Latencia: ${st.latenciaMs}ms`;
        }
      };

      const stopAsync = ciudadesAsync.estado.suscribir(pintarCascada);
      const stopCity = ciudadVinculada.suscribir(pintarCascada);
      const stopLikes = likesOptimistas.estado.suscribir((st) => {
        const b = stage.querySelector('#solid2-likes-badge');
        if (b) b.textContent = `${st.valor} likes${st.seHizoRollback ? ' (Rollback!)' : ''}`;
      });
      const stopLive = streamCocina.estado.suscribir((st) => {
        const out = stage.querySelector('#solid2-live-out');
        if (out && st.ticks > 0) {
          out.textContent = `📡 Live Tick #${st.ticks}: ${st.valor} (conectado=${st.conectado})`;
        }
      });

      const onChangeSolid2 = (e) => {
        if (e.target.id === 'solid2-dep-select') {
          depSignal.set(e.target.value);
        } else if (e.target.id === 'solid2-city-select') {
          ciudadVinculada.set(e.target.value);
        }
      };

      const onClickSolid2 = async (e) => {
        const stratBtn = e.target.closest('button[data-solid2-strat]');
        if (stratBtn) {
          const nueva = stratBtn.getAttribute('data-solid2-strat');
          const res = cambiarEstrategiaRender('/empleos', nueva);
          const badge = stage.querySelector('#solid2-strat-badge');
          const out = stage.querySelector('#solid2-agent-out');
          if (badge) badge.textContent = res.estrategia;
          if (out) out.textContent = `🔄 /empleos => ${res.estrategia}: ${res.detalles.servidorExpress}`;
          return;
        }
        if (e.target.id === 'btn-solid2-live') {
          await streamCocina.iniciar();
        } else if (e.target.id === 'btn-solid2-opt-ok') {
          const actual = likesOptimistas.valor();
          await likesOptimistas.aplicarConServidor(actual + 1, async () => actual + 1);
          const out = stage.querySelector('#solid2-opt-out');
          if (out) out.textContent = `✅ Servidor confirmó nuevo total: ${likesOptimistas.valor()} likes.`;
        } else if (e.target.id === 'btn-solid2-opt-fail') {
          const actual = likesOptimistas.valor();
          const r = await likesOptimistas.aplicarConServidor(actual + 1, async () => {
            throw new Error('503 MySQL ocupado');
          });
          const out = stage.querySelector('#solid2-opt-out');
          if (out) out.textContent = `↩️ Rollback automático (${r.error}): restaurado a ${r.valor} likes.`;
        } else if (e.target.id === 'btn-solid2-diag') {
          const diag = emitirDiagnosticoAgente('MITA_LECTURA_SIN_RASTREO', {
            origen: '<mi-tarjeta> -> render()',
            silencioso: true
          });
          const out = stage.querySelector('#solid2-agent-out');
          if (out) out.textContent = `[${diag.codigo}] ${diag.solucion} | Guía Agente: ${diag.guiaAgente}`;
        }
      };

      stage.addEventListener('change', onChangeSolid2);
      stage.addEventListener('click', onClickSolid2);

      this._limpiezasPreview.push(
        stopAsync,
        stopCity,
        stopLikes,
        stopLive,
        () => stage.removeEventListener('change', onChangeSolid2),
        () => stage.removeEventListener('click', onClickSolid2),
        () => ciudadesAsync.destruir(),
        () => ciudadVinculada.destruir(),
        () => likesOptimistas.destruir(),
        () => streamCocina.destruir(),
        () => depSignal.destroy()
      );
      return;
    }

    if (this.leccionActiva === 'v28syntax') {
      const contadorRastreado = crearEstadoLocal(1);
      const auditoriaNoRastreada = crearEstadoLocal(0);
      let ejecucionesEfecto = 0;

      const subpathsCatalogo = {
        'mita-dom/signals': {
          titulo: 'Signals, Efectos y sinRastrear',
          snippet:
            "import { crearEstadoLocal, crearEstadoCompartido, crearEfecto, sinRastrear, vincularTexto, renderCondicional } from 'mita-dom/signals';"
        },
        'mita-dom/async': {
          titulo: 'Solid 2.0 Async Graph, linkedSignal, Live SSE y Agentes IA',
          snippet:
            "import { crearMemoAsincrono, crearEstadoVinculado, crearEstadoOptimistaConRollback, crearFuncionServidorEnVivo, cambiarEstrategiaRender, emitirDiagnosticoAgente } from 'mita-dom/async';"
        },
        'mita-dom/element': {
          titulo: 'Clase Base MitaElement con Ciclo de Vida Completo',
          snippet: "import { MitaElement } from 'mita-dom/element';"
        },
        'mita-dom/rust': {
          titulo: 'Rust Memory Guard (Borrow Checker &T / &mut T + RAII Drop)',
          snippet:
            "import { crearEstadoReactivoInmutable, leerEstadoInmutable, mutarEstadoConHistorial, crearAmbitoConLimpiezaAutomatica } from 'mita-dom/rust';"
        },
        'mita-dom/ssr': {
          titulo: 'Render Universal (SSR / SSG / Hybrid Islands / CSR) + SEO',
          snippet: "import { renderizarVistaUniversal, MitaMeta } from 'mita-dom/ssr';"
        },
        'mita-dom/props': {
          titulo: 'Motor de Props React.dev para Web Components',
          snippet: "import { pasarPropsAElemento, leerPropsDeElemento } from 'mita-dom/props';"
        },
        'mita-dom/ui': {
          titulo: '@defer, Signal Forms, Paginación, Auth, Chat y Moderación',
          snippet:
            "import { renderizarVistaDiferida, crearFormularioReactivoConSignals, crearControladorPaginacion, crearControladorAuth } from 'mita-dom/ui';"
        },
        'mita-dom/devtools': {
          titulo: 'Profiler, Mita Doc Advisor y SemVer Release Advisor',
          snippet:
            "import { ejecutarConsejeroMitaDoc, calcularRecomendacionSemVer } from 'mita-dom/devtools';"
        }
      };

      stage.innerHTML = `
        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>🙈 1. <code>sinRastrear()</code> (<code>untrack</code>) — Cero Bucles Infinitos</h3>
            <span class="demo-tag" id="v28-effect-badge">Efecto: 0</span>
          </header>
          <p class="demo-help">
            El efecto lee <code>contadorRastreado</code> normalmente y lee <code>auditoriaNoRastreada</code> dentro de <code>sinRastrear()</code>.
          </p>
          <nav class="demo-btn-group" aria-label="Probar sinRastrear vs rastreado">
            <button type="button" id="btn-v28-untracked" class="demo-btn">
              🙈 +1 Auditoría (NO dispara efecto)
            </button>
            <button type="button" id="btn-v28-tracked" class="demo-btn demo-btn-ghost">
              ⚡ +1 Filtro Rastreado (SÍ dispara efecto)
            </button>
          </nav>
          <output id="v28-untrack-out" class="demo-log-output"></output>
        </article>

        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>📦 2. Explorador de los 8 Subpath Exports (<code>mita-dom@2.8.0</code>)</h3>
            <span class="demo-tag" id="v28-subpath-badge">mita-dom/signals</span>
          </header>
          <nav class="demo-btn-group" aria-label="Selector de Subpath Exports">
            ${Object.keys(subpathsCatalogo)
              .map(
                (ruta, idx) =>
                  `<button type="button" class="demo-btn ${idx === 0 ? '' : 'demo-btn-ghost'}" data-v28-subpath="${ruta}">${ruta.replace('mita-dom/', '/')}</button>`
              )
              .join('')}
          </nav>
          <pre id="v28-subpath-code" class="demo-pre"></pre>
        </article>

        <article class="demo-panel">
          <header class="demo-panel-head">
            <h3>🧬 3. Inspector <code>obtenerCicloDeVida()</code> + Consola Silenciosa</h3>
            <span class="demo-tag">2026-11-24</span>
          </header>
          <nav class="demo-btn-group" aria-label="Inspeccionar ciclo de vida">
            <button type="button" id="btn-v28-lifecycle" class="demo-btn">
              🔍 Llamar this.obtenerCicloDeVida()
            </button>
            <button type="button" id="btn-v28-debug-toggle" class="demo-btn demo-btn-ghost">
              🔇 Modo Consola: Silenciosa en Tests/Prod
            </button>
          </nav>
          <output id="v28-lifecycle-out" class="demo-log-output">
            Pulsa el botón para leer el estado real del ciclo de vida de &lt;demo-laboratorio-signals&gt;.
          </output>
        </article>
      `;

      const pintarEstadoUntrack = (origen) => {
        const badge = stage.querySelector('#v28-effect-badge');
        const out = stage.querySelector('#v28-untrack-out');
        if (badge) badge.textContent = `Efecto: ${ejecucionesEfecto}`;
        if (out) {
          out.textContent =
            `[${origen}] filtro=${contadorRastreado.get()} | auditoria=${auditoriaNoRastreada.get()} | ejecucionesEfecto=${ejecucionesEfecto}`;
        }
      };

      const stopEfectoV28 = crearEfecto(() => {
        const valRastreado = contadorRastreado.get();
        const valAuditoria = sinRastrear(() => auditoriaNoRastreada.get());
        ejecucionesEfecto += 1;
        const badge = stage.querySelector('#v28-effect-badge');
        const out = stage.querySelector('#v28-untrack-out');
        if (badge) badge.textContent = `Efecto: ${ejecucionesEfecto}`;
        if (out) {
          out.textContent =
            `[crearEfecto] filtro=${valRastreado} | auditoria=${valAuditoria} | ejecucionesEfecto=${ejecucionesEfecto}`;
        }
      });

      const pintarSubpath = (clave) => {
        const info = subpathsCatalogo[clave];
        if (!info) return;
        const badge = stage.querySelector('#v28-subpath-badge');
        const pre = stage.querySelector('#v28-subpath-code');
        if (badge) badge.textContent = clave;
        if (pre) pre.textContent = `// ${info.titulo}\n${info.snippet}`;
      };
      pintarSubpath('mita-dom/signals');

      let debugActivoLocal = false;
      const onClickV28 = (e) => {
        const subpathBtn = e.target.closest('button[data-v28-subpath]');
        if (subpathBtn) {
          stage.querySelectorAll('button[data-v28-subpath]').forEach((b) => b.classList.add('demo-btn-ghost'));
          subpathBtn.classList.remove('demo-btn-ghost');
          pintarSubpath(subpathBtn.getAttribute('data-v28-subpath'));
          return;
        }

        if (e.target.id === 'btn-v28-untracked') {
          auditoriaNoRastreada.set(auditoriaNoRastreada.get() + 1);
          pintarEstadoUntrack('sinRastrear');
        } else if (e.target.id === 'btn-v28-tracked') {
          contadorRastreado.set(contadorRastreado.get() + 1);
        } else if (e.target.id === 'btn-v28-lifecycle') {
          const snap =
            typeof this.obtenerCicloDeVida === 'function'
              ? this.obtenerCicloDeVida()
              : { componente: 'demo-laboratorio-signals', faseActual: 'montado', montado: true, renders: 1 };
          const out = stage.querySelector('#v28-lifecycle-out');
          if (out) {
            out.textContent =
              `🧬 <${snap.componente}> => fase=${snap.faseActual} | montado=${snap.montado} | renders=${snap.renders} | limpiezas=${snap.limpiezasPendientes ?? 0}`;
          }
        } else if (e.target.id === 'btn-v28-debug-toggle') {
          debugActivoLocal = !debugActivoLocal;
          e.target.textContent = debugActivoLocal
            ? '🔊 Modo Consola: { debug: true } Activado'
            : '🔇 Modo Consola: Silenciosa en Tests/Prod';
          const out = stage.querySelector('#v28-lifecycle-out');
          if (out) {
            out.textContent = debugActivoLocal
              ? '🔊 Opt-in activo: crearEstadoLocal(0, { debug: true }) imprimirá mutaciones en consola.'
              : '🔇 Modo limpio: 0 ruido en Vitest, CI y producción.';
          }
        }
      };

      stage.addEventListener('click', onClickV28);

      this._limpiezasPreview.push(
        stopEfectoV28,
        () => stage.removeEventListener('click', onClickV28),
        () => contadorRastreado.destroy(),
        () => auditoriaNoRastreada.destroy()
      );
    }
  }

  disconnectedCallback() {
    if (this._stopLeccion) {
      this._stopLeccion();
      this._stopLeccion = null;
    }
    this.limpiarPreview();
  }
}

if (!customElements.get('demo-laboratorio-signals')) {
  customElements.define('demo-laboratorio-signals', DemoLaboratorioSignals);
}
