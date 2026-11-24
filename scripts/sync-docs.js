// @ts-check
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const SRC_DOCS_DIR = path.join(ROOT_DIR, 'src', 'assets', 'mita-docs-cache');

// Encontrar dónde está instalado mita-dom
let mitaDomDir = path.resolve(ROOT_DIR, '../mita-dom');
const esRepoLocal = fs.existsSync(path.join(mitaDomDir, 'package.json'));
if (!esRepoLocal) {
  mitaDomDir = path.resolve(ROOT_DIR, 'node_modules/mita-dom');
}

console.log(`🔄 Sincronizando documentación desde: ${mitaDomDir}`);

// En local (monorepo hermano) limpiamos caché para reflejar borrados/renombrados exactos.
// En CI/Vercel (node_modules) preservamos docs commiteados más nuevos que el tarball NPM.
if (esRepoLocal) {
  try {
    if (fs.existsSync(SRC_DOCS_DIR)) {
      fs.rmSync(SRC_DOCS_DIR, { recursive: true, force: true });
    }
  } catch {
    console.warn('⚠️ No se pudo borrar la caché anterior (probablemente bloqueada por Vite o el IDE), sobreescribiendo...');
  }
}
fs.mkdirSync(SRC_DOCS_DIR, { recursive: true });

// Copiar carpetas y archivos clave
const foldersToCopy = ['docs', 'changelogs'];
for (const folder of foldersToCopy) {
  const source = path.join(mitaDomDir, folder);
  if (fs.existsSync(source)) {
    fs.cpSync(source, path.join(SRC_DOCS_DIR, folder), { recursive: true, force: esRepoLocal });
  }
}

// Copiar el README.md y CONTRIBUTING.md a la caché
const readmeDest = path.join(SRC_DOCS_DIR, 'readme.md');
const readmePath = path.join(mitaDomDir, 'README.md');
if (fs.existsSync(readmePath) && (esRepoLocal || !fs.existsSync(readmeDest))) {
  fs.copyFileSync(readmePath, readmeDest);
}
const contributingDest = path.join(SRC_DOCS_DIR, 'contributing.md');
const contributingPath = path.join(mitaDomDir, 'CONTRIBUTING.md');
if (fs.existsSync(contributingPath) && (esRepoLocal || !fs.existsSync(contributingDest))) {
  fs.copyFileSync(contributingPath, contributingDest);
}

console.log(`✅ Documentación sincronizada exitosamente en src/assets/mita-docs-cache/`);
