// @ts-check
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ASSETS_DIR = path.resolve(__dirname, '../dist/assets');
const MAX_CHUNK_BYTES = 500 * 1024; // Límite estricto estándar de Vite (500 kB)

if (!fs.existsSync(ASSETS_DIR)) {
  console.error('❌ [test:bundle] No existe dist/assets. Ejecuta `npm run build` antes de auditar los chunks.');
  process.exit(1);
}

const archivosJs = fs
  .readdirSync(ASSETS_DIR)
  .filter((f) => f.endsWith('.js'))
  .map((archivo) => {
    const stat = fs.statSync(path.join(ASSETS_DIR, archivo));
    return { archivo, bytes: stat.size, kb: Number((stat.size / 1024).toFixed(2)) };
  })
  .sort((a, b) => b.bytes - a.bytes);

const excedidos = archivosJs.filter((item) => item.bytes > MAX_CHUNK_BYTES);

console.log(`📦 [test:bundle] Auditados ${archivosJs.length} chunks JS en dist/assets/ (límite estricto: 500 kB):`);
archivosJs.slice(0, 6).forEach((item) => {
  const icono = item.bytes > MAX_CHUNK_BYTES ? '❌' : '✅';
  console.log(`   ${icono} ${item.archivo}: ${item.kb} kB`);
});

if (excedidos.length > 0) {
  console.error('\n🚨 [test:bundle] Fallo de Presupuesto de Bundle: los siguientes chunks superan 500 kB:');
  excedidos.forEach((item) => console.error(`   - ${item.archivo}: ${item.kb} kB`));
  process.exit(1);
}

console.log('✅ [test:bundle] Todos los chunks (modernos y legacy) están por debajo de 500 kB.');
