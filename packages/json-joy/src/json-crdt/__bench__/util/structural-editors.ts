import {Model} from '../../model';
import * as Y from 'yjs';
// @ts-expect-error
import * as Yrs from 'ywasm';
// @ts-expect-error
import * as Automerge from '@automerge/automerge';
import type {StructuralEditor, StructuralEditorInstance} from './types';
import {Encoder as CompactEncoder} from '../../codec/structural/compact/Encoder';
import {Decoder as CompactDecoder} from '../../codec/structural/compact/Decoder';
import {Encoder as VerboseEncoder} from '../../codec/structural/verbose/Encoder';
import {Decoder as VerboseDecoder} from '../../codec/structural/verbose/Decoder';
import {Encoder as IndexedEncoder} from '../../codec/indexed/binary/Encoder';
import {Decoder as IndexedDecoder} from '../../codec/indexed/binary/Decoder';
import {Encoder as SidecarEncoder} from '../../codec/sidecar/binary/Encoder';
import {Decoder as SidecarDecoder} from '../../codec/sidecar/binary/Decoder';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';

const cborEncoder = new CborEncoder();
const cborDecoder = new CborDecoder();

const editorNativeJs: StructuralEditor = {
  name: 'Native JavaScript',
  factory: (snapshot?: Uint8Array) => {
    let state: any;
    if (snapshot) state = JSON.parse(snapshot.toString());
    const instance: StructuralEditorInstance = {
      view: () => {
        return state;
      },
      setRoot: (pojo: unknown) => {
        state = pojo;
      },
      toBlob: () => {
        return Buffer.from(JSON.stringify(state));
      },
    };
    return instance;
  },
};

const editorJsonJoy: StructuralEditor = {
  name: 'json-joy > structural > binary',
  factory: (snapshot?: Uint8Array) => {
    const model: Model = snapshot ? Model.fromBinary(snapshot) : Model.create();
    const instance: StructuralEditorInstance = {
      view: () => model.view(),
      setRoot: (pojo: unknown) => {
        model.api.set(pojo);
      },
      toBlob: () => model.toBinary(),
    };
    return instance;
  },
};

const editorJsonJoyServerClock: StructuralEditor = {
  name: 'json-joy > structural > binary (server clock)',
  factory: (snapshot?: Uint8Array) => {
    const model: Model = snapshot ? Model.fromBinary(snapshot) : Model.withServerClock();
    const instance: StructuralEditorInstance = {
      view: () => model.view(),
      setRoot: (pojo: unknown) => {
        model.api.set(pojo);
      },
      toBlob: () => model.toBinary(),
    };
    return instance;
  },
};

const encoderCompact = new CompactEncoder();
const decoderCompact = new CompactDecoder();

const editorJsonJoyCompact: StructuralEditor = {
  name: 'json-joy > structural > compact (CBOR)',
  factory: (snapshot?: Uint8Array) => {
    const model: Model = snapshot ? decoderCompact.decode(cborDecoder.read(snapshot) as any) : Model.create();
    const instance: StructuralEditorInstance = {
      view: () => model.view(),
      setRoot: (pojo: unknown) => {
        model.api.set(pojo);
      },
      toBlob: () => {
        const compact = encoderCompact.encode(model);
        return cborEncoder.encode(compact);
      },
    };
    return instance;
  },
};

const editorJsonJoyCompactServerClock: StructuralEditor = {
  name: 'json-joy > structural > compact (CBOR) (server clock)',
  factory: (snapshot?: Uint8Array) => {
    const model: Model = snapshot ? decoderCompact.decode(cborDecoder.read(snapshot) as any) : Model.withServerClock();
    const instance: StructuralEditorInstance = {
      view: () => model.view(),
      setRoot: (pojo: unknown) => {
        model.api.set(pojo);
      },
      toBlob: () => {
        const compact = encoderCompact.encode(model);
        return cborEncoder.encode(compact);
      },
    };
    return instance;
  },
};

const encoderVerbose = new VerboseEncoder();
const decoderVerbose = new VerboseDecoder();

const editorJsonJoyVerbose: StructuralEditor = {
  name: 'json-joy > structural > verbose (CBOR)',
  factory: (snapshot?: Uint8Array) => {
    const model: Model = snapshot ? decoderVerbose.decode(cborDecoder.read(snapshot) as any) : Model.create();
    const instance: StructuralEditorInstance = {
      view: () => model.view(),
      setRoot: (pojo: unknown) => {
        model.api.set(pojo);
      },
      toBlob: () => {
        const compact = encoderVerbose.encode(model);
        return cborEncoder.encode(compact);
      },
    };
    return instance;
  },
};

const editorJsonJoyVerboseServerClock: StructuralEditor = {
  name: 'json-joy > structural > verbose (CBOR) (server clock)',
  factory: (snapshot?: Uint8Array) => {
    const model: Model = snapshot ? decoderVerbose.decode(cborDecoder.read(snapshot) as any) : Model.withServerClock();
    const instance: StructuralEditorInstance = {
      view: () => model.view(),
      setRoot: (pojo: unknown) => {
        model.api.set(pojo);
      },
      toBlob: () => {
        const compact = encoderVerbose.encode(model);
        return cborEncoder.encode(compact);
      },
    };
    return instance;
  },
};

const encoderIndexed = new IndexedEncoder();
const decoderIndexed = new IndexedDecoder();

const editorJsonJoyIndexed: StructuralEditor = {
  name: 'json-joy > indexed (CBOR)',
  factory: (snapshot?: Uint8Array) => {
    const model: Model = snapshot ? decoderIndexed.decode(cborDecoder.read(snapshot) as any) : Model.create();
    const instance: StructuralEditorInstance = {
      view: () => model.view(),
      setRoot: (pojo: unknown) => {
        model.api.set(pojo);
      },
      toBlob: () => {
        const compact = encoderIndexed.encode(model);
        return cborEncoder.encode(compact);
      },
    };
    return instance;
  },
};

const editorJsonJoyIndexedServerClock: StructuralEditor = {
  name: 'json-joy > indexed (CBOR) (server clock)',
  factory: (snapshot?: Uint8Array) => {
    const model: Model = snapshot ? decoderIndexed.decode(cborDecoder.read(snapshot) as any) : Model.withServerClock();
    const instance: StructuralEditorInstance = {
      view: () => model.view(),
      setRoot: (pojo: unknown) => {
        model.api.set(pojo);
      },
      toBlob: () => {
        const compact = encoderIndexed.encode(model);
        return cborEncoder.encode(compact);
      },
    };
    return instance;
  },
};

const encoderSidecar = new SidecarEncoder();
const decoderSidecar = new SidecarDecoder();

const editorJsonJoySidecar: StructuralEditor = {
  name: 'json-joy > sidecar (CBOR)',
  factory: (snapshot?: Uint8Array) => {
    let model: Model;
    if (snapshot) {
      const [view, sidecar] = cborDecoder.read(snapshot) as any[];
      model = decoderSidecar.decode(view, sidecar);
    } else model = Model.create();
    const instance: StructuralEditorInstance = {
      view: () => model.view(),
      setRoot: (pojo: unknown) => {
        model.api.set(pojo);
      },
      toBlob: () => {
        const compact = encoderSidecar.encode(model);
        return cborEncoder.encode(compact);
      },
    };
    return instance;
  },
};

const editorJsonJoySidecarServerClock: StructuralEditor = {
  name: 'json-joy > sidecar (CBOR) (server clock)',
  factory: (snapshot?: Uint8Array) => {
    let model: Model;
    if (snapshot) {
      const [view, sidecar] = cborDecoder.read(snapshot) as any[];
      model = decoderSidecar.decode(view, sidecar);
    } else model = Model.withServerClock();
    const instance: StructuralEditorInstance = {
      view: () => model.view(),
      setRoot: (pojo: unknown) => {
        model.api.set(pojo);
      },
      toBlob: () => {
        const compact = encoderSidecar.encode(model);
        return cborEncoder.encode(compact);
      },
    };
    return instance;
  },
};

const jsonToYjsType = (ydoc: Y.Doc | Yrs.YDoc, json: any) => {
  if (!json) return json;
  if (typeof json === 'object') {
    if (Array.isArray(json)) {
      const arr = new Y.Array();
      arr.push(json.map((item) => jsonToYjsType(ydoc, item)));
      return arr;
    }
    const obj = new Y.Map();
    for (const [key, value] of Object.entries(json)) obj.set(key, jsonToYjsType(ydoc, value));
    return obj;
  }
  return json;
};

const editorYjs: StructuralEditor = {
  name: 'yjs',
  factory: (snapshot?: Uint8Array) => {
    const ydoc = new Y.Doc();
    if (snapshot) Y.applyUpdate(ydoc, snapshot);
    const instance: StructuralEditorInstance = {
      view: () => ydoc.toJSON(),
      setRoot: (pojo: unknown) => {
        const ymap = ydoc.getMap();
        ymap.set('root', jsonToYjsType(ydoc, pojo));
      },
      toBlob: () => Y.encodeStateAsUpdate(ydoc),
    };
    return instance;
  },
};

const editorYrs: StructuralEditor = {
  name: 'yrs',
  factory: (snapshot?: Uint8Array) => {
    const ydoc = new Yrs.YDoc({});
    if (snapshot) Yrs.applyUpdate(ydoc, snapshot, {});
    const instance: StructuralEditorInstance = {
      view: () => ydoc.getMap('root').toJson(),
      setRoot: (pojo: unknown) => {
        const ymap = ydoc.getMap('root');
        ymap.set('root', jsonToYjsType(ydoc, pojo));
      },
      toBlob: () => Yrs.encodeStateAsUpdate(ydoc),
    };
    return instance;
  },
};

const editorAutomerge: StructuralEditor = {
  name: 'automerge',
  factory: (snapshot?: Uint8Array) => {
    let doc = Automerge.from({});
    if (snapshot) doc = Automerge.load(snapshot);
    const instance: StructuralEditorInstance = {
      view: () => {
        return Automerge.toJS(doc);
      },
      setRoot: (root: unknown) => {
        doc = Automerge.from({root});
      },
      toBlob: () => {
        return Automerge.save(doc);
      },
    };
    return instance;
  },
};

export const structuralEditors = {
  nativeJs: editorNativeJs,
  jsonJoy: editorJsonJoy,
  jsonJoyServerClock: editorJsonJoyServerClock,
  jsonJoyCompact: editorJsonJoyCompact,
  jsonJoyCompactServerClock: editorJsonJoyCompactServerClock,
  jsonJoyVerbose: editorJsonJoyVerbose,
  jsonJoyVerboseServerClock: editorJsonJoyVerboseServerClock,
  jsonJoyIndexed: editorJsonJoyIndexed,
  jsonJoyIndexedServerClock: editorJsonJoyIndexedServerClock,
  jsonJoySidecar: editorJsonJoySidecar,
  jsonJoySidecarServerClock: editorJsonJoySidecarServerClock,
  yjs: editorYjs,
  yrs: editorYrs,
  automerge: editorAutomerge,
};

export type StructuralEditors = keyof typeof structuralEditors;
