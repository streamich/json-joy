import {JsExpression} from '@jsonjoy.com/codegen/lib/util/JsExpression';
import {normalizeAccessor} from '@jsonjoy.com/codegen/lib/util/normalizeAccessor';
import {MsgPackEncoder} from '@jsonjoy.com/json-pack/lib/msgpack/MsgPackEncoder';
import {KeyOptType, type KeyType, type ObjType, type Type} from '../../../type';
import {lazyKeyedFactory} from '../../util';
import {AbstractBinaryCodegen} from '../AbstractBinaryCodegen';
import {writer} from '../writer';
import {once} from 'thingies/lib/once';
import type {CompiledBinaryEncoder, SchemaPath} from '../../types';

export class MsgPackCodegen extends AbstractBinaryCodegen<MsgPackEncoder> {
  public static readonly get = lazyKeyedFactory((type: Type, name?: string) => {
    const codegen = new MsgPackCodegen(type, name);
    const r = codegen.codegen.options.args[0];
    const expression = new JsExpression(() => r);
    codegen.onNode([], expression, type);
    return codegen.compile();
  });

  protected encoder = new MsgPackEncoder(writer);

  @once
  protected linkGet(): void {
    this.codegen.linkDependency(MsgPackCodegen.get, 'get');
  }

  protected onObj(path: SchemaPath, value: JsExpression, type: ObjType): void {
    const codegen = this.codegen;
    const r = codegen.r();
    const fields = type.keys;
    const length = fields.length;
    const requiredFields = fields.filter((field) => !(field instanceof KeyOptType));
    const optionalFields = fields.filter((field) => field instanceof KeyOptType);
    const requiredLength = requiredFields.length;
    const optionalLength = optionalFields.length;
    const totalMaxKnownFields = requiredLength + optionalLength;
    if (totalMaxKnownFields > 0xffff) throw new Error('Too many fields');
    const encodeUnknownFields = !!type.schema.encodeUnknownKeys;
    const rFieldCount = codegen.r();
    const emitRequiredFields = () => {
      for (let i = 0; i < requiredLength; i++) {
        const field = requiredFields[i];
        this.blob(this.gen((encoder) => encoder.writeStr(field.key)));
        const accessor = normalizeAccessor(field.key);
        this.onNode([...path, field.key], new JsExpression(() => `${r}${accessor}`), field.val);
      }
    };
    const emitOptionalFields = () => {
      for (let i = 0; i < optionalLength; i++) {
        const field = optionalFields[i];
        const accessor = normalizeAccessor(field.key);
        codegen.if(`${r}${accessor} !== undefined`, () => {
          codegen.js(`${rFieldCount}++;`);
          this.blob(this.gen((encoder) => encoder.writeStr(field.key)));
          this.onNode([...path, field.key], new JsExpression(() => `${r}${accessor}`), field.val);
        });
      }
    };
    const emitUnknownFields = () => {
      const ri = codegen.r();
      const rKeys = codegen.r();
      const rKey = codegen.r();
      const rLength = codegen.r();
      const keys = fields.map((field) => JSON.stringify(field.key));
      const rKnownFields = codegen.addConstant(`new Set([${keys.join(',')}])`);
      codegen.js(`var ${rKeys} = Object.keys(${r}), ${rLength} = ${rKeys}.length, ${rKey};`);
      codegen.js(`for (var ${ri} = 0; ${ri} < ${rLength}; ${ri}++) {`);
      codegen.js(`${rKey} = ${rKeys}[${ri}];`);
      codegen.js(`if (${rKnownFields}.has(${rKey})) continue;`);
      codegen.js(`${rFieldCount}++;`);
      codegen.js(`encoder.writeStr(${rKey});`);
      codegen.js(`encoder.writeAny(${r}[${rKey}]);`);
      codegen.js(`}`);
    };
    codegen.js(/* js */ `var ${r} = ${value.use()};`);
    if (!encodeUnknownFields && !optionalLength) {
      this.blob(this.gen((encoder) => encoder.writeObjHdr(length)));
      emitRequiredFields();
    } else if (!encodeUnknownFields) {
      codegen.js(`var ${rFieldCount} = ${requiredLength};`);
      const rHeaderPosition = codegen.var('writer.x');
      this.blob(this.gen((encoder) => encoder.writeObjHdr(0xffff)));
      emitRequiredFields();
      emitOptionalFields();
      codegen.js(`view.setUint16(${rHeaderPosition} + 1, ${rFieldCount});`);
    } else {
      codegen.js(`var ${rFieldCount} = ${requiredLength};`);
      const rHeaderPosition = codegen.var('writer.x');
      this.blob(this.gen((encoder) => encoder.writeObjHdr(0xffffffff)));
      emitRequiredFields();
      emitOptionalFields();
      emitUnknownFields();
      codegen.js(`view.setUint32(${rHeaderPosition} + 1, ${rFieldCount});`);
    }
  }

  protected onKey(path: SchemaPath, r: JsExpression, type: KeyType<any, any>): void {
    this.onNode([...path, type.key], r, type.val);
  }

  protected genEncoder(type: Type): CompiledBinaryEncoder {
    return MsgPackCodegen.get(type);
  }
}
