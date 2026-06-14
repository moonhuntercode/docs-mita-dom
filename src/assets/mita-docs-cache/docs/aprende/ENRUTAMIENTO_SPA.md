# 🧭 Enrutamiento SPA Avanzado (MitaDOM vs Frameworks)

Has visto la documentación de SvelteKit, React Router o Remix: cientos de APIs, `<Outlet>`, `+layout.svelte`, `useParams()`, `loader()`.  
Todo eso existe porque esos frameworks manejan un Virtual DOM o compilan el código.  
**MitaDOM** está diseñado bajo la filosofía de la **Web Plataforma Nivel Arquitecto**: te enseñamos que con HTML5, ES Modules y Custom Elements, puedes lograr **la misma robustez con 0 dependencias.**

A continuación, una guía profunda de Patrones Avanzados.

---

## 1. Code Splitting y Lazy Loading (Importaciones Dinámicas)

Para que tu aplicación inicie en microsegundos, no debes cargar todo el JS en `index.html`. Debemos usar `import()` asíncrono para que empaquetadores como **Vite** creen "Chunks" separados.

<div class="demo-wrapper">
  <div class="code-editor-mock">
    <div class="editor-header">
      <div class="mac-dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
      <span class="filename">router.js (Lazy Load)</span>
    </div>
    <div class="editor-content">
<pre><code class="language-javascript"><span class="token keyword">import</span> { rutaActual } <span class="token keyword">from</span> <span class="token string">'mita-dom'</span>;

<span class="token comment">// Catálogo de Rutas</span>
<span class="token keyword">const</span> registroRutas <span class="token operator">=</span> <span class="token punctuation">[</span>
  <span class="token punctuation">{</span> path<span class="token operator">:</span> <span class="token string">'/'</span><span class="token punctuation">,</span> tag<span class="token operator">:</span> <span class="token string">'vista-inicio'</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token punctuation">{</span> path<span class="token operator">:</span> <span class="token string">'/blog'</span><span class="token punctuation">,</span> tag<span class="token operator">:</span> <span class="token string">'mita-blog'</span><span class="token punctuation">,</span> lazy<span class="token operator">:</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token keyword">import</span><span class="token punctuation">(</span><span class="token string">'./blog.js'</span><span class="token punctuation">)</span> <span class="token punctuation">}</span>
<span class="token punctuation">]</span><span class="token punctuation">;</span>

rutaActual.<span class="token function">suscribir</span><span class="token punctuation">(</span><span class="token keyword">async</span> <span class="token punctuation">(</span>ruta<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> config <span class="token operator">=</span> registroRutas.<span class="token function">find</span><span class="token punctuation">(</span>r <span class="token operator">=&gt;</span> r.path <span class="token operator">===</span> ruta<span class="token punctuation">)</span><span class="token punctuation">;</span>
  
  <span class="token keyword">if</span> <span class="token punctuation">(</span>config<span class="token operator">?.</span>lazy <span class="token operator">&amp;&amp;</span> <span class="token operator">!</span>document.<span class="token function">querySelector</span><span class="token punctuation">(</span>config.tag<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">try</span> <span class="token punctuation">{</span>
      <span class="token keyword">await</span> config.<span class="token function">lazy</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// Fallback de Red (Error Boundary)</span>
    <span class="token punctuation">}</span> <span class="token keyword">catch</span><span class="token punctuation">(</span>err<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token function">alert</span><span class="token punctuation">(</span><span class="token string">"Error de conexión."</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token keyword">return</span><span class="token punctuation">;</span> <span class="token punctuation">}</span>
    
    <span class="token keyword">const</span> el <span class="token operator">=</span> document.<span class="token function">createElement</span><span class="token punctuation">(</span>config.tag<span class="token punctuation">)</span><span class="token punctuation">;</span>
    document.<span class="token function">getElementById</span><span class="token punctuation">(</span><span class="token string">'app'</span><span class="token punctuation">)</span>.<span class="token function">appendChild</span><span class="token punctuation">(</span>el<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre>
    </div>
  </div>
</div>

---

## 2. Advanced Layouts (`+layout.svelte` vs `<slot>`)

En SvelteKit, creas un archivo `+layout.svelte` y usas `{@render children()}` para envolver rutas. En MitaDOM, usamos la API nativa de **Slots** dentro de un Custom Element.

<div class="demo-wrapper">
  <div class="code-editor-mock">
    <div class="editor-header">
      <div class="mac-dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
      <span class="filename">mita-layout.js (Advanced Layouts)</span>
    </div>
    <div class="editor-content">
<pre><code class="language-javascript"><span class="token comment">// En tu router.js, añade la propiedad layout:</span>
<span class="token punctuation">{</span> path<span class="token operator">:</span> <span class="token string">'/perfil'</span><span class="token punctuation">,</span> tag<span class="token operator">:</span> <span class="token string">'mita-perfil'</span><span class="token punctuation">,</span> layout<span class="token operator">:</span> <span class="token string">'mita-layout-dashboard'</span> <span class="token punctuation">}</span>

<span class="token comment">// Y en router.js inyectamos el componente DENTRO del slot del layout:</span>
<span class="token keyword">if</span> <span class="token punctuation">(</span>config.layout<span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token keyword">let</span> $layout <span class="token operator">=</span> document.<span class="token function">querySelector</span><span class="token punctuation">(</span>config.layout<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>$layout<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    $layout <span class="token operator">=</span> document.<span class="token function">createElement</span><span class="token punctuation">(</span>config.layout<span class="token punctuation">)</span><span class="token punctuation">;</span>
    document.body.<span class="token function">appendChild</span><span class="token punctuation">(</span>$layout<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  <span class="token comment">// La magia nativa: AppendChild lo proyecta en el <slot></span>
  $layout.<span class="token function">appendChild</span><span class="token punctuation">(</span>$componenteNuevo<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span></code></pre>
    </div>
  </div>
</div>

---

## 3. Nested Routes (Sub-rutas / Outlets)

React Router usa `<Outlet>`. Vue Router usa `<router-view>`. 
En MitaDOM, como cada Signal es reactivo independientemente, puedes crear un "Sub-Router" local suscribiéndote a la URL desde dentro del componente, logrando **Rutas Anidadas puras**.

<div class="demo-wrapper">
  <div class="code-editor-mock">
    <div class="editor-header">
      <div class="mac-dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
      <span class="filename">perfil.js (Sub-Router Local)</span>
    </div>
    <div class="editor-content">
<pre><code class="language-javascript"><span class="token keyword">import</span> { rutaActual } <span class="token keyword">from</span> <span class="token string">'mita-dom'</span>;

<span class="token keyword">export class</span> <span class="token class-name">MitaPerfil</span> <span class="token keyword">extends</span> <span class="token class-name">HTMLElement</span> <span class="token punctuation">{</span>
  <span class="token function">connectedCallback</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">this</span>.$tabInfo <span class="token operator">=</span> <span class="token keyword">this</span>.<span class="token function">querySelector</span><span class="token punctuation">(</span><span class="token string">'#tab-info'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">this</span>.$tabSeguridad <span class="token operator">=</span> <span class="token keyword">this</span>.<span class="token function">querySelector</span><span class="token punctuation">(</span><span class="token string">'#tab-seg'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// Actuamos como un <Outlet> local</span>
    <span class="token keyword">this</span>._subscripcion <span class="token operator">=</span> rutaActual.<span class="token function">suscribir</span><span class="token punctuation">(</span>ruta <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>ruta.<span class="token function">startsWith</span><span class="token punctuation">(</span><span class="token string">'/perfil'</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token keyword">return</span><span class="token punctuation">;</span>
      
      <span class="token keyword">this</span>.$tabInfo.style.display <span class="token operator">=</span> ruta <span class="token operator">===</span> <span class="token string">'/perfil/info'</span> <span class="token operator">?</span> <span class="token string">'block'</span> <span class="token operator">:</span> <span class="token string">'none'</span><span class="token punctuation">;</span>
      <span class="token keyword">this</span>.$tabSeguridad.style.display <span class="token operator">=</span> ruta <span class="token operator">===</span> <span class="token string">'/perfil/seguridad'</span> <span class="token operator">?</span> <span class="token string">'block'</span> <span class="token operator">:</span> <span class="token string">'none'</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  
  <span class="token function">disconnectedCallback</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    rutaActual.<span class="token function">desuscribir</span><span class="token punctuation">(</span><span class="token keyword">this</span>._subscripcion<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// Cleanup memory</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span></code></pre>
    </div>
  </div>
</div>

---

## 4. Dynamic Params y Rest Parameters (`[...rest]`)

SvelteKit usa un sistema de archivos para compilar expresiones regulares para cosas como `/[org]/[repo]/tree/[...rest]`.
La **Web Plataforma** moderna incluye `URLPattern`, que soporta parámetros exactos, dinámicos, y Wildcards/CatchAlls de forma nativa en tu navegador.

<div class="demo-wrapper">
  <div class="code-editor-mock">
    <div class="editor-header">
      <div class="mac-dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
      <span class="filename">router.js (URLPattern API)</span>
    </div>
    <div class="editor-content">
<pre><code class="language-javascript"><span class="token comment">// Emulando Rest Parameters [...rest] en SvelteKit o Remix</span>
<span class="token keyword">const</span> patternGitHub <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">URLPattern</span><span class="token punctuation">(</span><span class="token punctuation">{</span> pathname<span class="token operator">:</span> <span class="token string">'/:org/:repo/tree/*'</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// Cuando el usuario visita: /sveltejs/kit/tree/docs/advanced.md</span>
<span class="token keyword">let</span> match <span class="token operator">=</span> patternGitHub.<span class="token function">exec</span><span class="token punctuation">(</span><span class="token punctuation">{</span> pathname<span class="token operator">:</span> rutaActual.value <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">if</span> <span class="token punctuation">(</span>match<span class="token punctuation">)</span> <span class="token punctuation">{</span>
  console.<span class="token function">log</span><span class="token punctuation">(</span>match.pathname.groups.org<span class="token punctuation">)</span><span class="token punctuation">;</span>  <span class="token comment">// "sveltejs"</span>
  console.<span class="token function">log</span><span class="token punctuation">(</span>match.pathname.groups.repo<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">// "kit"</span>
  console.<span class="token function">log</span><span class="token punctuation">(</span>match.pathname.groups<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>   <span class="token comment">// "docs/advanced.md" (Catch All)</span>
  
  <span class="token comment">// Inyectas la vista y le envías los parámetros</span>
  $el.<span class="token function">setAttribute</span><span class="token punctuation">(</span><span class="token string">'file-path'</span><span class="token punctuation">,</span> match.pathname.groups<span class="token punctuation">[</span><span class="token number">0</span><span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span></code></pre>
    </div>
  </div>
</div>

---

## 5. Navigation Guards (Intercepción)

Protege tus datos abortando descargas de Chunks si el usuario no tiene privilegios.

```javascript
// Dentro del router
if (configRuta.meta?.auth && !localStorage.getItem('token')) {
  alert("🛡️ Guard Activado: Debes iniciar sesión.");
  import('mita-dom').then(m => m.navegarA('/login'));
  return; // Aborta la descarga e inyección
}
```

## 6. Despliegue en Producción (Rewrites)

Al servir tu aplicación, el servidor debe devolver `index.html` sin importar la ruta ingresada, dejando que `mita-dom` asuma el control en el cliente.

**Ejemplo en `vercel.json`**:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
