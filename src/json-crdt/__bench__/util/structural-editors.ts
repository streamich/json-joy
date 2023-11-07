import {Model} from "../../model";
import * as Y from 'yjs';
import * as Yrs from 'ywasm';
import type {StructuralEditor, StructuralEditorInstance} from "./types";

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

export const structuralEditors = {
  jsonJoy: editorJsonJoy,
  yjs: editorYjs,
  yrs: editorYrs,
};
