import {ArrType, BoolType, ConType, NumType, type KeyType, ObjType, StrType} from './classes';
import type {Expr} from '@jsonjoy.com/json-expression';
import type {OrType, RefType, Type} from './types';

/**
 * Discriminator class for automatically identifying distinguishing patterns in
 * union types.
 *
 * This class analyzes types to find discriminatory characteristics that can be
 * used to differentiate between variants in a union type at runtime. It can
 * autodiscriminate:
 *
 * - **Constant values** (`ConType`): Exact literal values (strings, numbers, booleans, null)
 * - **Primitive types**: `boolean`, `number`, `string` based on JavaScript `typeof`
 * - **Structural types**: `object` vs `array` differentiation
 * - **Nested discriminators**: Constant values or types found in object properties or array elements
 *
 * ## Discriminator Specifiers
 *
 * Specifiers are JSON-encoded arrays `[path, typeSpecifier, value]` that
 * uniquely identify discriminators:
 *
 * **Constant value discriminators** (exact matches):
 *
 * - `["", "con", "success"]` - Root value must be string "success"
 * - `["/type", "con", "user"]` - Property `type` must be string "user"
 * - `["/0", "con", 42]` - First array element must be number 42
 * - `["", "con", null]` - Root value must be null
 *
 * **Type-based discriminators** (typeof checks):
 *
 * - `["", "bool", 0]` - Root value must be boolean (any boolean)
 * - `["/age", "num", 0]` - Property `age` must be number (any number)
 * - `["/name", "str", 0]` - Property `name` must be string (any string)
 * - `["", "obj", 0]` - Root value must be object
 * - `["", "arr", 0]` - Root value must be array
 *
 * **Handling Value Types vs Constants**:
 *
 * - **Constant values**: When discriminator finds a `ConType`, it creates exact value matches.
 * - **Value types**: When discriminator finds primitive types without constants, it matches by `typeof`.
 * - **Precedence**: Constant discriminators are preferred over type discriminators for more specific matching.
 *
 * The discriminator creates JSON Expression conditions that can be evaluated at
 * runtime to determine which type variant a value matches in a union type. JSON
 * Expression can be compiled to JavaScript for efficient evaluation.
 */
export class Discriminator {
  public static findConst(type: Type): Discriminator | undefined {
    if (type instanceof ConType) {
      return new Discriminator('', type);
    } else if (type instanceof ArrType) {
      const {_head = []} = type;
      // TODO: add support for array tail.
      const types = _head;
      for (let i = 0; i < types.length; i++) {
        const t = types[i];
        const d = Discriminator.findConst(t);
        if (d) return new Discriminator('/' + i + d.path, d.type);
      }
    } else if (type instanceof ObjType) {
      const fields = type.keys as KeyType<string, Type>[];
      for (let i = 0; i < fields.length; i++) {
        const f = fields[i];
        const d = Discriminator.findConst(f.val);
        if (d) return new Discriminator('/' + f.key + d.path, d.type);
      }
    }
    return undefined;
  }

  public static find(type: Type): Discriminator {
    const constDiscriminator = Discriminator.findConst(type);
    return constDiscriminator ?? new Discriminator('', type);
  }

  public static createExpression(types: Type[]): Expr {
    const specifiers = new Set<string>();
    const length = types.length;
    const expanded: Type[] = [];
    const expand = (type: Type): Type[] => {
      while (type.kind() === 'ref' || type.kind() === 'key') {
        if (type.kind() === 'ref') type = (type as RefType).resolve();
        if (type.kind() === 'key') type = (type as KeyType<any, Type>).val;
      }
      if (type.kind() === 'or') return (type as OrType).types.flatMap((t: Type) => expand(t));
      return [type];
    };
    for (let i = 0; i < length; i++) expanded.push(...expand(types[i]));
    const expandedLength = expanded.length;
    const discriminators: Discriminator[] = [];
    for (let i = 1; i < expandedLength; i++) {
      const type = expanded[i];
      const d = Discriminator.find(type);
      const specifier = d.toSpecifier();
      if (specifiers.has(specifier)) throw new Error('Duplicate discriminator: ' + specifier);
      specifiers.add(specifier);
      discriminators.push(d);
    }
    let expr: Expr = <any>0;
    for (let i = 0; i < discriminators.length; i++) {
      const d = discriminators[i];
      expr = <Expr>['?', d.condition(), i + 1, expr];
    }
    return expr;
  }

  constructor(
    public readonly path: string,
    public readonly type: Type,
  ) {}

  condition(): Expr {
    if (this.type instanceof ConType)
      return ['==', this.type.literal(), ['$', this.path, this.type.literal() === null ? '' : null]];
    if (this.type instanceof BoolType) return ['==', ['type', ['$', this.path]], 'boolean'];
    if (this.type instanceof NumType) return ['==', ['type', ['$', this.path]], 'number'];
    if (this.type instanceof StrType) return ['==', ['type', ['$', this.path]], 'string'];
    switch (this.typeSpecifier()) {
      case 'obj':
        return ['==', ['type', ['$', this.path]], 'object'];
      case 'arr':
        return ['==', ['type', ['$', this.path]], 'array'];
    }
    throw new Error('Cannot create condition for discriminator: ' + this.toSpecifier());
  }

  typeSpecifier(): string {
    const kind = this.type.kind();
    switch (kind) {
      case 'bool':
      case 'str':
      case 'num':
      case 'con':
        return kind;
      case 'obj':
      case 'map':
        return 'obj';
      case 'arr':
        return 'arr';
      case 'fn':
      case 'fn$':
        return 'fn';
    }
    return '';
  }

  toSpecifier(): string {
    const type = this.type;
    const path = this.path;
    const typeSpecifier = this.typeSpecifier();
    const value = type instanceof ConType ? type.literal() : 0;
    return JSON.stringify([path, typeSpecifier, value]);
  }
}
