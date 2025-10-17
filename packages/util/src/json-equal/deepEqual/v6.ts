const isArray = Array.isArray;
const OBJ_PROTO = Object.prototype;

export const deepEqual = (a: unknown, b: unknown): boolean => {
  // Primitives
  if (a === b) return true;

  let length: number = 0,
    i: number = 0;

  // Arrays
  if (isArray(a)) {
    if (!isArray(b)) return false;
    length = a.length;
    if (length !== (b as Array<unknown>).length) return false;
    for (i = length; i-- !== 0; ) if (!deepEqual(a[i], (b as Array<unknown>)[i])) return false;
    return true;
  }

  // Objects
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    specific: {
      if ((<any>a).__proto__ === OBJ_PROTO) break specific;
      if (a instanceof Uint8Array) {
        if (!(b instanceof Uint8Array)) return false;
        const length = a.length;
        if (length !== b.length) return false;
        for (let i = 0; i < length; i++) if (a[i] !== b[i]) return false;
        return true;
      }
    }
    const keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;
    if (isArray(b)) return false;
    for (i = length; i-- !== 0; ) {
      const key = keys[i];
      if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) return false;
    }
    return true;
  }

  return false;
};
