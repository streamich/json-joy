import {createEditor} from 'slate';
import {ThingsState} from '../things/ThingsState';
import {withProtectedThings} from '../behavior/things';
import type {MuTxtState} from '../state/MuTxtState';
import type {SlateEditorDocument} from '../types';

const fakeMuTxt = (doc: SlateEditorDocument): MuTxtState => {
  const editor = withProtectedThings(createEditor());
  editor.children = doc as any;
  editor.selection = null;
  let contentVersion = 0;
  const subscribers: Array<() => void> = [];
  const cv = {
    get value() {
      return contentVersion;
    },
    next: (v: number) => {
      contentVersion = v;
      for (const s of subscribers) s();
    },
    subscribe: (fn: () => void) => {
      subscribers.push(fn);
      return () => {
        const i = subscribers.indexOf(fn);
        if (i >= 0) subscribers.splice(i, 1);
      };
    },
  };
  return {
    editor,
    contentVersion: cv,
    peritextRef: () => ({api: {model: {clock: {sid: 1, time: 100, tick: function (n: number) {
      const t = {sid: this.sid, time: this.time};
      this.time += n;
      return t;
    }}}}}) as any,
  } as unknown as MuTxtState;
};

describe('ThingsState', () => {
  test('add() returns a fresh id and stores the thing', () => {
    const mu = fakeMuTxt([{type: 'p', children: [{text: ''}]}]);
    const things = new ThingsState(mu);
    things.start();
    const id = things.add({'@type': 'File', mimeType: 'image/png', size: 0, data: new Uint8Array()} as any);
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
    expect(things.get(id)?.['@type']).toBe('File');
  });

  test('add() creates `.things` block at index 0 if missing', () => {
    const mu = fakeMuTxt([{type: 'p', children: [{text: ''}]}]);
    const things = new ThingsState(mu);
    things.start();
    things.add({'@type': 'X'} as any);
    expect((mu.editor.children[0] as any).type).toBe('.things');
  });

  test('add() appends to existing `.things`', () => {
    const mu = fakeMuTxt([
      {type: '.things', children: [
        {type: '.thing', thing: {'@type': 'X', '@id': 'a'}, children: [{text: ''}]} as any,
      ]} as any,
      {type: 'p', children: [{text: ''}]},
    ]);
    const things = new ThingsState(mu);
    things.start();
    const id = things.add({'@type': 'Y'} as any);
    expect((mu.editor.children[0] as any).children.length).toBe(2);
    expect(things.get(id)?.['@type']).toBe('Y');
    expect(things.get('a')?.['@type']).toBe('X');
  });

  test('list() filters by @type', () => {
    const mu = fakeMuTxt([
      {type: '.things', children: [
        {type: '.thing', thing: {'@type': 'A', '@id': 'a1'}, children: [{text: ''}]} as any,
        {type: '.thing', thing: {'@type': 'B', '@id': 'b1'}, children: [{text: ''}]} as any,
        {type: '.thing', thing: {'@type': 'A', '@id': 'a2'}, children: [{text: ''}]} as any,
      ]} as any,
      {type: 'p', children: [{text: ''}]},
    ]);
    const things = new ThingsState(mu);
    things.start();
    expect(things.list('A').map(t => t['@id'])).toEqual(['a1', 'a2']);
    expect(things.list('B').map(t => t['@id'])).toEqual(['b1']);
    expect(things.list().length).toBe(3);
  });

  test('update() patches one field; other keys preserved', () => {
    const mu = fakeMuTxt([
      {type: '.things', children: [
        {type: '.thing', thing: {'@type': 'File', '@id': 'f1', name: 'old', mimeType: 'image/png'}, children: [{text: ''}]} as any,
      ]} as any,
      {type: 'p', children: [{text: ''}]},
    ]);
    const things = new ThingsState(mu);
    things.start();
    expect(things.update('f1', {name: 'new'})).toBe(true);
    const t = things.get('f1');
    expect(t?.name).toBe('new');
    expect(t?.mimeType).toBe('image/png');
    expect(t?.['@id']).toBe('f1');
  });

  test('update() throws if `data` is in the partial', () => {
    const mu = fakeMuTxt([
      {type: '.things', children: [
        {type: '.thing', thing: {'@type': 'File', '@id': 'f1', mimeType: 'image/png', data: new Uint8Array()}, children: [{text: ''}]} as any,
      ]} as any,
      {type: 'p', children: [{text: ''}]},
    ]);
    const things = new ThingsState(mu);
    things.start();
    expect(() => things.update('f1', {data: new Uint8Array([1, 2, 3])} as any)).toThrow(/replace/);
  });

  test('remove() removes the thing element', () => {
    const mu = fakeMuTxt([
      {type: '.things', children: [
        {type: '.thing', thing: {'@type': 'X', '@id': 'a'}, children: [{text: ''}]} as any,
        {type: '.thing', thing: {'@type': 'X', '@id': 'b'}, children: [{text: ''}]} as any,
      ]} as any,
      {type: 'p', children: [{text: ''}]},
    ]);
    const things = new ThingsState(mu);
    things.start();
    expect(things.remove('a')).toBe(true);
    expect(things.has('a')).toBe(false);
    expect(things.has('b')).toBe(true);
  });

  test('references() returns paths of file blocks pointing at the id', () => {
    const mu = fakeMuTxt([
      {type: '.things', children: [
        {type: '.thing', thing: {'@type': 'File', '@id': 'f1', mimeType: 'image/png'}, children: [{text: ''}]} as any,
      ]} as any,
      {type: 'p', children: [{text: ''}]},
      {type: 'file', '@thing': 'f1', children: [{text: ''}]} as any,
      {type: 'file', '@thing': 'f1', children: [{text: ''}]} as any,
      {type: 'file', '@thing': 'other', children: [{text: ''}]} as any,
    ]);
    const things = new ThingsState(mu);
    things.start();
    const refs = things.references('f1');
    expect(refs).toEqual([[2], [3]]);
    expect(things.referenceCount('f1')).toBe(2);
  });

  test('gc() removes orphaned things', () => {
    const mu = fakeMuTxt([
      {type: '.things', children: [
        {type: '.thing', thing: {'@type': 'File', '@id': 'used'}, children: [{text: ''}]} as any,
        {type: '.thing', thing: {'@type': 'File', '@id': 'orphan1'}, children: [{text: ''}]} as any,
        {type: '.thing', thing: {'@type': 'File', '@id': 'orphan2'}, children: [{text: ''}]} as any,
      ]} as any,
      {type: 'p', children: [{text: ''}]},
      {type: 'file', '@thing': 'used', children: [{text: ''}]} as any,
    ]);
    const things = new ThingsState(mu);
    things.start();
    const {removed} = things.gc();
    expect(removed.sort()).toEqual(['orphan1', 'orphan2']);
    expect(things.has('used')).toBe(true);
    expect(things.has('orphan1')).toBe(false);
    expect(things.has('orphan2')).toBe(false);
  });

  test('version is bumped on add/update/remove', () => {
    const mu = fakeMuTxt([{type: 'p', children: [{text: ''}]}]);
    const things = new ThingsState(mu);
    things.start();
    const v0 = things.version.value;
    const id = things.add({'@type': 'X'} as any);
    expect(things.version.value).toBeGreaterThan(v0);
    const v1 = things.version.value;
    things.update(id, {name: 'foo'});
    expect(things.version.value).toBeGreaterThan(v1);
    const v2 = things.version.value;
    things.remove(id);
    expect(things.version.value).toBeGreaterThan(v2);
  });
});
