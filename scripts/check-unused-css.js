// @ts-check
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas
const ROOT_DIR = path.join(__dirname, '..');
const CSS_FILE = path.join(ROOT_DIR, 'src', 'style.css');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const HTML_FILE = path.join(ROOT_DIR, 'index.html');

console.log('🔍 Iniciando escáner de CSS no utilizado...');

// 1. Extraer todas las clases de style.css
const cssContent = fs.readFileSync(CSS_FILE, 'utf8');
const classRegex = /\.([a-zA-Z_][a-zA-Z0-9_-]*)[\s{,:]/g;
const classesEncontradas = new Set();

let match;
while ((match = classRegex.exec(cssContent)) !== null) {
    // Ignoramos pseudo-clases o variables raras
    if (!match[1].includes('-webkit') && !match[1].startsWith('-')) {
        classesEncontradas.add(match[1]);
    }
}

console.log(`css: Encontradas ${classesEncontradas.size} clases únicas en index.css`);

// 2. Escanear recursivamente los archivos .js y .html
function getFilesRecursively(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...getFilesRecursively(fullPath));
        } else if (entry.name.endsWith('.js') || entry.name.endsWith('.html') || entry.name.endsWith('.md')) {
            files.push(fullPath);
        }
    }
    return files;
}

const archivosParaEscanear = [...getFilesRecursively(SRC_DIR), HTML_FILE];
console.log(`📁 Escaneando ${archivosParaEscanear.length} archivos (.js, .html)...`);

// 3. Buscar usos
const clasesUsadas = new Set();

for (const archivo of archivosParaEscanear) {
    const contenido = fs.readFileSync(archivo, 'utf8');
    for (const cssClass of classesEncontradas) {
        // Buscamos la clase (puede estar en class="...", classList.add, etc)
        // Usamos un regex para encontrar la palabra exacta delimitada
        const regexUso = new RegExp(`['"\\s]${cssClass}['"\\s]`, 'g');
        if (regexUso.test(contenido) || contenido.includes(`class="${cssClass}"`) || contenido.includes(`classList.add('${cssClass}')`)) {
            clasesUsadas.add(cssClass);
        }
    }
}

// 4. Resultados
const noUsadas = [...classesEncontradas].filter(x => !clasesUsadas.has(x));

console.log('\n📊 RESULTADOS:');
console.log(`✅ Clases en uso: ${clasesUsadas.size}`);
console.log(`❌ Clases posiblemente no utilizadas (Dead Code): ${noUsadas.length}`);

if (noUsadas.length > 0) {
    console.log('\n🗑️  Lista de CSS a revisar/eliminar:');
    noUsadas.forEach(c => console.log(`  - .${c}`));
    process.exitCode = 1; // Fallar el script para CI/CD
} else {
    console.log('\n✨ ¡Excelente! Todo tu CSS parece estar en uso.');
}
