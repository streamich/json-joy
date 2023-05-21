const fs = require('fs');
const zlib = require('zlib');

const loadTrace = (filename) => {
  const buf = fs.readFileSync(filename);
  const text = zlib.gunzipSync(buf).toString();
  const json = JSON.parse(text);
  return json;
};

const cache = {};

const traces = {
  filename: (name) => __dirname + `/text-editing-traces/${name}.json.gz`,
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
