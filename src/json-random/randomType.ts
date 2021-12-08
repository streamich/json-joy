import {RandomJson} from '.';
import {deepClone} from '../json-patch/util';
import {TAnyType} from '../json-type';

export interface RandomTypeOptions {
  ref?: (ref: string) => TAnyType;
}

export const randomType = (type: TAnyType, options: RandomTypeOptions): unknown => {
  switch (type.__t) {
    case 'nil':
      return null;
    case 'bool': {
      if (type.const) return type.const;
      return RandomJson.genBoolean();
    }
    case 'num': {
      if (type.const) return type.const;
      return RandomJson.genNumber();
    }
    case 'str': {
      if (type.const) return type.const;
      return RandomJson.genString();
    }
    case 'arr': {
      const length = Math.round(Math.random() * 10);
      const arr = [];
      for (let i = 0; i < length; i++) {
        arr.push(randomType(type.type as TAnyType, options));
      }
      return arr;
    }
    case 'obj': {
      const obj: {[key: string]: unknown} = type.unknownFields
        ? (RandomJson.genObject() as {[key: string]: unknown})
        : {};
      for (const field of type.fields) {
        if (field.isOptional) if (Math.random() > 0.5) continue;
        obj[field.key] = randomType(field.type as TAnyType, options);
      }
      return obj;
    }
    case 'enum': {
      const index = Math.floor(Math.random() * type.values.length);
      const value = deepClone(type.values[index]);
      return value;
    }
    case 'ref': {
      if (!options.ref) {
        throw new Error('Reference resolution callback not provided.');
      }
      return randomType(options.ref(type.ref), options);
    }
    case 'any': {
      return RandomJson.generate({nodeCount: 5});
    }
    case 'bin': {
      const octets = RandomJson.genString()
        .split('')
        .map((c) => c.charCodeAt(0));
      return new Uint8Array(octets);
    }
    case 'or': {
      const index = Math.floor(Math.random() * type.types.length);
      return randomType(type.types[index] as TAnyType, options);
    }
  }
};
