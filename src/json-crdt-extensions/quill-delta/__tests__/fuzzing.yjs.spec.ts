import {QuillDeltaFuzzer} from './QuillDeltaFuzzer';
import {Doc as YDoc} from 'yjs';
import type {QuillDeltaOp, QuillDeltaOpDelete} from '../types';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {clone} from '@jsonjoy.com/util/lib/json-clone';

const normalizeDelta = (delta: QuillDeltaOp[]): QuillDeltaOp[] => {
  const length = delta.length;
  if (!length) return [];
  const normalized: QuillDeltaOp[] = [delta[0]];
  const toDelete: number[] = [];
  let last = delta[0];
  for (let i = 1; i < length; i++) {
    const curr = delta[i];
    if (typeof (last as any).delete === 'number' && typeof (curr as any).delete === 'number') {
      (last as QuillDeltaOpDelete).delete += (curr as QuillDeltaOpDelete).delete;
      toDelete.push(i);
    } else if (
      typeof (last as any).retain === 'number' &&
      typeof (curr as any).retain === 'number' &&
      deepEqual((<any>last).attributes, (<any>curr).attributes)
    ) {
      (last as any).retain += (curr as any).retain;
      toDelete.push(i);
    } else if (
      typeof (last as any).insert === 'string' &&
      typeof (curr as any).insert === 'string' &&
      deepEqual((<any>last).attributes, (<any>curr).attributes)
    ) {
      (last as any).insert += (curr as any).insert;
      toDelete.push(i);
    } else {
      normalized.push(curr);
      last = curr;
    }
  }
  for (const index of toDelete.reverse()) delta.splice(index, 1);
  return normalized;
};

for (let j = 0; j < 100; j++) {
  test('fuzz - ' + j, () => {
    const doc = new YDoc();
    const text = doc.getText('quill');
    const fuzzer = new QuillDeltaFuzzer({
      maxOperationsPerPatch: 3,
    });
    for (let i = 0; i < 25; i++) {
      const patch = fuzzer.createPatch();
      fuzzer.applyPatch();
      text.applyDelta(clone(patch));
    }
    const delta = text.toDelta();
    const deltaNormalized = normalizeDelta(text.toDelta());
    try {
      expect(deltaNormalized).toEqual(fuzzer.trace().contents.ops);
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(JSON.stringify(fuzzer.trace()));
      // tslint:disable-next-line:no-console
      console.log(delta);
      // tslint:disable-next-line:no-console
      console.log(deltaNormalized);
      // tslint:disable-next-line:no-console
      console.log(fuzzer.trace().contents.ops);
      throw error;
    }
  });
}
