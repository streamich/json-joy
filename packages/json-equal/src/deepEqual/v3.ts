export const deepEqual = (a: unknown, b: unknown): boolean => {
  // Primitives
  if (a === b) return true;

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    // Arrays
    if (a.constructor !== b.constructor) return false;
    let length: number, i: number, keys: string[];
    if (Array.isArray(a)) {
      length = a.length;
      if (length !== (b as Array<unknown>).length) return false;
      for (i = length; i-- !== 0; ) if (!deepEqual(a[i], (b as Array<unknown>)[i])) return false;
      return true;
    }

    // Objects
    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;
    for (i = length; i-- !== 0; )
      if (
        !(
          // biome-ignore lint: .hasOwnProperty access is intentional
          Object.prototype.hasOwnProperty.call(b, keys[i])
        )
      )
        return false;
    for (i = length; i-- !== 0; ) {
      const key = keys[i];
      if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) return false;
    }
    return true;
  }

  return false;
};
