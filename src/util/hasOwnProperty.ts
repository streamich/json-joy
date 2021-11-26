const has = Object.prototype.hasOwnProperty;

export function hasOwnProperty(obj: object, key: string): boolean {
  return has.call(obj, key);
}
