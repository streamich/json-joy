import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import type {SequentialTrace, SequentialTraceName} from './types';

const loadTrace = (filename: SequentialTraceName) => {
  const buf = fs.readFileSync(filename);
  const text = zlib.gunzipSync(buf).toString();
  const json = JSON.parse(text);
  return json;
};

const cache = {} as Record<SequentialTraceName, SequentialTrace>;

// Resolve editing-traces at module load time
export let editingTracesDir: string;
try {
  // Try require.resolve first (works when CWD is at root)
  editingTracesDir = path.dirname(require.resolve('editing-traces/package.json'));
} catch (_error) {
  // Fallback: traverse up to find node_modules
  let current = __dirname;
  for (let i = 0; i < 10; i++) {
    const candidate = path.join(current, 'node_modules', 'editing-traces');
    if (fs.existsSync(candidate)) {
      editingTracesDir = candidate;
      break;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error('Could not find editing-traces module');
    }
    current = parent;
  }
}

export const sequentialTraceNames: SequentialTraceName[] = [
  'automerge-paper',
  'friendsforever_flat',
  'rustcode',
  'seph-blog1',
  'sveltecomponent',
  'json-crdt-patch',
  'json-crdt-blog-post',
];

export const traces = {
  filename: (name: SequentialTraceName) => path.resolve(editingTracesDir, 'sequential_traces', `${name}.json.gz`),
  get: (name: SequentialTraceName) => {
    if (!cache[name]) {
      const filename = traces.filename(name);
      cache[name] = loadTrace(filename as SequentialTraceName);
    }
    return cache[name];
  },
};
