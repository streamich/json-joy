/**
 * @param json Any JSON value
 * @returns The maximum buffer size that this JSON value could be encoded using Msgpack
 */
export const computeMaxSize = (json: unknown): number => {
  switch (json) {
    case null: return 1;
    case true: return 1;
    case false: return 1;
  }
  if (json instanceof Array) {
    let size = 5;
    const len = json.length;
    for (let i = 0; i < len; i++) size += computeMaxSize(json[i]);
    return size;
  }
  switch (typeof json) {
    case 'number': return 9;
    case 'string': return 5 + (json.length * 4);
    case 'object': {
      let size = 5;
      const keys = Object.keys(json as object);
      const len = keys.length;
      for (let i = 0; i < len; i++) {
        const key = keys[i];
        size += 5 + (key.length * 4) + computeMaxSize((json as any)[key]);
      }
      return size;
    }
  }
  return 0;
};
