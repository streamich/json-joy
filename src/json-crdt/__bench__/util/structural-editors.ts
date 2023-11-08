import {Model} from '../../model';
import * as Y from 'yjs';
import * as Yrs from 'ywasm';
import * as Automerge from '@automerge/automerge';
import type {StructuralEditor, StructuralEditorInstance} from './types';

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
  name: 'json-joy',
  factory: (snapshot?: Uint8Array) => {
    const model: Model = snapshot ? Model.fromBinary(snapshot) : Model.withLogicalClock();
    const instance: StructuralEditorInstance = {
      view: () => model.view(),
      setRoot: (pojo: unknown) => {
        model.api.root(pojo);
      },
      toBlob: () => model.toBinary(),
    };
    return instance;
  },
};

const editorJsonJoyServerClock: StructuralEditor = {
  name: 'json-joy (server clock)',
  factory: (snapshot?: Uint8Array) => {
    const model: Model = snapshot ? Model.fromBinary(snapshot) : Model.withServerClock();
    const instance: StructuralEditorInstance = {
      view: () => model.view(),
      setRoot: (pojo: unknown) => {
        model.api.root(pojo);
      },
      toBlob: () => model.toBinary(),
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
  yjs: editorYjs,
  yrs: editorYrs,
  editorAutomerge,
};

export type StructuralEditors = keyof typeof structuralEditors;
