import {ConstType, ObjectFieldType, ObjectType, TupleType} from "./classes";
import {Type} from "./types";

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

  public static find(type: Type): Discriminator | undefined {
    const constDiscriminator = Discriminator.findConst(type);
    if (constDiscriminator) return constDiscriminator;
    return new Discriminator('', type);
  }

  constructor(public readonly path: string, public readonly type: Type) {}

  toSpecifier(): string {
    const type = this.type;
    const path = this.path;
    const mnemonic = type.getTypeName();
    const value = type instanceof ConstType ? type.value() : 0;
    return JSON.stringify([path, mnemonic, value]);
  }
}
