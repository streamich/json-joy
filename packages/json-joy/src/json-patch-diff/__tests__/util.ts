import {JsonPatchDiff} from '../JsonPatchDiff';
import {applyPatch} from '../../json-patch';
import {RandomJson} from '@jsonjoy.com/json-random';

export const assertDiff = (src: unknown, dst: unknown) => {
  const srcNested = {src};
  const patch1 = new JsonPatchDiff().diff('/src', src, dst);
  // console.log(src);
  // console.log(patch1);
  // console.log(dst);
  const {doc: res} = applyPatch(srcNested, patch1, {mutate: false});
  // console.log(res);
  expect(res).toEqual({src: dst});
  const patch2 = new JsonPatchDiff().diff('/src', (res as any).src, dst);
  // console.log(patch2);
  expect(patch2.length).toBe(0);
};

export const randomArray = () => {
  const len = Math.floor(Math.random() * 10);
  const arr: unknown[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(Math.ceil(Math.random() * 13));
  }
  return arr;
};

export const randomString = (maxLength = 50) => {
  return RandomJson.genString(Math.floor(Math.random() * maxLength));
};

export const randomMixedArray = (maxLength = 10) => {
  const len = Math.floor(Math.random() * maxLength);
  const arr: unknown[] = [];
  const types = ['number', 'string', 'boolean', 'null', 'object', 'array'];

  for (let i = 0; i < len; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    switch (type) {
      case 'number':
        arr.push(Math.random() * 1000);
        break;
      case 'string':
        arr.push(randomString(20));
        break;
      case 'boolean':
        arr.push(Math.random() > 0.5);
        break;
      case 'null':
        arr.push(null);
        break;
      case 'object':
        arr.push(RandomJson.generate({nodeCount: 3}));
        break;
      case 'array':
        arr.push(randomMixedArray(3));
        break;
    }
  }
  return arr;
};

export const randomObject = (maxKeys = 10) => {
  const keyCount = Math.floor(Math.random() * maxKeys);
  const obj: Record<string, unknown> = {};
  const possibleKeys = ['a', 'b', 'c', 'test', 'name', 'value', 'id', 'data'];

  for (let i = 0; i < keyCount; i++) {
    const key = Math.random() > 0.8 ? `key${i}` : possibleKeys[Math.floor(Math.random() * possibleKeys.length)];
    obj[key] = RandomJson.generate({nodeCount: 2});
  }
  return obj;
};

export const randomNestedStructure = (depth = 3) => {
  if (depth <= 0) {
    return RandomJson.generate({nodeCount: 1});
  }

  const type = Math.random();
  if (type < 0.5) {
    // Object
    const obj: Record<string, unknown> = {};
    const keyCount = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < keyCount; i++) {
      obj[`key${i}`] = randomNestedStructure(depth - 1);
    }
    return obj;
  } else {
    // Array
    const len = Math.floor(Math.random() * 5) + 1;
    const arr: unknown[] = [];
    for (let i = 0; i < len; i++) {
      arr.push(randomNestedStructure(depth - 1));
    }
    return arr;
  }
};

export const createSimilarDocument = (original: unknown, mutationRate = 0.1): unknown => {
  if (Math.random() < mutationRate) {
    // Apply random mutation
    return RandomJson.generate({nodeCount: 2});
  }

  if (Array.isArray(original)) {
    return original.map((item) => createSimilarDocument(item, mutationRate));
  }

  if (original && typeof original === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(original)) {
      result[key] = createSimilarDocument(value, mutationRate);
    }
    return result;
  }

  return original;
};
