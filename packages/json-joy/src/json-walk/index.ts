export const walk = (value: unknown, callback: (value: unknown) => void): void => {
  callback(value);
  if (typeof value === 'object') {
    if (!value) return;
    switch (value.constructor) {
      case Array: {
        const arr = value as unknown[];
        const length = arr.length;
        for (let i = 0; i < length; i++) walk(arr[i], callback);
        break;
      }
      case Object: {
        const obj = value as Record<string, unknown>;
        for (const key in obj) walk(obj[key], callback);
        break;
      }
      case Map:
      case Set: {
        const mapOrSet = value as Set<unknown> | Map<unknown, unknown>;
        // biome-ignore lint: .forEach() is the fastest way to iterate over a Set or Map
        mapOrSet.forEach((val) => walk(val, callback));
        break;
      }
    }
  }
};
