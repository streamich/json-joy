import type {MsgPack, Encoder} from '../json-pack';
import type {EncoderFull} from '../json-pack/EncoderFull';
import {encoder} from '../json-pack/util';
import {TArray, TBoolean, TNumber, TObject, TObjectField, TString, TType, TRef} from '../json-type/types';
import {JsExpression} from '../util/codegen/util/JsExpression';
import {normalizeAccessor} from '../util/codegen/util/normalizeAccessor';
import {Codegen, CompiledFunction, CodegenStepExecJs} from '../util/codegen';

const UINTS: TNumber['format'][] = ['u', 'u8', 'u16', 'u32', 'u64'];
const INTS: TNumber['format'][] = ['i', 'i8', 'i16', 'i32', 'i64', ...UINTS];

const join = (a: Uint8Array, b: Uint8Array): Uint8Array => {
  const res = new Uint8Array(a.length + b.length);
  res.set(a);
  res.set(b, a.length);
  return res;
};

export type EncoderFn = <T>(value: T) => MsgPack<T>;
export type PartialEncoderFn = <T>(value: T, encoder: EncoderFull) => void;

class WriteBlobStep {
  constructor(public arr: Uint8Array) {}
}

type Step = WriteBlobStep | CodegenStepExecJs;

export interface MsgPackSerializerCodegenOptions {
  encoder: EncoderFull;
  type: TType;
  ref?: (id: string) => PartialEncoderFn | TType | undefined;
}

export class MsgPackSerializerCodegen {
  protected codegen: Codegen<EncoderFn>;

  /** @ignore */
  protected options: Required<MsgPackSerializerCodegenOptions>;

  constructor(opts: MsgPackSerializerCodegenOptions) {
    this.options = {
      ref: (id: string) => undefined,
      ...opts,
    };
    this.codegen = new Codegen<EncoderFn>({
      name: 'toMsgPack',
      args: 'r0',
      prologue: 'e.reset();',
      epilogue: 'return e.flush();',
      processSteps: (steps) => {
        const stepsJoined: Step[] = [];
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          if (step instanceof CodegenStepExecJs) stepsJoined.push(step);
          else if (step instanceof WriteBlobStep) {
            const last = stepsJoined[stepsJoined.length - 1];
            if (last instanceof WriteBlobStep) last.arr = join(last.arr, step.arr);
            else stepsJoined.push(step);
          }
        }
        const execSteps: CodegenStepExecJs[] = [];
        for (const step of stepsJoined) {
          if (step instanceof CodegenStepExecJs) {
            execSteps.push(step);
          } else if (step instanceof WriteBlobStep) {
            execSteps.push(this.codegenBlob(step));
          }
        }
        return execSteps;
      },
    });
    this.codegen.linkDependency(this.options.encoder, 'e');
  }

  protected execJs(js: string): void {
    this.codegen.js(js);
  }

  protected writeBlob(arr: Uint8Array): void {
    this.codegen.step(new WriteBlobStep(arr));
  }

  protected getBlob(callback: (encoder: Encoder) => void): Uint8Array {
    encoder.reset();
    callback(encoder);
    return encoder.flush();
  }

  protected registerCounter = 0;

  protected getRegister(): string {
    return `r${this.registerCounter++}`;
  }

  protected genAndWriteBlob(callback: (encoder: Encoder) => void): void {
    this.writeBlob(this.getBlob(callback));
  }

  public onString(str: TString, value: JsExpression) {
    if (str.const !== undefined) {
      this.writeBlob(encoder.encode(str.const));
      return;
    }
    if (str.format === 'ascii') {
      this.execJs(/* js */ `e.encodeAsciiString(${value.use()});`);
      return;
    }
    this.execJs(/* js */ `e.encodeString(${value.use()});`);
  }

  public onNumber(num: TNumber, value: JsExpression) {
    if (num.const !== undefined) {
      this.writeBlob(encoder.encode(num.const));
      return;
    }
    const isInteger = INTS.indexOf(num.format) > -1;
    if (isInteger) {
      const isUnsignedInteger = UINTS.indexOf(num.format) > -1;
      if (isUnsignedInteger) {
        this.execJs(/* js */ `e.encodeUnsignedInteger(${value.use()});`);
      } else {
        this.execJs(/* js */ `e.encodeInteger(${value.use()});`);
      }
      return;
    }
    this.execJs(/* js */ `e.encodeNumber(${value.use()});`);
  }

  public onBoolean(bool: TBoolean, value: JsExpression) {
    if (bool.const !== undefined) {
      this.writeBlob(encoder.encode(bool.const));
      return;
    }
    this.execJs(/* js */ `e.encodeBoolean(${value.use()});`);
  }

  public onNull() {
    this.execJs(/* js */ `e.encodeNull();`);
  }

  public onArray(arr: TArray, value: JsExpression) {
    if (arr.const !== undefined) {
      this.genAndWriteBlob((encoder) => encoder.encodeArray(arr.const!));
      return;
    }
    const r = this.getRegister(); // array
    const rl = this.getRegister(); // array.length
    const ri = this.getRegister(); // index
    const rItem = this.getRegister(); // item
    this.execJs(/* js */ `var ${r} = ${value.use()}, ${rl} = ${r}.length, ${ri} = 0, ${rItem};`);
    this.execJs(/* js */ `e.encodeArrayHeader(${rl});`);
    this.execJs(/* js */ `for(; ${ri} < ${rl}; ${ri}++) ` + '{');
    this.execJs(/* js */ `${rItem} = ${r}[${ri}];`);
    this.onType(arr.type, new JsExpression(() => `${rItem}`));
    this.execJs(`}`);
  }

  public onObject(obj: TObject, value: JsExpression) {
    if (obj.unknownFields) {
      this.execJs(/* js */ `e.encodeObject(${value.use()});`);
      return;
    }
    let hasOptionalFields = false;
    for (let i = 0; i < obj.fields.length; i++) {
      if (obj.fields[i].isOptional) {
        hasOptionalFields = true;
        break;
      }
    }
    if (hasOptionalFields) this.onObjectVariableLength(obj, value);
    else this.onObjectFixedLength(obj, value);
  }

  public onObjectVariableLength(obj: TObject, value: JsExpression) {
    const requiredFields: TObjectField[] = [];
    const optionalFields: TObjectField[] = [];
    for (let i = 0; i < obj.fields.length; i++) {
      const field = obj.fields[i];
      if (field.isOptional) optionalFields.push(field);
      else requiredFields.push(field);
    }
    const r = this.getRegister();
    const rk = this.getRegister();
    const rv = this.getRegister();
    this.execJs(/* js */ `var ${r} = ${value.use()};`);
    this.execJs(/* js */ `var ${rk} = Object.keys(${r});`);
    this.execJs(/* js */ `e.encodeObjectHeader(${rk}.length);`);
    this.onRequiredFields(requiredFields, value, r);
    for (let i = 0; i < optionalFields.length; i++) {
      const field = optionalFields[i];
      const accessor = normalizeAccessor(field.key);
      this.execJs(/* js */ `var ${rv} = ${r}${accessor};`);
      this.execJs(`if (${rv} !== undefined) {`);
      this.genAndWriteBlob((encoder) => encoder.encodeString(field.key));
      this.onType(field.type, new JsExpression(() => rv));
      this.execJs('}');
    }
  }

  public onObjectFixedLength(obj: TObject, value: JsExpression) {
    const length = obj.fields.length;
    this.genAndWriteBlob((encoder) => encoder.encodeObjectHeader(length));
    const r = this.getRegister();
    // Assign this object expression to register, conditional on it being used in future steps.
    value.addListener((expr) => {
      this.execJs(/* js */ `var ${r} = ${expr};`);
    });
    this.onRequiredFields(obj.fields, value, r);
  }

  protected onRequiredFields(requiredFields: TObjectField[], value: JsExpression, r: string) {
    const length = requiredFields.length;
    for (let i = 0; i < length; i++) {
      const field = requiredFields[i];
      this.genAndWriteBlob((encoder) => encoder.encodeString(field.key));
      const accessor = normalizeAccessor(field.key);
      this.onType(
        field.type,
        value.chain(() => `${r}${accessor}`),
      );
    }
  }

  public onBinary(value: JsExpression) {
    this.execJs(/* js */ `e.encodeBinary(${value.use()});`);
  }

  public onRef(ref: TRef, value: JsExpression): void {
    const type = this.options.ref(ref.ref);
    switch (typeof type) {
      case 'function': {
        const d = this.codegen.linkDependency(type);
        this.execJs(/* js */ `${d}(${value.use()}, e);`);
        break;
      }
      case 'object': {
        this.onType(type as TType, value);
        break;
      }
      default:
        throw new Error(`Unknown [ref = ${ref.ref}].`);
    }
  }

  public onAny(value: JsExpression) {
    this.execJs(/* js */ `e.encodeAny(${value.use()});`);
  }

  public onType(type: TType, value: JsExpression): void {
    switch (type.__t) {
      case 'str': {
        this.onString(type as TString, value);
        break;
      }
      case 'num': {
        this.onNumber(type as TNumber, value);
        break;
      }
      case 'bool': {
        this.onBoolean(type as TBoolean, value);
        break;
      }
      case 'nil': {
        this.onNull();
        break;
      }
      case 'arr': {
        this.onArray(type as TArray, value);
        break;
      }
      case 'obj': {
        this.onObject(type as TObject, value);
        break;
      }
      case 'bin': {
        this.onBinary(value);
        break;
      }
      case 'ref': {
        this.onRef(type as TRef, value);
        break;
      }
      // case 'or':
      // case 'enum':
      // case 'any':
      default: {
        this.onAny(value);
        break;
      }
    }
  }

  // private codegenBlob(step: EncodingPlanStepWriteBlob) {
  //   const lines: string[] = [];
  //   for (let i = 0; i < step.arr.length;) {
  //     const octets = step.arr.length - i;
  //     if (octets >= 4) {
  //       const value = (step.arr[i] * 0x1000000) +  (step.arr[i + 1] * 0x10000) + (step.arr[i + 2] * 0x100) + step.arr[i + 3];
  //       lines.push(`e.u32(${value});`);
  //       i += 4;
  //     } else if (octets >= 2) {
  //       const value = (step.arr[i] * 0x100) + step.arr[i + 1];
  //       lines.push(`e.u16(${value});`);
  //       i += 2;
  //     } else {
  //       lines.push(`e.u8(${step.arr[i]});`);
  //       i++;
  //     }
  //   }
  //   const js = lines.join('\n');
  //   return new EncodingPlanStepExecJs(js);
  // }

  private codegenBlob(step: WriteBlobStep) {
    const lines: string[] = [];
    const ro = this.getRegister();
    const ru = this.getRegister();
    lines.push(/* js */ `var ${ro} = e.offset, ${ru} = e.uint8;`);
    lines.push(/* js */ `e.ensureCapacity(${step.arr.length});`);
    lines.push(/* js */ `e.offset += ${step.arr.length};`);
    for (let i = 0; i < step.arr.length; i++) lines.push(/* js */ `${ru}[${ro} + ${i}] = ${step.arr[i]};`);
    const js = lines.join('\n');
    return new CodegenStepExecJs(js);
  }

  public run(): this {
    const r = this.getRegister();
    const value = new JsExpression(() => r);
    this.onType(this.options.type, value);
    return this;
  }

  public generate(): CompiledFunction<EncoderFn> {
    return this.codegen.generate();
  }

  public compile(): EncoderFn {
    return this.codegen.compile();
  }

  public compilePartial(): PartialEncoderFn {
    return this.codegen.compile({
      name: 'partial',
      args: 'r0, e',
      epilogue: '',
      prologue: '',
    });
  }
}
