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
const rootFolder = path.resolve(__dirname, '..', '..', '..', '..');

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
  filename: (name: SequentialTraceName) =>
    path.resolve(rootFolder, 'node_modules', 'editing-traces', 'sequential_traces', `${name}.json.gz`),
  get: (name: SequentialTraceName) => {
    if (!cache[name]) {
      const filename = traces.filename(name);
      cache[name] = loadTrace(filename as SequentialTraceName);
    }
    return cache[name];
  },
};
