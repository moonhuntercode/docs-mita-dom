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
if (!fs.existsSync(path.join(mitaDomDir, 'package.json'))) {
  mitaDomDir = path.resolve(ROOT_DIR, 'node_modules/mita-dom');
}

console.log(`🔄 Sincronizando documentación desde: ${mitaDomDir}`);

// Limpiar caché anterior
try {
  if (fs.existsSync(SRC_DOCS_DIR)) {
    fs.rmSync(SRC_DOCS_DIR, { recursive: true, force: true });
  }
} catch (e) {
  console.warn('⚠️ No se pudo borrar la caché anterior (probablemente bloqueada por Vite o el IDE), sobreescribiendo...');
}
fs.mkdirSync(SRC_DOCS_DIR, { recursive: true });

// Copiar carpetas y archivos clave
const foldersToCopy = ['docs', 'changelogs'];
for (const folder of foldersToCopy) {
  const source = path.join(mitaDomDir, folder);
  if (fs.existsSync(source)) {
    fs.cpSync(source, path.join(SRC_DOCS_DIR, folder), { recursive: true });
  }
}

// Copiar el README.md a la caché
const readmePath = path.join(mitaDomDir, 'README.md');
if (fs.existsSync(readmePath)) {
  fs.copyFileSync(readmePath, path.join(SRC_DOCS_DIR, 'readme.md'));
}

console.log(`✅ Documentación sincronizada exitosamente en src/assets/mita-docs-cache/`);
