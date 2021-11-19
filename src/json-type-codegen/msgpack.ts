import type {MsgPack, Encoder} from '../json-pack';
import {encoder} from '../json-pack/util';
import {TArray, TBoolean, TNumber, TObject, TObjectField, TString, TType} from '../json-type/types/json';
import {JsExpression} from './util/JsExpression';

const join = (a: Uint8Array, b: Uint8Array): Uint8Array => {
  const res = new Uint8Array(a.length + b.length);
  res.set(a);
  res.set(b, a.length);
  return res;
};

export type EncoderFn = <T>(value: T) => MsgPack<T>;

class EncodingPlanStepWriteBlob {
  constructor(public arr: Uint8Array) {}
}

class EncodingPlanStepExecJs {
  constructor(public readonly js: string) {}
}

type EncodingPlanStep = EncodingPlanStepWriteBlob | EncodingPlanStepExecJs;

export class EncodingPlan {
  public steps: EncodingPlanStep[] = [];

  protected execJs(js: string) {
    this.steps.push(new EncodingPlanStepExecJs(js));
  }

  protected writeBlob(arr: Uint8Array): void {
    this.steps.push(new EncodingPlanStepWriteBlob(arr));
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

  protected normalizeTypes(type: TType | TType[]): TType[] {
    return Array.isArray(type) ? type : [type];
  }

  protected normalizeAccessor(accessor: string): string {
    if (/^[a-z_][a-z_0-9]*$/i.test(accessor)) {
      return '.' + accessor;
    } else {
      return `[${JSON.stringify(accessor)}]`;
    }
  }

  public onString(str: TString, value: JsExpression) {
    if (str.const) {
      this.writeBlob(encoder.encode(str.const));
      return;
    }
    this.execJs(/* js */ `e.encodeString(${value.use()});`);
  }

  public onNumber(num: TNumber, value: JsExpression) {
    if (num.const) {
      this.writeBlob(encoder.encode(num.const));
      return;
    }
    this.execJs(/* js */ `e.encodeNumber(${value.use()});`);
  }

  public onBoolean(bool: TBoolean, value: JsExpression) {
    if (bool.const) {
      this.writeBlob(encoder.encode(bool.const));
      return;
    }
    this.execJs(/* js */ `e.encodeBoolean(${value.use()});`);
  }

  public onNull() {
    this.execJs(/* js */ `e.encodeNull();`);
  }

  public onArray(arr: TArray, value: JsExpression) {
    if (arr.const) {
      this.genAndWriteBlob(encoder => encoder.encodeArray(arr.const!));
      return;
    }
    const types = this.normalizeTypes(arr.type);
    if (types.length !== 1) {
      this.execJs(/* js */ `e.encodeAny(${value.use()});`);
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
    this.onType(types[0], new JsExpression(() => `${rItem}`));
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
      const accessor = this.normalizeAccessor(field.key);
      const fieldSerialized = JSON.stringify(field.key);
      this.execJs(/* js */ `var ${rv} = ${r}${accessor};`);
      this.execJs(`if (${rv} !== undefined) {`);
      const type = this.normalizeTypes(field.type);
      if (type.length === 1) {
        this.genAndWriteBlob(encoder => encoder.encodeString(field.key));
        this.onType(type[0], new JsExpression(() => rv));
      } else {
        this.execJs(/* js */ `e.encodeAny(${rv});`);
      }
      this.execJs('}');
    }
  }

  public onObjectFixedLength(obj: TObject, value: JsExpression) {
    const length = obj.fields.length;
    this.genAndWriteBlob(encoder => encoder.encodeObjectHeader(length));
    const r = this.getRegister();
    // Assign this object expression to register, conditional on it being used in future steps.
    value.addListener(expr => {
      this.execJs(/* js */ `var ${r} = ${expr};`);
    });
    this.onRequiredFields(obj.fields, value, r);
  }

  protected onRequiredFields(requiredFields: TObjectField[], value: JsExpression, r: string) {
    const length = requiredFields.length;
    for (let i = 0; i < length; i++) {
      const field = requiredFields[i];
      this.genAndWriteBlob(encoder => encoder.encodeString(field.key));
      const types = this.normalizeTypes(field.type);
      if (types.length === 1) {
        const type = types[0];
        const accessor = this.normalizeAccessor(field.key);
        this.onType(type, value.chain(() => `${r}${accessor}`));
      } else {
        const accessor = this.normalizeAccessor(field.key);
        const expr = value.chain(() => `${r}${accessor}`).use();
        this.execJs(/* js */ `e.encodeAny(${expr});`);
      }
    }
  }

  public onBinary(value: JsExpression) {
    this.execJs(/* js */ `e.encodeBinary(${value.use()});`);
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
      // TODO: Ability to have unknown props. `object` TypeScript type...
      case 'obj': {
        this.onObject(type as TObject, value);
        break;
      }
      case 'bin': {
        this.onBinary(value);
        break;
      }
    }
  }

  public createPlan(type: TType): void {
    const r = this.getRegister();
    const value = new JsExpression(() => r);
    this.onType(type, value);
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

  private codegenBlob(step: EncodingPlanStepWriteBlob) {
    const lines: string[] = [];
    const ro = this.getRegister();
    const ru = this.getRegister();
    lines.push(/* js */ `var ${ro} = e.offset, ${ru} = e.uint8;`);
    lines.push(/* js */ `e.ensureCapacity(${step.arr.length});`);
    lines.push(/* js */ `e.offset += ${step.arr.length};`);
    for (let i = 0; i < step.arr.length; i++)
      lines.push(/* js */ `${ru}[${ro} + ${i}] = ${step.arr[i]};`);
    const js = lines.join('\n');
    return new EncodingPlanStepExecJs(js);
  }

  public codegen(): string {
    const stepsJoined: EncodingPlanStep[] = [];
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      if (step instanceof EncodingPlanStepExecJs) stepsJoined.push(step);
      else if (step instanceof EncodingPlanStepWriteBlob) {
        const last = stepsJoined[stepsJoined.length - 1];
        if (last instanceof EncodingPlanStepWriteBlob) last.arr = join(last.arr, step.arr);
        else stepsJoined.push(step);
      }
    }

    const execSteps: EncodingPlanStepExecJs[] = [];

    for (const step of stepsJoined) {
      if (step instanceof EncodingPlanStepExecJs) {
        execSteps.push(step);
      } else if (step instanceof EncodingPlanStepWriteBlob) {
        execSteps.push(this.codegenBlob(step));
      }
    }

    const js = /* js */ `(function(e){return function(r0){
e.reset();
${execSteps.map((step) => (step as EncodingPlanStepExecJs).js).join('\n')}
return e.flush();
};})`

    return js;
  }
}
