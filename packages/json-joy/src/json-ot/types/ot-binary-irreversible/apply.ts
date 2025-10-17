import type {BinaryOp} from './types';

export const apply = (val: Uint8Array, op: BinaryOp): Uint8Array => {
  const length = op.length;
  let offset = 0;
  const res: Uint8Array[] = [];
  let outputLength = 0;
  for (let i = 0; i < length; i++) {
    const component = op[i];
    switch (typeof component) {
      case 'object':
        res.push(component);
        outputLength += component.length;
        break;
      case 'number': {
        if (component > 0) {
          const end = offset + component;
          res.push(val.subarray(offset, end));
          outputLength += end - offset;
          offset = end;
        } else offset -= component;
        break;
      }
    }
  }
  res.push(val.subarray(offset));
  outputLength += val.length - offset;
  const output = new Uint8Array(outputLength);
  const resLength = res.length;
  for (let i = 0, j = 0; i < resLength; i++) {
    const component = res[i];
    output.set(component, j);
    j += component.length;
  }
  return output;
};
