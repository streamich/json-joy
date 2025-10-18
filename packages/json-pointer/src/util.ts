import type {Path} from './types';

const r1 = /~1/g;
const r2 = /~0/g;
const r3 = /~/g;
const r4 = /\//g;

/**
 * Un-escapes a JSON pointer path component.
 */
export function unescapeComponent(component: string): string {
  if (component.indexOf('~') === -1) return component;
  return component.replace(r1, '/').replace(r2, '~');
}

/**
 * Escapes a JSON pointer path component.
 */
export function escapeComponent(component: string): string {
  if (component.indexOf('/') === -1 && component.indexOf('~') === -1) return component;
  return component.replace(r3, '~0').replace(r4, '~1');
}

/**
 * Convert JSON pointer like "/foo/bar" to array like ["", "foo", "bar"], while
 * also un-escaping reserved characters.
 */
export function parseJsonPointer(pointer: string): Path {
  if (!pointer) return [];
  // TODO: Performance of this line can be improved: (1) don't use .split(); (2) don't use .map().
  return pointer.slice(1).split('/').map(unescapeComponent);
}

/**
 * Escape and format a path array like ["", "foo", "bar"] to JSON pointer
 * like "/foo/bar".
 */
export function formatJsonPointer(path: Path): string {
  if (isRoot(path)) return '';
  return '/' + path.map((component) => escapeComponent(String(component))).join('/');
}

export const toPath = (pointer: string | Path) => (typeof pointer === 'string' ? parseJsonPointer(pointer) : pointer);

/**
 * Returns true if `parent` contains `child` path, false otherwise.
 */
export function isChild(parent: Path, child: Path): boolean {
  if (parent.length >= child.length) return false;
  for (let i = 0; i < parent.length; i++) if (parent[i] !== child[i]) return false;
  return true;
}

export function isPathEqual(p1: Path, p2: Path): boolean {
  if (p1.length !== p2.length) return false;
  for (let i = 0; i < p1.length; i++) if (p1[i] !== p2[i]) return false;
  return true;
}

// export function getSharedPath(one: Path, two: Path): Path {
//   const min = Math.min(one.length, two.length);
//   const res: string[] = [];
//   for (let i = 0; i < min; i++) {
//     if (one[i] === two[i]) res.push(one[i]);
//     else break;
//   }
//   return res as Path;
// }

/**
 * Returns true if JSON Pointer points to root value, false otherwise.
 */
export const isRoot = (path: Path): boolean => !path.length;

/**
 * Returns parent path, e.g. for ['foo', 'bar', 'baz'] returns ['foo', 'bar'].
 */
export function parent(path: Path): Path {
  if (path.length < 1) throw new Error('NO_PARENT');
  return path.slice(0, path.length - 1);
}

/**
 * Check if path component can be a valid array index.
 */
export function isValidIndex(index: string | number): boolean {
  if (typeof index === 'number') return true;
  const n = Number.parseInt(index, 10);
  return String(n) === index && n >= 0;
}

export const isInteger = (str: string): boolean => {
  const len = str.length;
  let i = 0;
  let charCode: any;
  while (i < len) {
    charCode = str.charCodeAt(i);
    if (charCode >= 48 && charCode <= 57) {
      i++;
      continue;
    }
    return false;
  }
  return true;
};
