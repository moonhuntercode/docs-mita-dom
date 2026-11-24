# ⚡ Eficiencia Granular: Light DOM y ES Modules

La industria del desarrollo web ha estado obsesionada con el **Virtual DOM** (React, Vue) durante la última década. El Virtual DOM funciona creando una copia entera de tu página web en memoria, comparándola con el HTML real cada vez que una variable cambia, y luego aplicando los parches. Este proceso, aunque rápido en aplicaciones pequeñas, se vuelve un cuello de botella terrible (CPU overhead) en aplicaciones de producción masivas.

**MitaDOM descarta el Virtual DOM por completo.** Nosotros usamos la fuerza bruta de la API Nativa del navegador: **Custom Elements + Light DOM + Signals**.

---

## 1. El Paradigma de ES Modules (Sin Compiladores Pesados)

En frameworks modernos tradicionales necesitas un "Bundler" (Webpack, Rollup) para traducir `.vue` o `.jsx` a código que el navegador entienda.
MitaDOM promueve el uso nativo de **ES Modules** (`import` / `export` en archivos `.js`).

**Ventajas Estrictas:**
1. **Carga Diferida Nativa**: El navegador carga los módulos solo cuando los necesita en la red.
2. **Cero Transformación**: Lo que escribes es lo que se ejecuta. Si hay un error en la línea 42, el navegador te dirá que falló en la línea 42, no en código empaquetado incomprensible.
3. **Mita HMR Plugin**: MitaDOM provee una integración nativa con Vite (`mitaHmrPlugin`) para recargar tus clases en caliente sin perder el estado de la aplicación en desarrollo.

---

## 2. Light DOM vs Shadow DOM

Los Web Components nativos te permiten encapsular estilos usando *Shadow DOM* (`this.attachShadow({ mode: 'open' })`). Sin embargo, el Shadow DOM aísla tanto el componente que arruina el CSS Global, el SEO profundo y la accesibilidad (ARIA).

MitaDOM, de forma opinionada, te empuja a usar **Light DOM**. Tu componente (`this.innerHTML`) renderiza directamente en el árbol normal del navegador. Esto significa que heredará las fuentes, colores y estilos globales de tu aplicación automáticamente, reduciendo duplicación masiva de CSS.

---

## 3. El Secreto de la Eficiencia: Actualizaciones Granulares

La clave de MitaDOM para tener un rendimiento absurdo es que **el `render()` se ejecuta una sola vez en la vida del componente**. Todo el dinamismo posterior ocurre mediante manipulación microscópica (Granular) del DOM.

Veámoslo con el ejemplo de un Loader (Barra de progreso):

### ❌ Forma Incorrecta (Estilo React/Re-render Total)
Si re-ejecutamos `this.innerHTML` cada vez que el porcentaje cambia (de 0 a 100), el navegador:
1. Destruye los nodos `div` y `span` anteriores.
2. Vuelve a calcular el layout CSS entero de la sección.
3. Pierde animaciones en curso.
*(Hacer esto 60 veces por segundo freirá el CPU del móvil del usuario).*

### ✅ Forma Correcta en MitaDOM (Granularidad)
1. Pintamos el HTML en `alMontar()` **una sola vez**.
2. Guardamos una referencia exacta a los nodos minúsculos que van a cambiar (el texto `span` y la barra `div`).
3. Suscribimos esos nodos a un `Signal`.

```javascript
alMontar() {
  // 1. Pintado inicial (Una sola vez en la vida)
  this.innerHTML = `
    <div class="contenedor-loader">
      <div id="mi-barra" style="width: 0%;"></div>
      <span id="mi-texto">0%</span>
    </div>
  `;

  // 2. Apuntamos como francotirador a los únicos nodos que cambiarán
  const $barra = this.querySelector('#mi-barra');
  const $texto = this.querySelector('#mi-texto');

  // 3. Suscripción Granular (Eficiencia Quirúrgica)
  this.porcentajeSignal.suscribir(porcentaje => {
    // Modificamos directamente el estilo nativo y el textContent en < 0.1ms
    $barra.style.width = `${porcentaje}%`;
    $texto.textContent = `${porcentaje}%`;
  });
}
```

Al hacer esto, evitamos el coste de "Parseo HTML" del navegador. El usuario percibe una animación de progreso fluida a 60FPS porque el motor de JavaScript solo está modificando dos propiedades en memoria de todo el inmenso árbol DOM. 

¡Esto es hacer desarrollo Web de forma inteligente, granular y orientada a producción!
