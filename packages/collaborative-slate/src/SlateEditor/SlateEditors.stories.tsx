import * as React from 'react';
import preview from '../../../../.storybook/preview';
import {SlateEditor} from './SlateEditor';
import type {SlateEditorDocument, TwoColumnsElement} from './types';

const Wrap: React.FC<{children: React.ReactNode; scroll?: boolean}> = ({children, scroll}) => (
  <div
    style={{
      minHeight: '100vh',
      ...(scroll ? {height: '100vh', overflow: 'auto'} : {}),
      padding: '32px 24px 56px',
      boxSizing: 'border-box',
    }}
  >
    {children}
  </div>
);

const primaryValue: SlateEditorDocument = [
  {
    type: 'h1',
    children: [{text: 'Collaborative Rich-Text with json-joy'}],
  },
  {
    type: 'p',
    children: [
      {text: '@jsonjoy.com/collaborative-slate', code: true},
      {text: ' binds a '},
      {text: 'Slate.js', bold: true},
      {text: ' editor to a '},
      {text: 'json-joy Peritext', italic: true},
      {text: ' CRDT node, giving you real-time collaborative rich-text editing with zero glue code. Changes made by remote peers flow into the editor automatically; local edits are translated into CRDT operations and broadcast to every replica.'},
    ],
  },
  {
    type: 'p',
    children: [
      {text: 'The binding is a single '},
      {text: 'bind()', code: true},
      {text: ' call that returns an '},
      {text: 'unbind', code: true},
      {text: ' cleanup function — drop it straight into a '},
      {text: 'useEffect', code: true},
      {text: ' and you are done.'},
    ],
  },
  {
    type: 'code-block',
    language: 'tsx',
    fileName: 'Editor.tsx',
    children: [
      {
        text: "import {bind} from '@jsonjoy.com/collaborative-slate';\n\nuseEffect(() => {\n  const unbind = bind(peritextRef, editor);\n  return unbind;\n}, [editor, peritextRef]);",
      },
    ],
  },
  {
    type: 'p',
    children: [
      {text: 'For presence — live remote cursors and selections — install '},
      {text: '@jsonjoy.com/collaborative-presence', code: true},
      {text: ' and pass a '},
      {text: 'PresenceManager', code: true},
      {text: ' to the '},
      {text: 'SlateEditor', code: true},
      {text: ' component. Cursor colours and user names are derived from the metadata you attach to each presence session.'},
    ],
  },
];

const kitchenSinkValue: SlateEditorDocument = [
  {type: 'h1', children: [{text: 'json-joy — JSON Tools for Real-Time Apps'}]},
  {
    type: 'p',
    children: [
      {text: 'json-joy', bold: true},
      {text: ' is a collection of cutting-edge algorithms and data structures for building '},
      {text: 'collaborative', italic: true},
      {text: ' and '},
      {text: 'real-time', italic: true},
      {text: ' applications on top of JSON. The centrepiece is a full '},
      {text: 'JSON CRDT', bold: true},
      {text: ' implementation — a Conflict-free Replicated Data Type that merges concurrent edits from any number of replicas without data loss or manual conflict resolution.'},
    ],
  },

  {type: 'h2', children: [{text: 'Why CRDTs?'}]},
  {
    type: 'blockquote',
    children: [
      {text: 'A CRDT is a data structure that can be updated concurrently by different replicas and always converges to the same state — without any coordination. '},
      {text: '— Shapiro et al., 2011', italic: true},
    ],
  },
  {
    type: 'code-block',
    children: [
      {text: 'A typical RGA string sequence with character IDs:\n\n    H    e   l    l     o      W    o    r    l    d\n    a.1  a.2  a.3  a.4  a.5    b.1  b.2  b.3  b.4  b.5'},
    ],
  },
  {
    type: 'p',
    children: [
      {text: 'Traditional approaches to collaborative editing — '},
      {text: 'Operational Transformation', underline: true},
      {text: ' being the most well-known — require a central server to arbitrate operation order. CRDTs eliminate that requirement. Every peer can apply changes locally and '},
      {text: 'merge', bold: true},
      {text: ' them later, making the system resilient to network partitions and enabling true '},
      {text: 'local-first', bold: true, italic: true},
      {text: ' architectures.'},
    ],
  },

  {type: 'h2', children: [{text: 'Notable Features'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Full JSON as a CRDT — objects, arrays, strings, numbers, booleans, and null, all conflict-free.'}]},
      {type: 'li', children: [{text: 'Peritext — a rich-text CRDT that models inline formatting as non-overlapping annotation slices, compatible with Slate.js and ProseMirror.'}]},
      {type: 'li', children: [{text: 'The fastest RGA list CRDT implementation in JavaScript — benchmarked against Yjs, Automerge, and others.'}]},
      {type: 'li', children: [{text: 'The fastest CBOR, MessagePack, UBJSON, and DAG-CBOR codecs in JavaScript.'}]},
      {type: 'li', children: [{text: 'Compact binary patch format for efficient over-the-wire transport.'}]},
    ],
  },

  {type: 'h2', children: [{text: 'The Peritext Model'}]},
  {
    type: 'p',
    children: [
      {text: 'Peritext'},
      {text: ' ('},
      {text: 'Litt et al., 2021', italic: true},
      {text: ') solves the hardest problem in collaborative rich-text: what happens when two peers simultaneously apply '},
      {text: 'overlapping', underline: true},
      {text: ' formatting? json-joy implements the full Peritext specification and extends it with extra annotation types — links, comments, and arbitrary inline metadata — all stored as first-class CRDT nodes.'},
    ],
  },
  {
    type: 'code-block',
    language: 'ts',
    fileName: 'peritext-example.ts',
    children: [
      {
        text: "import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';\n\n// Create a new Peritext-backed model\nconst model = ModelWithExt.create(ext.peritext.new('Hello, world!'));\nconst api = model.s.toExt();\n\n// Bold the word 'world'\napi.editor.cursor.setAt(7, 5);\napi.editor.toggleMark('bold');\napi.refresh();\n\nconsole.log(model.view());\n// => { text: 'Hello, world!', slices: [{ type: 'bold', start: 7, end: 12 }] }",
      },
    ],
  },

  {type: 'h2', children: [{text: 'Editor Integrations'}]},
  {
    type: 'p',
    children: [
      {text: 'json-joy ships first-party bindings for the most popular open-source editors. Each binding is a thin adapter — it translates between the editor\'s own change model and the underlying CRDT operations.'},
    ],
  },
  {
    type: 'ol',
    children: [
      {type: 'li', children: [{text: 'Slate.js / Plate.js — '}, {text: '@jsonjoy.com/collaborative-slate', code: true}]},
      {type: 'li', children: [{text: 'ProseMirror — '}, {text: '@jsonjoy.com/collaborative-prosemirror', code: true}]},
      {type: 'li', children: [{text: 'Quill — '}, {text: '@jsonjoy.com/collaborative-quill', code: true}]},
      {type: 'li', children: [{text: 'CodeMirror 6 — '}, {text: '@jsonjoy.com/collaborative-codemirror', code: true}]},
      {type: 'li', children: [{text: 'Monaco Editor — '}, {text: '@jsonjoy.com/collaborative-monaco', code: true}]},
    ],
  },

  {type: 'h2', children: [{text: 'Further Reading'}]},
  {
    type: 'p',
    children: [
      {text: 'Specification, benchmarks, and blog posts are available on the '},
      {text: 'json-joy website', a: {href: 'https://jsonjoy.com'}},
      {text: '. The '},
      {text: 'JSON CRDT Explorer', a: {href: 'https://explorer.jsoncrdt.org'}},
      {text: ' lets you inspect live CRDT state and replay patch histories in your browser. Source code and issues live on '},
      {text: 'GitHub', a: {href: 'https://github.com/streamich/json-joy'}},
      {text: '.'},
    ],
  },
  {
    type: 'p',
    align: 'center',
    children: [{text: 'Built with care by streamich and contributors. MIT / AGPL-3.0.'}],
  },
];

const twoColumnsBlock: TwoColumnsElement = {
  type: 'two-columns',
  children: [
    {text: 'json-joy ships a collaborative Slate editor on top of Peritext, which means structure and inline annotations are preserved as CRDT operations instead of lossy HTML patches. That makes richer layouts possible without introducing a separate document model just for presentation. '},
    {text: 'This block uses CSS multi-column flow', italic: true},
    {text: ' so a single block of prose can be read like a compact editorial layout. The content remains regular Slate text, so marks, links, selections, and collaboration metadata still behave the same way they do in a paragraph. '},
    {text: 'Use it for release notes, dense summaries, or side-by-side style reading experiences where a long paragraph would otherwise feel visually heavy. The layout is attached to the block itself, which keeps the feature predictable when toggling formats from the toolbar.'},
  ],
};

const twoColumnsValue: SlateEditorDocument = [
  {type: 'h1', children: [{text: 'Magazine-style two-column block'}]},
  {
    type: 'p',
    children: [
      {text: 'The toolbar now includes a '},
      {text: 'Two columns', bold: true},
      {text: ' block toggle next to the alignment controls. This story starts with the layout already applied so the multi-column rendering is visible immediately.'},
    ],
  },
  twoColumnsBlock,
  {
    type: 'p',
    children: [
      {text: 'Switch the block back to a paragraph at any time and the content stays intact.'},
    ],
  },
];

const manyHeadingsValue: SlateEditorDocument = [
  {type: 'h1', children: [{text: 'The Ultimate Guide to json-joy'}]},
  {type: 'h2', children: [{text: 'Introduction'}]},
  {type: 'h2', children: [{text: 'Getting Started'}]},
  {type: 'h3', children: [{text: 'Installation'}]},
  {type: 'h3', children: [{text: 'Basic Usage'}]},
  {type: 'h2', children: [{text: 'Advanced Topics'}]},
  {type: 'h3', children: [{text: 'CRDT Internals'}]},
  {type: 'h3', children: [{text: 'Performance Tuning'}]},
  {type: 'h2', children: [{text: 'API Reference'}]},
  {type: 'h3', children: [{text: 'Model API'}]},
  {type: 'h3', children: [{text: 'Editor Bindings'}]},
  {type: 'h2', children: [{text: 'Troubleshooting and FAQs'}]},
  {type: 'h3', children: [{text: 'Common Issues'}]},
  {type: 'h3', children: [{text: 'Debugging Tips'}]},
  {type: 'h2', children: [{text: 'Contributing to json-joy'}]},
  {type: 'h3', children: [{text: 'How to Contribute'}]},
  {type: 'h3', children: [{text: 'Code of Conduct'}]},
  {type: 'h2', children: [{text: 'Release Notes'}]},
  {type: 'h3', children: [{text: 'Version 1.0.0'}]},
  {type: 'h3', children: [{text: 'Version 1.1.0'}]},
  {type: 'h3', children: [{text: 'Version 2.0.0'}]},
  {type: 'h1', children: [{text: 'Appendix'}]},
  {type: 'h2', children: [{text: 'Data Model Details'}]},
  {type: 'h3', children: [{text: 'CRDT Structure'}]},
  {type: 'h3', children: [{text: 'Serialization Format'}]},
  {type: 'h2', children: [{text: 'Performance Benchmarks'}]},
  {type: 'h3', children: [{text: 'Microbenchmarks'}]},
  {type: 'h3', children: [{text: 'Real-World Scenarios'}]},
  {type: 'h2', children: [{text: 'Further Reading'}]},
  {type: 'h3', children: [{text: 'Academic Papers'}]},
  {type: 'h3', children: [{text: 'Related Projects'}]},
]

const longValue: SlateEditorDocument = [
  {type: 'h1', children: [{text: 'Building Local-First Apps with json-joy'}]},
  {
    type: 'p',
    children: [
      {text: 'Local-first software', bold: true},
      {text: ' is a set of principles for building applications that work offline, keep user data on the user\'s own devices, and sync with peers when a connection is available. json-joy was designed from the ground up to make this style of architecture practical for JavaScript developers.'},
    ],
  },
  {
    type: 'p',
    children: [
      {text: 'At the core of json-joy is a '},
      {text: 'JSON CRDT', bold: true},
      {text: ' — a Conflict-free Replicated Data Type that models the full JSON value space. Objects, arrays, strings, numbers, booleans, and null can all be updated concurrently by independent replicas, and the library guarantees that every replica will eventually converge to the same state without any coordination from a server.'},
    ],
  },

  {type: 'h2', children: [{text: 'How JSON CRDT Works'}]},
  {
    type: 'p',
    children: [
      {text: 'A json-joy '},
      {text: 'Model', code: true},
      {text: ' is an immutable snapshot of a JSON value annotated with logical timestamps. Each node in the value tree — every object entry, array element, or string character — carries the '},
      {text: 'session ID', italic: true},
      {text: ' and '},
      {text: 'logical clock', italic: true},
      {text: ' of the replica that created it. This provenance is what makes conflict-free merging possible.'},
    ],
  },
  {
    type: 'p',
    children: [
      {text: 'When two replicas diverge and later reconnect, json-joy computes the difference between their patch histories and applies only the missing operations. The merge algorithm is deterministic: given the same set of patches, every replica produces the same model, regardless of the order in which the patches were received.'},
    ],
  },
  {
    type: 'code-block',
    language: 'ts',
    fileName: 'merge.ts',
    children: [
      {
        text: "import {Model} from 'json-joy/lib/json-crdt';\n\n// Fork a model into two independent replicas\nconst a = model.fork();\nconst b = model.fork();\n\n// Make concurrent edits\na.api.str(['title']).ins(0, 'Hello');\nb.api.str(['title']).ins(0, 'World');\n\n// Merge b into a — both edits are preserved\na.applyPatch(b.api.flush());\nconsole.log(a.view()); // { title: 'WorldHello' } (or 'HelloWorld', deterministically)",
      },
    ],
  },

  {type: 'h2', children: [{text: 'The Peritext Rich-Text CRDT'}]},
  {
    type: 'p',
    children: [
      {text: 'Plain-text CRDTs like RGA (Replicated Growable Array) handle character-level concurrency well, but rich text adds another layer of complexity: '},
      {text: 'inline annotations', underline: true},
      {text: '. What happens when Alice bolds a range of text while Bob simultaneously deletes characters inside that range? What if both bold the same range independently?'},
    ],
  },
  {
    type: 'blockquote',
    children: [
      {text: 'Peritext introduces the concept of an '},
      {text: 'anchor', italic: true},
      {text: ' — a reference to the gap between two characters rather than to a character itself. Anchors survive concurrent insertions and deletions, making annotation ranges stable across edits. — Litt et al., 2021'},
    ],
  },
  {
    type: 'p',
    children: [
      {text: 'json-joy implements the full Peritext specification and extends it with '},
      {text: 'exclusive', italic: true},
      {text: ' and '},
      {text: 'inclusive', italic: true},
      {text: ' anchor semantics, allowing annotation types like '},
      {text: 'links', code: true},
      {text: ' to control whether newly typed characters at the boundary inherit the annotation.'},
    ],
  },

  {type: 'h2', children: [{text: 'Performance'}]},
  {
    type: 'p',
    children: [
      {text: 'Performance has been a first-class concern since the beginning. json-joy ships its own '},
      {text: 'AVL tree', bold: true},
      {text: ', '},
      {text: 'Splay tree', bold: true},
      {text: ', and '},
      {text: 'Radix tree', bold: true},
      {text: ' implementations tuned for the access patterns of CRDT workloads. The RGA string CRDT is benchmarked continuously against Yjs, Automerge, and Diamond Types.'},
    ],
  },
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Insertion of 100 000 characters: '}, {text: '~12 ms', bold: true}, {text: ' on a 2023 MacBook Pro M2.'}]},
      {type: 'li', children: [{text: 'Encoding a 50 000-op patch to binary: '}, {text: '~3 ms', bold: true}, {text: '.'}]},
      {type: 'li', children: [{text: 'Decoding the same patch: '}, {text: '~4 ms', bold: true}, {text: '.'}]},
      {type: 'li', children: [{text: 'Full re-render after a remote patch: under one React render frame at typical document sizes.'}]},
    ],
  },

  {type: 'h2', children: [{text: 'Binary Codecs'}]},
  {
    type: 'p',
    children: [
      {text: 'Patches are serialised using a compact binary format that is a strict subset of '},
      {text: 'CBOR', bold: true},
      {text: '. json-joy ships the fastest CBOR encoder and decoder in the JavaScript ecosystem — faster than '},
      {text: 'cbor-x', code: true},
      {text: ', '},
      {text: 'msgpackr', code: true},
      {text: ', and '},
      {text: '@msgpack/msgpack', code: true},
      {text: ' in every benchmark category.'},
    ],
  },
  {
    type: 'code-block',
    language: 'ts',
    fileName: 'codec.ts',
    children: [
      {
        text: "import {CborEncoder, CborDecoder} from 'json-joy/lib/json-pack/cbor';\n\nconst encoder = new CborEncoder();\nconst decoder = new CborDecoder();\n\nconst bytes = encoder.encode({type: 'ins', id: [1, 42], after: [1, 41], value: 'H'});\nconst op = decoder.decode(bytes);\nconsole.log(op); // { type: 'ins', id: [1, 42], after: [1, 41], value: 'H' }",
      },
    ],
  },

  {type: 'h2', children: [{text: 'Presence and Awareness'}]},
  {
    type: 'p',
    children: [
      {text: '@jsonjoy.com/collaborative-presence', code: true},
      {text: ' is an ephemeral awareness layer that sits alongside the persistent CRDT model. It broadcasts short-lived state — cursor positions, user names, colours, typing indicators — using a gossip protocol that does not require a database write for every keypress.'},
    ],
  },
  {
    type: 'p',
    children: [
      {text: 'The '},
      {text: 'SlateEditor', code: true},
      {text: ' component renders remote cursors as coloured caret markers directly in the content flow. Each cursor label shows the peer\'s display name and fades out automatically when the peer goes idle.'},
    ],
  },

  {type: 'h2', children: [{text: 'Server Integration'}]},
  {
    type: 'p',
    children: [
      {text: '@jsonjoy.com/json-crdt-server', code: true},
      {text: ' provides a ready-made server that stores models in any key-value backend (LevelDB, Redis, S3) and relays patches between clients over WebSockets. It exposes a '},
      {text: 'JSON Reactive RPC', italic: true},
      {text: ' API, allowing clients to subscribe to a document and receive a stream of incremental patches rather than full snapshots.'},
    ],
  },
  {
    type: 'ol',
    children: [
      {type: 'li', children: [{text: 'Client opens a WebSocket connection and sends a '}, {text: 'subscribe', code: true}, {text: ' request with the document ID and its current clock.'}]},
      {type: 'li', children: [{text: 'Server responds with all patches the client has not yet seen, then keeps the subscription open.'}]},
      {type: 'li', children: [{text: 'When the client makes a local edit it sends a '}, {text: 'patch', code: true}, {text: ' request; the server applies it, persists it, and fans it out to other subscribers.'}]},
      {type: 'li', children: [{text: 'On reconnect the client resumes from its last known clock — no full-document download required.'}]},
    ],
  },

  {type: 'h2', children: [{text: 'Getting Started'}]},
  {
    type: 'code-block',
    language: 'bash',
    children: [
      {
        text: 'npm install @jsonjoy.com/collaborative-slate @jsonjoy.com/collaborative-peritext slate slate-react\n\n# Optional: presence / remote cursors\nnpm install @jsonjoy.com/collaborative-presence',
      },
    ],
  },
  {
    type: 'code-block',
    language: 'tsx',
    fileName: 'App.tsx',
    children: [
      {
        text: "import React, {useEffect, useMemo} from 'react';\nimport {createEditor} from 'slate';\nimport {Slate, Editable, withReact} from 'slate-react';\nimport {bind} from '@jsonjoy.com/collaborative-slate';\n\nexport function Editor({peritextRef, initialValue}) {\n  const editor = useMemo(() => withReact(createEditor()), []);\n\n  useEffect(() => {\n    // bind() wires the CRDT to the Slate editor and returns a cleanup function\n    const unbind = bind(peritextRef, editor);\n    return unbind;\n  }, [editor, peritextRef]);\n\n  return (\n    <Slate editor={editor} initialValue={initialValue}>\n      <Editable />\n    </Slate>\n  );\n}",
      },
    ],
  },
  {
    type: 'p',
    children: [
      {text: 'Full documentation, live demos, and the JSON CRDT specification are available at '},
      {text: 'jsonjoy.com', a: {href: 'https://jsonjoy.com'}},
      {text: '. Found a bug or want to contribute? Open an issue on '},
      {text: 'GitHub', a: {href: 'https://github.com/streamich/json-joy'}},
      {text: '.'},
    ],
  },
  {
    type: 'p',
    align: 'center',
    children: [{text: '— End of document —'}],
  },
];

const meta = preview.meta({
  title: 'SlateEditor',
});

export const Primary = meta.story({
  render: () => (
    <Wrap>
      <SlateEditor autoFocus={false} initialValue={primaryValue} minHeight={440} />
    </Wrap>
  ),
});

export const Empty = meta.story({
  render: () => (
    <Wrap>
      <SlateEditor autoFocus={false} initialValue={[]} />
    </Wrap>
  ),
});

export const Fit = meta.story({
  render: () => (
    <div style={{height: 600, border: '1px dashed red'}}>
      <SlateEditor autoFocus={false} initialValue={primaryValue} heightFit />
    </div>
  ),
});

export const Borderless = meta.story({
  render: () => (
    <div style={{height: 600, border: '1px solid rgb(0, 0, 0, 0.2)'}}>
      <SlateEditor autoFocus={false} initialValue={primaryValue} heightFit borderless style={{maxWidth: '100%'}} />
    </div>
  ),
});

export const KitchenSink = meta.story({
  render: () => (
    <Wrap>
      <SlateEditor autoFocus={false} initialValue={kitchenSinkValue} minHeight={440} height={500} />
    </Wrap>
  ),
});

export const ManyHeadings = meta.story({
  render: () => (
    <Wrap>
      <SlateEditor autoFocus={false} initialValue={manyHeadingsValue} minHeight={440} contentWidth={920} />
    </Wrap>
  ),
});

export const TwoColumns = meta.story({
  render: () => (
    <Wrap>
      <SlateEditor autoFocus={false} initialValue={twoColumnsValue} minHeight={440} contentWidth={920} />
    </Wrap>
  ),
});

export const LongDocument = meta.story({
  render: () => (
    <Wrap scroll>
      <SlateEditor autoFocus={false} initialValue={longValue} minHeight={440} />
    </Wrap>
  ),
});

export const ReadOnly = meta.story({
  render: () => (
    <Wrap>
      <SlateEditor autoFocus={false} initialValue={kitchenSinkValue} minHeight={440} readOnly />
    </Wrap>
  ),
});
