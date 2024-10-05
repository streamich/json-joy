import {Expr} from '@jsonjoy.com/json-expression';
import {BooleanType, ConstType, NumberType, ObjectFieldType, ObjectType, StringType, TupleType} from './classes';
import {Type} from './types';

export class Discriminator {
  public static findConst(type: Type): Discriminator | undefined {
    if (type instanceof ConstType) return new Discriminator('', type);
    else if (type instanceof TupleType) {
      const types = type.types;
      for (let i = 0; i < types.length; i++) {
        const t = types[i];
        const d = Discriminator.findConst(t);
        if (d) return new Discriminator('/' + i + d.path, d.type);
      }
    } else if (type instanceof ObjectType) {
      const fields = type.fields as ObjectFieldType<string, Type>[];
      for (let i = 0; i < fields.length; i++) {
        const f = fields[i];
        const d = Discriminator.findConst(f.value);
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
    const length = types.length;
    const specifiers = new Set<string>();
    const discriminators: Discriminator[] = [];
    for (let i = 1; i < length; i++) {
      const type = types[i];
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
    if (this.type instanceof ConstType) return ['==', this.type.value(), ['$', this.path]];
    if (this.type instanceof BooleanType) return ['==', ['type', ['$', this.path]], 'boolean'];
    if (this.type instanceof NumberType) return ['==', ['type', ['$', this.path]], 'number'];
    if (this.type instanceof StringType) return ['==', ['type', ['$', this.path]], 'string'];
    switch (this.typeSpecifier()) {
      case 'obj':
        return ['==', ['type', ['$', this.path]], 'object'];
      case 'arr':
        return ['==', ['type', ['$', this.path]], 'array'];
    }
    throw new Error('Cannot create condition for discriminator: ' + this.toSpecifier());
  }

  typeSpecifier(): string {
    const mnemonic = this.type.getTypeName();
    switch (mnemonic) {
      case 'bool':
      case 'str':
      case 'num':
      case 'const':
        return mnemonic;
      case 'obj':
      case 'map':
        return 'obj';
      case 'arr':
      case 'tup':
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
    const value = type instanceof ConstType ? type.value() : 0;
    return JSON.stringify([path, typeSpecifier, value]);
  }
}
