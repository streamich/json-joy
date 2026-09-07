import type {SchemaBase} from '@jsonjoy.com/json-type';

/** Optional fields read off various schema kinds to build a compact summary. */
interface TrailerFields {
  format?: string;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
  min?: number;
  max?: number;
  value?: unknown;
  ref?: string;
  keys?: unknown[];
  head?: unknown[];
  tail?: unknown[];
  type?: unknown;
  types?: unknown[];
}

const numRange = (s: TrailerFields): string => {
  const parts: string[] = [];
  if (s.gte !== undefined) parts.push(`≥${s.gte}`);
  if (s.gt !== undefined) parts.push(`>${s.gt}`);
  if (s.lte !== undefined) parts.push(`≤${s.lte}`);
  if (s.lt !== undefined) parts.push(`<${s.lt}`);
  return parts.join(' ');
};

const lenRange = (s: TrailerFields): string => {
  if (s.min !== undefined && s.max !== undefined) return `${s.min}…${s.max}`;
  if (s.min !== undefined) return `≥${s.min}`;
  if (s.max !== undefined) return `≤${s.max}`;
  return '';
};

const truncate = (str: string, n = 48): string => (str.length > n ? `${str.slice(0, n - 1)}…` : str);

const join = (...parts: (string | undefined)[]): string | null => {
  const out = parts.filter((p): p is string => !!p).join('  ');
  return out || null;
};

/**
 * A compact, one-line summary of a schema node's distinguishing info, shown in
 * the header when the node is collapsed.
 */
export const getTrailer = (schema: SchemaBase): string | null => {
  const s = schema as SchemaBase & TrailerFields;
  switch (schema.kind) {
    case 'num':
      return join(s.format, numRange(s));
    case 'str':
    case 'bin':
      return join(s.format, lenRange(s));
    case 'con':
      try {
        return truncate(JSON.stringify(s.value) ?? String(s.value));
      } catch {
        return String(s.value);
      }
    case 'ref':
      return s.ref ? `→ ${s.ref}` : null;
    case 'obj': {
      const n = s.keys?.length ?? 0;
      return `{ ${n} ${n === 1 ? 'key' : 'keys'} }`;
    }
    case 'module': {
      const n = s.keys?.length ?? 0;
      return `{ ${n} ${n === 1 ? 'type' : 'types'} }`;
    }
    case 'arr': {
      const head = s.head?.length ?? 0;
      const tail = s.tail?.length ?? 0;
      if (head || tail) return `[ ${head + tail + (s.type ? 1 : 0)} ]`;
      return s.type ? '[ items ]' : '[ ]';
    }
    case 'or': {
      const n = s.types?.length ?? 0;
      return `${n} ${n === 1 ? 'variant' : 'variants'}`;
    }
    case 'map':
      return '{ … }';
    case 'fn':
    case 'fn$':
      return '( req → res )';
    default:
      return null;
  }
};
