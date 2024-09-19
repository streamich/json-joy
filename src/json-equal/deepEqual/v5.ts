const isArray = Array.isArray;

export const deepEqual = (a: unknown, b: unknown): boolean => {
  // Primitives
  if (a === b) return true;

  // Arrays
  let length, i, keys;
  if (isArray(a)) {
    if (!isArray(b)) return false;
    length = a.length;
    if (length !== (b as Array<unknown>).length) return false;
    for (i = length; i-- !== 0; ) if (!deepEqual(a[i], (b as Array<unknown>)[i])) return false;
    return true;
  }

  // Objects
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    keys = Object.keys(a);
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
