# 🚀 Despliegue en Vercel: Resolución de Errores Comunes

Esta guía documenta los problemas encontrados al desplegar una SPA basada en **MitaDOM** en Vercel y cómo se solucionaron. Es una referencia técnica indispensable para el equipo.

## 🐛 El Problema: `ERR_MODULE_NOT_FOUND` en Vercel

Durante el pipeline de despliegue continuo (CI/CD) de Vercel, el proceso de compilación (`npm run build`) colapsaba en el paso de ejecución de Vite.

**Síntoma en Logs de Vercel:**
```text
vite.config.js (6:30) [UNRESOLVED_IMPORT] Could not resolve 'mita-dom' in vite.config.js
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'mita-dom' imported from /vercel/path0/node_modules/.vite-temp/vite.config.js.timestamp-...
```

Adicionalmente, si el *build* llegaba a pasar (por haber omitido la importación en `vite.config.js`), al entrar a la ruta `https://docs-mita-dom.vercel.app/docs`, la aplicación devolvía el error interno:
> **📄 Documento no encontrado**

### 🔍 Análisis de Causa Raíz

1. **Dependencia Local Estricta (`file:../`)**
   El proyecto SPA referenciaba a `mita-dom` en el `package.json` utilizando un enlace local (`"mita-dom": "file:../mita-dom"`).
   Al clonar el repositorio, Vercel aísla la compilación al directorio raíz de la SPA. Puesto que `../mita-dom` no existía físicamente en el contenedor efímero de Vercel, `npm install` fallaba silenciosamente al crear el enlace simbólico. Como resultado, la librería nunca se instalaba.

2. **Caché Persistente del Lockfile**
   Aunque cambiáramos el `package.json` a `"mita-dom": "^2.3.1"`, el archivo `package-lock.json` retenía la resolución antigua (`{ resolved: '../mita-dom', link: true }`). Vercel utiliza un comando similar a `npm ci` que respeta el lockfile de forma autoritaria.

3. **Inflexibilidad del Vite Alias para Glob Imports**
   El código utilizaba `import.meta.glob('@mita-docs/**/*.md')` para indexar el Markdown de la documentación en tiempo de compilación. El alias `@mita-docs` apuntaba rígidamente a `../mita-dom`, una ruta que resultaba inválida en producción.

4. **Archivos Excluidos en la Publicación a NPM**
   Cuando se migró a usar la dependencia de NPM, Vite comenzó a compilar bien, pero `DOCS_MAP` seguía vacío. Esto ocurrió porque el archivo `package.json` de `mita-dom` original tenía su propiedad `"files": ["*.md"]`, lo que empaquetaba `README.md` pero **excluía por completo las carpetas `docs/` y `changelogs/`** del tarball publicado en NPM. Vercel descargaba la librería vacía de documentación.

5. **El Filtrado Inevitable de fast-glob sobre `node_modules`**
   Incluso después de subir la versión de NPM, el Glob Import seguía regresando vacío. Descubrimos que `import.meta.glob` (usando `fast-glob` por detrás) **excluye siempre la carpeta `node_modules/` por defecto**. Era imposible decirle a Vite que extrajera los `.md` de una dependencia alojada en Vercel.

---

## 🛠️ La Solución Definitiva en Cinco Pasos

Para estabilizar el despliegue y mantener la excelente Experiencia de Desarrollo (DX) en local, aplicamos las siguientes correcciones:

### 1. Alias Inteligente (Fallback) en Vite
Se modificó `vite.config.js` para que el alias del motor de documentación determine dinámicamente dónde se encuentra la librería.

```javascript
import fs from 'fs';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // 💡 Fallback: Si existe en desarrollo usa local, en Vercel usa node_modules
      '@mita-docs': fs.existsSync(path.resolve(__dirname, '../mita-dom/package.json'))
        ? path.resolve(__dirname, '../mita-dom')
        : path.resolve(__dirname, 'node_modules/mita-dom')
    }
  }
});
```

### 2. Actualización a Registro Global (NPM)
Se alteró el `package.json` para utilizar la versión empaquetada globalmente en lugar del enlace local:
```json
"dependencies": {
  "mita-dom": "^2.3.1"
}
```

### 3. Inclusión de Directorios en NPM (`mita-dom@2.3.2`)
Se actualizó el `package.json` del core (`mita-dom`) para obligar a NPM a empaquetar las subcarpetas necesarias:
```json
"files": [
  "dist",
  "src",
  "mita-dom.d.ts",
  "*.md",
  "docs",
  "changelogs",
  "LICENSE"
]
```

### 4. Purgado y Regeneración del Lockfile
Se forzó a NPM a reescribir la procedencia del paquete ejecutando localmente:
```bash
npm install mita-dom@2.3.2
```

### 5. Script de Sincronización Pre-Build (La Bala de Plata)
Dado que Vite siempre bloquea la lectura de `node_modules/` en sus Glob Imports, creamos un script (`scripts/sync-docs.js`) que se dispara en los ciclos `predev` y `prebuild`. Este script copia automáticamente los `.md` desde la ruta en la que estén instalados (sea en local o Vercel) y los inyecta en `src/assets/mita-docs-cache/`. 
Con esto, `docsRegistry.js` hace `import.meta.glob` de forma local, **eludiendo todas las restricciones de seguridad** y asegurando el despliegue al 100%.

✅ **Resultado Final:** Vercel instala exitosamente la librería con todas sus carpetas, sincroniza los `.md` a una carpeta local permitida antes de compilar, y el Glob Import indexa el 100% de los archivos Markdown. La SPA nunca vuelve a mostrar "Documento no encontrado".
