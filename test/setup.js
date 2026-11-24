// Mock de IndexedDB para JSDOM
import 'fake-indexeddb/auto';
import { URLPattern as NodeURLPattern } from 'node:url';

// En Vitest pool: 'vmThreads', JSDOM no hereda automáticamente URLPattern de Node 24
if (typeof globalThis.URLPattern === 'undefined' && typeof NodeURLPattern === 'function') {
  globalThis.URLPattern = NodeURLPattern;
}
