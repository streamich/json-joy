import {RandomJson} from '.';
import {clone as deepClone} from '../json-clone/clone';
import {TAnyType} from '../json-type';

export interface RandomTypeOptions {
  ref?: (ref: string) => TAnyType;
}

export const randomType = (type: TAnyType, options: RandomTypeOptions): unknown => {
  switch (type.__t) {
    case 'nil':
      return null;
    case 'bool': {
      if (typeof type.const === 'boolean') return type.const;
      return RandomJson.genBoolean();
    }
    case 'num': {
      if (typeof type.const === 'number') return type.const;
      if (type.format) {
        const num = Math.random();
        switch (type.format) {
          case 'i8':
            return Math.round(num * 0xff) - 0x80;
          case 'i16':
            return Math.round(num * 0xffff) - 0x8000;
          case 'i32':
            return Math.round(num * 0xffffffff) - 0x80000000;
          case 'i64':
          case 'i':
            return Math.round(num * 0xffffffffff) - 0x8000000000;
          case 'u8':
            return Math.round(num * 0xff);
          case 'u16':
            return Math.round(num * 0xffff);
          case 'u32':
            return Math.round(num * 0xffffffff);
          case 'u64':
          case 'u':
            return Math.round(num * 0xffffffffff);
        }
      }
      return RandomJson.genNumber();
    }
    case 'str': {
      if (typeof type.const === 'string') return type.const;
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
