const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const loadTrace = (filename) => {
  const buf = fs.readFileSync(filename);
  const text = zlib.gunzipSync(buf).toString();
  const json = JSON.parse(text);
  return json;
};

const cache = {};
const rootFolder = path.resolve(__dirname, '..', '..');

const traces = {
  filename: (name) =>
    path.resolve(rootFolder, 'node_modules', 'editing-traces', 'sequential_traces', `${name}.json.gz`),
  get: (name) => {
    if (!cache[name]) {
      const filename = traces.filename(name);
      cache[name] = loadTrace(filename);
    }
    return cache[name];
  },
};

module.exports = {
  traces,
};
