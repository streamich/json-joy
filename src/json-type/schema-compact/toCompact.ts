import {hasKeys} from 'thingies/es2020/hasKeys';
import type * as compact from './schema';
import type * as verbose from '../schema/schema';

export const toCompact = (obj: verbose.Schema): compact.TCompactType => {
  switch (obj.kind) {
    case 'any':
    case 'bool':
    case 'num':
    case 'str': {
      const {kind, ...rest} = obj;
      return hasKeys(rest) ? [kind, rest] as compact.TCompactType : [kind] as compact.TCompactType;
    }
    case 'bin': {
      const {kind, type, ...rest} = obj;
      return (hasKeys(rest) ? [kind, type, rest] : [kind, type]) as compact.BinaryCompactSchema<any>;
    }
  }
  throw new Error('UNKNOWN_KIND');
};
