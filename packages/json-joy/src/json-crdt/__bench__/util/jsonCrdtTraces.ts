import * as path from 'path';
import * as fs from 'fs';

// Resolve json-crdt-traces at module load time
export let jsonCrdtTracesDir: string;
try {
  // Try require.resolve first (works when CWD is at root)
  jsonCrdtTracesDir = path.dirname(require.resolve('json-crdt-traces/package.json'));
} catch (error) {
  // Fallback: traverse up to find node_modules
  let current = __dirname;
  for (let i = 0; i < 10; i++) {
    const candidate = path.join(current, 'node_modules', 'json-crdt-traces');
    if (fs.existsSync(candidate)) {
      jsonCrdtTracesDir = candidate;
      break;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error('Could not find json-crdt-traces module');
    }
    current = parent;
  }
}
