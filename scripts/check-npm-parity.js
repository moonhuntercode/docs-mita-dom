// @ts-check
/**
 * 🛡️ Validador de Paridad Local vs NPM / Vercel (`npm run test:vercel`)
 * Verifica que todos los símbolos importados desde `'mita-dom'` en `src/` existan realmente
 * en `node_modules/mita-dom/dist/mita-dom.js` (el archivo exacto que consume Vercel en producción).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const NPM_DIST = path.join(ROOT, 'node_modules', 'mita-dom', 'dist', 'mita-dom.js');
const NPM_PKG = path.join(ROOT, 'node_modules', 'mita-dom', 'package.json');

function listarArchivosJs(dir, lista = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'mita-docs-cache') continue;
      listarArchivosJs(full, lista);
    } else if (entry.name.endsWith('.js')) {
      lista.push(full);
    }
  }
  return lista;
}

function extraerImportsMitaDom(codigo) {
  const simbolos = new Set();
  const regex = /^import\s*\{([^}]+)\}\s*from\s*['"]mita-dom['"]/gm;
  let match;
  while ((match = regex.exec(codigo)) !== null) {
    match[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((item) => {
        const nombreReal = item.split(/\s+as\s+/i)[0].trim();
        if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(nombreReal)) {
          simbolos.add(nombreReal);
        }
      });
  }
  return simbolos;
}

if (!fs.existsSync(NPM_DIST) || !fs.existsSync(NPM_PKG)) {
  console.error('❌ [test:vercel] No existe node_modules/mita-dom/dist/mita-dom.js. Ejecuta `npm install`.');
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(NPM_PKG, 'utf8'));
const moduloNpm = await import(pathToFileURL(NPM_DIST).href);
const exportsDisponibles = new Set(Object.keys(moduloNpm));

const archivos = listarArchivosJs(SRC_DIR);
const faltantes = [];

for (const archivo of archivos) {
  const codigo = fs.readFileSync(archivo, 'utf8');
  const usados = extraerImportsMitaDom(codigo);
  for (const simbolo of usados) {
    if (!exportsDisponibles.has(simbolo)) {
      faltantes.push({ simbolo, archivo: path.relative(ROOT, archivo) });
    }
  }
}

if (faltantes.length > 0) {
  console.error(
    `🚨 [test:vercel] Desincronización detectada con node_modules/mita-dom@${pkg.version} (fallaría en Vercel):`
  );
  faltantes.forEach((f) => console.error(`   ❌ "${f.simbolo}" usado en ${f.archivo}`));
  console.error(
    '\n💡 Solución: publica la nueva versión de mita-dom en NPM (ej. v2.8.0) y actualiza `dependencies.mita-dom` antes de hacer push a Vercel.'
  );
  process.exit(1);
}

console.log(
  `✅ [test:vercel] Paridad 100% verificada: todos los imports de 'mita-dom' en src/ existen en node_modules/mita-dom@${pkg.version}.`
);
