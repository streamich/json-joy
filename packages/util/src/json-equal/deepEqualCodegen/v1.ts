import type {JavaScript} from '@jsonjoy.com/codegen';

const codegenValue = (doc: unknown, code: string[], r: number): number => {
  let rr = r;
  const type = typeof doc;
  const isPrimitive = doc === null || type === 'boolean' || type === 'string' || type === 'number';

  // Primitives
  if (isPrimitive) {
    if (doc === Infinity) {
      code.push(`if(r${r} !== Infinity)return false;`);
    } else if (doc === -Infinity) {
      code.push(`if(r${r} !== -Infinity)return false;`);
    } else {
      code.push(`if(r${r} !== ${JSON.stringify(doc)})return false;`);
    }
    return rr;
  }

  // Arrays
  if (Array.isArray(doc)) {
    code.push(`if(!Array.isArray(r${r}) || r${r}.length !== ${doc.length})return false;`);
    for (let i = 0; i < doc.length; i++) {
      rr++;
      code.push(`var r${rr}=r${r}[${i}];`);
      rr = codegenValue(doc[i], code, rr);
    }
    return rr;
  }

  // Uint8Array
  if (doc instanceof Uint8Array) {
    const length = doc.length;
    code.push(`if(!(r${r} instanceof Uint8Array) || r${r}.length !== ${length})return false;`);
    let condition = '';
    for (let i = 0; i < length; i++) condition += (condition ? '||' : '') + `(r${r}[${i}]!==${doc[i]})`;
    if (condition) code.push(`if(${condition})return false;`);
    return rr;
  }

  // Objects
  if (type === 'object' && doc) {
    const obj = doc as Record<string, unknown>;
    const keys = Object.keys(obj);
    code.push(
      `if(!r${r} || typeof r${r} !== "object" || Array.isArray(r${r}) || Object.keys(r${r}).length !== ${keys.length})return false;`,
    );
    for (const key of keys) {
      rr++;
      code.push(`var r${rr}=r${r}[${JSON.stringify(key)}];`);
      rr = codegenValue(obj[key], code, rr);
    }
    return rr;
  }

  // Undefined
  if (doc === undefined) {
    code.push(`if(r${r} !== undefined)return false;`);
    return rr;
  }

  return rr;
};

export const deepEqualCodegen = (a: unknown): JavaScript<(b: unknown) => boolean> => {
  const code: string[] = [];
  codegenValue(a, code, 0);

  const fn = ['(function(r0){', ...code, 'return true;', '})'];

  // return fn.join('\n') as JavaScript<(b: unknown) => boolean>;
  return fn.join('') as JavaScript<(b: unknown) => boolean>;
};
