import {clone} from '@jsonjoy.com/util/lib/json-clone';
import {find, isArrayReference, isObjectReference, type Path} from '@jsonjoy.com/json-pointer';
import {RandomJson} from '@jsonjoy.com/util/lib/json-random';
import {Fuzzer} from '@jsonjoy.com/util/lib/Fuzzer';
import type {JsonOp, JsonOpDataComponent, JsonOpDropComponent, JsonOpPickComponent} from '../../types';
import {applyPatch} from '../../../../../json-patch/applyPatch';

export class JsonOtFuzzer extends Fuzzer {
  maxPicks = 3;
  maxMoves = 3;
  maxInserts = 3;

  genDoc(): unknown {
    return RandomJson.generate({
      nodeCount: 5,
      odds: {
        array: 20,
        object: 20,
        binary: 0,
        boolean: 2,
        null: 1,
        number: 4,
        string: 4,
      },
    });
  }

  paths(doc: unknown): Path[] {
    if (doc instanceof Array) {
      const paths: Path[] = [];
      for (let i = 0; i < doc.length; i++) {
        paths.push([i]);
        const p = this.paths(doc[i]);
        paths.push(...p.map((path) => [i, ...path]));
      }
      return paths;
    } else if (doc && typeof doc === 'object') {
      const paths: Path[] = [];
      for (const key in doc) {
        paths.push([key]);
        const p = this.paths((doc as any)[key]);
        paths.push(...p.map((path) => [key, ...path]));
      }
      return paths;
    }
    return [];
  }

  protected doPick(doc: unknown, path: Path): [doc: unknown, picked: unknown] {
    const ref = find(doc, path);
    if (!ref.obj) return [undefined, ref.val];
    else {
      if (isArrayReference(ref)) {
        ref.obj.splice(ref.key, 1);
      } else if (isObjectReference(ref)) {
        delete ref.obj[ref.key];
      }
    }
    return [doc, ref.val];
  }

  protected pickPath(doc: unknown) {
    return Fuzzer.pick(this.paths(doc));
  }

  genOp(doc: unknown): JsonOp {
    // Current state of the document as operation is being performed.
    let currentDocument = clone(doc);
    let regId = 0;
    const _registers = new Map<number, unknown>();
    const pick: JsonOpPickComponent[] = [];
    const data: JsonOpDataComponent[] = [];
    const drop: JsonOpDropComponent[] = [];

    // const maxPicks = Fuzzer.generateInteger(0, this.maxPicks);
    // let pickCount = 0;
    // for (let i = 0; i < maxPicks; i++) {
    //   const paths = this.paths(currentDocument);
    //   const index = Fuzzer.generateInteger(0, paths.length - 1);
    //   const path = paths[index];
    //   if (!path) break;
    //   const [newDoc, picked] = this.doPick(currentDocument, path);
    //   const registerId = regId++;
    //   currentDocument = newDoc;
    //   registers.set(registerId, picked);
    //   pick.push([registerId, path]);
    //   pickCount++;
    //   if (typeof currentDocument !== 'object') break;
    // }
    // const maxMoves = Math.min(this.maxMoves, registers.size);
    // for (let i = 0; i < maxMoves; i++) {
    //   const index = Fuzzer.generateInteger(0, pick.length - 1);
    //   const [registerId, path] = pick[index];
    //   const value = registers.get(registerId);
    //   const paths = this.paths(currentDocument);
    //   const index2 = Fuzzer.generateInteger(0, paths.length - 1);
    //   const moveTo = paths[index2];
    //   if (!moveTo) break;
    //   const moveToRef = find(currentDocument, moveTo);
    //   if (moveToRef.val && (typeof moveToRef.val === 'object')) {
    //     if (Math.random() < 0.3) {
    //       drop.push([registerId, moveTo]);
    //       const value = registers.get(registerId);
    //       const ref = find(currentDocument, moveTo);
    //       if (ref.obj) {
    //         if (isArrayReference(ref)) ref.obj.splice(ref.key, 0, value);
    //         else if (isObjectReference(ref)) ref.obj[ref.key] = value;
    //       } else {
    //         currentDocument = value;
    //       }
    //     } else {
    //       if (moveToRef.val instanceof Array) {
    // const index = Fuzzer.generateInteger(0, moveToRef.val.length);
    // const objPath = [...path, index];
    // drop.push([registerId, objPath]);
    // const ref = find(docClone, path);
    // if (ref.obj) {
    //   if (isArrayReference(ref)) ref.obj.splice(ref.key, 0, value);
    //   else if (isObjectReference(ref)) ref.obj[ref.key] = value;
    // } else {
    //   docClone = value;
    // }
    // } else {
    // const key = RandomJson.genString(10);
    // const objPath = [...path, key];
    // drop.push([registerId, objPath]);
    // const ref = find(docClone, path);
    // if (ref.obj) {
    //   if (isArrayReference(ref)) ref.obj.splice(ref.key, 0, value);
    //   else if (isObjectReference(ref)) ref.obj[ref.key] = value;
    // } else {
    //   docClone = value;
    // }
    //       }
    //     }
    //   } else {
    //     drop.push([registerId, moveTo]);
    //     const ref = find(currentDocument, moveTo);
    //     if (ref.obj) {
    //       if (isArrayReference(ref)) ref.obj.splice(ref.key, 0, value);
    //       else if (isObjectReference(ref)) ref.obj[ref.key] = value;
    //     } else {
    //       currentDocument = value;
    //     }
    //   }
    // }
    // if (pickCount > 0) {
    //   const moveCount = Fuzzer.generateInteger(0, this.maxMoves);
    //   const movePaths = this.paths(doc);
    // for (let i = 0; i < moveCount; i++) {
    //   const registerId = Fuzzer.generateInteger(0, pickCount - 1);
    //   const index = Fuzzer.generateInteger(0, movePaths.length - 1);
    //   const path = movePaths[index];
    //   movePaths.splice(index, 1);
    //   const moveRef = find(doc, path);
    // if (moveRef.val && (typeof moveRef.val === 'object')) {
    //   if (Math.random() < 0.3) {
    //     drop.push([registerId, path]);
    //   } else {
    //     if (moveRef.val instanceof Array) {
    //       const index = Fuzzer.generateInteger(0, moveRef.val.length);
    //       drop.push([registerId, [...path, index]]);
    //     } else {
    //       const key = RandomJson.genString(10);
    //       drop.push([registerId, [...path, key]]);
    //     }
    //   }
    // } else {
    // drop.push([registerId, path]);
    // }
    //   }
    // }
    // const dataDropCount = Fuzzer.generateInteger(0, this.maxInserts);
    // const dataDropPaths = this.paths(doc);
    // for (let i = 0; i < dataDropCount; i++) {
    //   const value = RandomJson.genNumber(); // TODO: make this more random
    //   const registerId = regId++;
    //   data.push([registerId, value]);
    //   const index = Fuzzer.generateInteger(0, dataDropPaths.length - 1);
    //   const path = dataDropPaths[index];
    //   dataDropPaths.splice(index, 1);
    //   const dataDropRef = find(doc, path);
    //   if (Math.random() < 0.3) {
    //     drop.push([registerId, path])
    //   } else {
    //     if (dataDropRef.val instanceof Array) {
    //       const index = Fuzzer.generateInteger(0, dataDropRef.val.length);
    //       drop.push([registerId, [...path, index]]);
    //     } else {
    //       const key = RandomJson.genString(10);
    //       drop.push([registerId, [...path, key]]);
    //     }
    //   }
    // }

    const maxInserts = Fuzzer.randomInt(0, 2);
    for (let i = 0; i < maxInserts; i++) {
      const path = this.pickPath(currentDocument);
      const value = RandomJson.genNumber();
      const ref = find(currentDocument, path);
      const _doOverwriteAtPath = Math.random() < 0.3 || !ref.obj;
      if (isObjectReference(ref)) {
        const key = RandomJson.genString(4);
        const newPath = [...path.slice(0, path.length - 1), key];
        const registerId = regId++;
        data.push([registerId, value]);
        drop.push([registerId, newPath]);
        currentDocument = applyPatch(currentDocument, [{op: 'add', path: newPath, value}], {mutate: false}).doc;
      } else if (isArrayReference(ref)) {
        // const index = Fuzzer.generateInteger(0, ref.obj.length);
        // const index = 0;
        // const newPath = [...path.slice(0, path.length - 1), index];
        // const registerId = regId++;
        // data.push([registerId, value]);
        // console.log(currentDocument);
        // console.log(newPath);
        // drop.push([registerId, newPath]);
        // currentDocument = applyPatch(currentDocument, [{op: 'add', path: newPath, value}], {mutate: false}).doc;
      }
    }
    return [[], pick, data, drop];
  }
}
