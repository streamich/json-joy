/**
 * @todo Rename to `toLine`?
 */
export const stringify = (value: unknown, spacing: string = ' '): string => {
  switch (value) {
    case null:
      return '!n';
    case undefined:
      return '!u';
    case true:
      return '!t';
    case false:
      return '!f';
  }
  if (Array.isArray(value))
    return `[${spacing}${value.map((v) => stringify(v, spacing)).join(',' + spacing)}${spacing}]`;
  if (value instanceof Uint8Array) return `${value}`;
  switch (typeof value) {
    case 'number':
      return `${value}`;
    case 'string':
      return JSON.stringify(value);
    case 'object': {
      const keys = Object.keys(value as object);
      return `{${spacing}${keys
        .map((k) => `${k}${spacing}=${spacing}${stringify((value as any)[k], spacing)}`)
        .join(',' + spacing)}${spacing}}`;
    }
  }
  return '?';
};
