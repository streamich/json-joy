export interface TraceDefinition {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'rich-text' | 'json';
  blob?: Uint8Array;
  display?: 'todo' | 'blogpost' | 'text' | 'quill';
}

export const quill: TraceDefinition[] = [
  {
    id: 'quill-editor',
    name: 'Short post',
    type: 'rich-text',
    description: 'Instructions on how to use the Quill editor with JSON CRDT.',
    display: 'quill',
  },
  {
    id: 'quill-0',
    name: 'Empty document',
    type: 'rich-text',
    description: 'Basic rich-text demo.',
    display: 'quill',
    blob: new Uint8Array([
      0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x13, 0xfb, 0xd6, 0xb4, 0x80, 0xe1, 0x5b, 0x93, 0x1f, 0x03,
      0x03, 0x03, 0x23, 0x03, 0xe3, 0x99, 0x8e, 0xf5, 0xd3, 0xef, 0x9c, 0xd0, 0x60, 0x68, 0x8c, 0x90, 0x65, 0x62, 0xfc,
      0xce, 0x21, 0xc1, 0xe0, 0xcc, 0xcc, 0xc4, 0x28, 0xa1, 0x60, 0x10, 0xc5, 0xcc, 0xc0, 0xc2, 0xc8, 0x1a, 0xc5, 0xc8,
      0xc0, 0xc4, 0xc8, 0xec, 0xd1, 0xc0, 0xc0, 0x08, 0x00, 0xe5, 0xdb, 0x83, 0x83, 0x35, 0x00, 0x00, 0x00,
    ]),
  },
];

export const json: TraceDefinition[] = [
  {
    id: 'blogpost',
    name: 'Blog post demo',
    type: 'json',
    description: 'A simple blog post form example.',
    display: 'blogpost',
  },
  {
    id: 'todos',
    name: 'Todos demo',
    type: 'json',
    description: 'A simple todo UI example.',
    display: 'todo',
  },
];

export const text: TraceDefinition[] = [
  {
    id: 'automerge-paper',
    name: 'Automerge paper',
    type: 'text',
    description: 'The original Automerge paper by Martin Kleppmann.',
    display: 'text',
  },
  {
    id: 'clownschool',
    name: 'Clown school',
    type: 'text',
    description: 'A concurrent editing trace written by 2 people who went to clown school together.',
    display: 'text',
  },
  {
    id: 'friendsforever',
    name: 'Friends forever',
    type: 'text',
    description: 'A concurrent editing trace written by 2 people debriefing an episode of Friends.',
    display: 'text',
  },
  {
    id: 'json-crdt-blog-post',
    name: 'JSON CRDT blog post',
    type: 'text',
    description: 'A draft of a blog post about the JSON CRDT.',
    display: 'text',
  },
  {
    id: 'json-crdt-patch',
    name: 'JSON CRDT Patch spec',
    type: 'text',
    description: 'A draft of JSON CRDT Patch specification.',
    display: 'text',
  },
  {
    id: 'rustcode',
    name: 'Rust code',
    type: 'text',
    description: 'A single-user trace of editing Rust code, including multi-cursor editing and refactor operations.',
    display: 'text',
  },
];

export const fuzzer: TraceDefinition[] = [
  {
    id: 'fuzzer-json-high-concurrency',
    name: 'High-concurrency JSON',
    type: 'json',
    description: 'A sample fuzzer trace with high concurrency.',
  },
  {
    id: 'fuzzer-string',
    name: 'Plain text',
    type: 'text',
    description: 'A sample fuzzer trace of plain text.',
    display: 'text',
  },
];

export const loadTrace = async (trace: TraceDefinition): Promise<Uint8Array> => {
  if (trace.blob) return trace.blob;
  const url = `https://appsets.jsonjoy.com/traces/${trace.id}.seq.cbor.gz`;
  const res = await fetch(url);
  const blob = await res.blob();
  const uint8 = new Uint8Array(await blob.arrayBuffer());
  trace.blob = uint8;
  return uint8;
};
