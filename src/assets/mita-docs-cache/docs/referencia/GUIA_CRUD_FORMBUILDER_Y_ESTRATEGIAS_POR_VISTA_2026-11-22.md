# 🗂️ Guía Completa: CRUD Multi-Categoría, FormBuilder Re-usable (Buscar y Registrar) y Estrategias por Vista (2026-11-22)

Esta guía muestra paso a paso cómo construir un sistema **CRUD completo para cualquier categoría** (`empleos`, `productos`, `cursos`, `documentos`, `servicios`) combinando `crearControladorCrudCategorias`, `crearFormularioReusable` y `crearControladorEstrategiaPorVista`.

---

## 1. 🧱 Cómo Hacer un Formulario Re-usable para Buscar y Registrar (`crearFormularioReusable`)

En lugar de escribir validaciones repetitivas en cada vista, `crearFormularioReusable` genera HTML5 semántico (`<form>`, `<fieldset>`, `<legend>`, `<label>`, `<output aria-live="polite">`) y valida `required`, `minLength` y `pattern` automáticamente:

```javascript
import {
  crearControladorCrudCategorias,
  crearFormularioReusable
} from 'mita-dom';

// 1. Inicializar el motor CRUD Multi-Categoría (con persistencia e historial RustGuard)
const crud = crearControladorCrudCategorias({
  nombreEstado: 'app:catalogo_general',
  categoriasPermitidas: ['empleos', 'productos', 'cursos', 'documentos', 'servicios']
});

// 2. Formulario Re-usable para REGISTRAR cualquier categoría
const formRegistro = crearFormularioReusable({
  id: 'form-crud-registro',
  titulo: '➕ Registrar Nuevo Elemento en el Catálogo',
  submitText: 'Guardar en Catálogo',
  fields: [
    {
      name: 'titulo',
      label: 'Título o Nombre *',
      type: 'text',
      placeholder: 'Ej: Desarrollador Mita-DOM Senior',
      required: true,
      minLength: 3,
      errorMsg: 'El título debe tener al menos 3 caracteres.'
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
      name: 'descripcion',
      label: 'Descripción *',
      type: 'textarea',
      placeholder: 'Describe los detalles...',
      required: true,
      minLength: 5
    },
    {
      name: 'valorNumerico',
      label: 'Precio / Salario / Puntos (Bs.)',
      type: 'number',
      placeholder: 'Ej: 3500'
    },
    {
      name: 'destacado',
      label: '⭐ Marcar como elemento destacado',
      type: 'checkbox'
    }
  ],
  onSubmit: (datosValidados) => {
    crud.crearNuevoRegistro(datosValidados);
  }
});

// Montar en cualquier contenedor DOM y obtener su función de limpieza:
const detenerForm = formRegistro.montarEn(document.querySelector('#slot-form-crud'));
```

---

## 2. 🔍 Buscador, Filtrado por Categoría, Edición y Eliminación (CRUD Completo)

```javascript
// 1. Filtrar en tiempo real por texto, categoría y destacados:
crud.aplicarFiltrosDeBusqueda({
  textoBusqueda: 'Mita-DOM',
  categoriaActiva: 'empleos', // o 'todos'
  soloDestacados: false
});

const itemsVisibles = crud.listarRegistrosFiltrados();

// 2. Actualizar un registro existente con motivo auditable:
crud.actualizarRegistroExistente(
  itemsVisibles[0].id,
  { valorNumerico: 9200, destacado: true },
  'Ajuste salarial aprobado por Administración'
);

// 3. Alternar estrella de destacado:
crud.alternarDestacadoPorId(itemsVisibles[0].id);

// 4. Eliminar un registro por ID:
crud.eliminarRegistroPorId(itemsVisibles[0].id, 'Oferta cubierta exitosamente');

// 5. Consultar estadísticas por categoría e historial de mutaciones:
const stats = crud.obtenerEstadisticasPorCategoria();
console.table(stats.conteoPorCategoria);
console.table(stats.historialCambios);
```

---

## 3. 🌐 Control Granular de Estrategias de Render por Vista (`Hybrid`, `SSR`, `SSG`, `CSR`)

Con `crearControladorEstrategiaPorVista()` puedes cambiar cómo se renderiza cada ruta específica o desactivarla sin reiniciar el servidor:

```javascript
import { crearControladorEstrategiaPorVista } from 'mita-dom';

const gestorVistas = crearControladorEstrategiaPorVista();

// Cambiar la vista '/empleos' a modo Hybrid (SSR + Islas Light DOM):
gestorVistas.cambiarModoDeVistaEnCaliente('/empleos', 'hybrid');

// Cambiar la vista '/docs' a modo SSG (HTML estático pre-compilado):
gestorVistas.cambiarModoDeVistaEnCaliente('/docs', 'ssg');

// Desactivar temporalmente '/admin' si está en ventana de mantenimiento:
gestorVistas.activarODesactivarVista('/admin', false);
```
