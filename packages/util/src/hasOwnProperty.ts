const has = Object.prototype.hasOwnProperty;

// biome-ignore lint: shadow name is intended
export function hasOwnProperty(obj: object, key: string): boolean {
  return has.call(obj, key);
}
