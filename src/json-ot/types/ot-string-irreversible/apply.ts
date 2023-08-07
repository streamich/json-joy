import type {StringOp} from './types';

export const apply = (str: string, op: StringOp): string => {
  const length = op.length;
  let res = '';
  let offset = 0;
  for (let i = 0; i < length; i++) {
    const component = op[i];
    switch (typeof component) {
      case 'string':
        res += component;
        break;
      case 'number': {
        if (component > 0) {
          const end = offset + component;
          res += str.substring(offset, end);
          offset = end;
        } else offset -= component;
        break;
      }
    }
  }
  return res + str.substring(offset);
};
