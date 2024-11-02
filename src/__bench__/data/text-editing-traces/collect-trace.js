const fs = require('fs');
const zlib = require('zlib');

const filename = '/Users/mini/vscodelogs/actions_14_05_2023_olcXlNJx.json';
const targetDocFileName = '/Users/mini/dev/json-joy-blog/blog-post-1.md';
const data = fs.readFileSync(filename, 'utf8');
const lines = data.split('\n');
const txns = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  try {
    const json = JSON.parse(line.trim());
    if (json.type === 'change') {
      if (json.fileName !== targetDocFileName) continue;
      if (!json.change.length) continue;
      const time = json.time;
      const tx = {
        time,
        patches: json.change.map((change) => {
          return [change.rangeOffset, change.rangeLength, change.text];
        }),
      };
      txns.push(tx);
    }
  } catch {}
}

const startContent = '';
let endContent = startContent;
for (const {patches} of txns) {
  for (const [pos, delHere, insContent] of patches) {
    const before = endContent.slice(0, pos);
    const after = endContent.slice(pos + delHere);
    endContent = before + insContent + after;
  }
}

const trace = {
  startContent,
  endContent,
  txns,
};

const buf = Buffer.from(JSON.stringify(trace));
const zipped = zlib.gzipSync(buf);
fs.writeFileSync(__dirname + '/json-joy-crdt.json.gz', zipped);
