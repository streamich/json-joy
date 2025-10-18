import type {Path} from './types';

export const validateJsonPointer = (pointer: string | Path | unknown) => {
  if (typeof pointer === 'string') {
    if (pointer) {
      if (pointer[0] !== '/') throw new Error('POINTER_INVALID');
      if (pointer.length > 1024) throw new Error('POINTER_TOO_LONG');
    }
  } else validatePath(pointer);
};

const {isArray} = Array;

export const validatePath = (path: Path | unknown) => {
  if (!isArray(path)) throw new Error('Invalid path.');
  if (path.length > 256) throw new Error('Path too long.');
  for (const step of path) {
    switch (typeof step) {
      case 'string':
      case 'number':
        continue;
      default:
        throw new Error('Invalid path step.');
    }
  }
};
