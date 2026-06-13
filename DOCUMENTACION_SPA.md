# 📚 Arquitectura y Comunicación en MitaDOM SPA

Este proyecto demuestra cómo estructurar una aplicación completa, escalable y modular utilizando `mita-dom` sin la necesidad de pesados *frameworks* de terceros.

## 🧱 Estructura Modular y Light DOM

A diferencia de *frameworks* que inyectan toda la aplicación en un solo `<div id="app">` usando JavaScript masivo (*innerHTML*), aquí respetamos la semántica de la web:

- El archivo `index.html` contiene el esqueleto real (`<header>`, `<nav>`, `<main>`), favoreciendo el SEO y la accesibilidad.
- Los componentes (`<mita-tarjeta>`, `<mita-formulario>`, `<mita-perfil>`) se insertan en el Light DOM, donde el navegador puede renderizarlos nativamente de la forma más rápida posible.
- CSS y JS viven en archivos separados (`style.css`, `main.js`), logrando un verdadero **Separation of Concerns**.

---

## ⚡ Comunicación sin "Props" (El Patrón de Signals)

En frameworks como React o Vue, para pasar datos de un componente a otro, generalmente usamos `props` (de padre a hijo) o Contextos complejos. En MitaDOM, utilizamos el **Patrón de Signals Globales** como un Bus de Eventos Reactivo.

### ¿Cómo funciona en esta SPA?

1. **El Origen de los Datos (El Formulario):**
   El componente `<mita-formulario>` captura el nombre del usuario. En lugar de disparar eventos personalizados o usar `props`, simplemente muta el objeto central:
   ```javascript
   import { estadoAppGlobal } from 'mita-dom';
   
   // Actualizamos globalmente
   estadoAppGlobal.value = { ...estadoAppGlobal.value, usuario: "Nuevo Nombre" };
   ```

2. **La Reacción (El Perfil):**
   El componente `<mita-perfil>` está suscrito al mismo `estadoAppGlobal`. Al instante en que el formulario modifica el valor, el Perfil reacciona sin necesidad de recargar ni saber quién hizo el cambio:
   ```javascript
   estadoAppGlobal.suscribir((estado) => {
       if (estado && estado.usuario) {
           this.$nombre.textContent = estado.usuario; // UI Actualizada al instante
       }
   });
   ```

### 🏆 Beneficios de esta alternativa a Props:
- **Desacoplamiento Total:** El formulario y el perfil no necesitan conocerse, ni estar en la misma jerarquía del DOM. Uno puede estar en el `<header>` y otro en el `<footer>`.
- **Rendimiento Quirúrgico:** No hay un ciclo masivo de re-renderización del DOM (Virtual DOM). Solo se ejecuta la función de actualización específica, mutando el `textContent` exacto.

---

## 📈 Siguientes Pasos y Escalabilidad

Tu SPA ya cuenta con **Navegación Nativamente Optimizada** (Navigation API) y **Formularios Dinámicos Reactivos**. Para seguir escalando podrías:

1. **Separar los Signals Globales:** Si tu app crece, en lugar de usar un solo `estadoAppGlobal` genérico de MitaDOM, puedes instanciar múltiples Signals independientes en tu proyecto (ej: `estadoCarrito = new Signal([])`, `estadoAutenticacion = new Signal(false)`) e importarlos donde se necesiten.
2. **Conectar con Backend:** El componente `mita-perfil` ya usa la utilidad `crearRecurso()`. Podrías reemplazar el `setTimeout` por un `fetch()` real a una base de datos para combinar reactividad con persistencia en tiempo real.
