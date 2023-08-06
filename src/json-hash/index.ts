import type {JsonValue} from '../json-pack/types';
import {sort} from '../util/sort/insertion';

export const enum CONST {
  START_STATE = 5381,

  NULL = 982452847,
  TRUE = 982453247,
  FALSE = 982454243,
  ARRAY = 982452259,
  STRING = 982453601,
  OBJECT = 982454533,
}

export const updateNum = (state: number, num: number): number => {
  return (state << 5) + state + num;
};

export const updateStr = (state: number, str: string): number => {
  let i = str.length;
  while (i) state = (state << 5) + state + str.charCodeAt(--i);
  return state;
};

export const updateJson = (state: number, json: JsonValue): number => {
  switch (typeof json) {
    case 'number':
      return updateNum(state, json);
    case 'string':
      state = updateNum(state, CONST.STRING);
      return updateStr(state, json);
    case 'object': {
      if (json === null) return updateNum(state, CONST.NULL);
      if (json instanceof Array) {
        const length = json.length;
        state = updateNum(state, CONST.ARRAY);
        for (let i = 0; i < length; i++) state = updateJson(state, json[i]);
        return state;
      }
      state = updateNum(state, CONST.OBJECT);
      const keys = sort(Object.keys(json as object));
      const length = keys.length;
      for (let i = 0; i < length; i++) {
        const key = keys[i];
        state = updateStr(state, key);
        state = updateJson(state, (json as any)[key]);
      }
      return state;
    }
    case 'boolean':
      return updateNum(state, json ? CONST.TRUE : CONST.FALSE);
  }
  return state;
};

export const hash = (json: JsonValue) => updateJson(CONST.START_STATE, json) >>> 0;
