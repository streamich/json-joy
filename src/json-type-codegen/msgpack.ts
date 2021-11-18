import type {MsgPack, Encoder} from '../json-pack';
import {encoder} from '../json-pack/util';
import {TArray, TBoolean, TNumber, TObject, TString, TType} from '../json-type/types/json';
import {JsExpression} from './util/JsExpressionMonad';

export type EncoderFn = <T>(value: T) => MsgPack<T>;

class EncodingPlanStepWriteBlob {
  constructor(public readonly arr: Uint8Array) {}
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
    if (/^[a-z_][a-z0-9_]*$/i.test(accessor)) {
      return '.' + accessor;
    } else {
      return `[${JSON.stringify(accessor)}]`;
    }
  }

  public onString(str: TString, value: JsExpression) {
    if (str.const) {
      const uint8Array = encoder.encode(str.const);
      this.writeBlob(uint8Array);
      return;
    }
    this.execJs(/* js */ `e.encodeString(${value.use()});`);
  }

  public onNumber(num: TNumber, value: JsExpression) {
    if (num.const) {
      const uint8Array = encoder.encode(num.const);
      this.writeBlob(uint8Array);
      return;
    }
    this.execJs(/* js */ `e.encodeNumber(${value.use()});`);
  }

  public onBoolean(bool: TBoolean, value: JsExpression) {
    if (bool.const) {
      const uint8Array = encoder.encode(bool.const);
      this.writeBlob(uint8Array);
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
    const length = obj.fields.length;

    // Write object header.
    this.genAndWriteBlob(encoder => encoder.encodeObjectHeader(length));

    // Assign this object expression to register, conditional on it being used in future steps.
    const r = this.getRegister();
    value.addListener(expr => {
      this.execJs(/* js */ `var ${r} = ${expr};`);
    });

    for (let i = 0; i < length; i++) {
      const field = obj.fields[i];
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
    }
  }

  public createPlan(type: TType): void {
    const r = this.getRegister();
    const value = new JsExpression(() => r);

    this.onType(type, value);

    const execSteps: EncodingPlanStepExecJs[] = [];

    for (const step of this.steps) {
      if (step instanceof EncodingPlanStepExecJs) {
        execSteps.push(step);
      } else if (step instanceof EncodingPlanStepWriteBlob) {
        const arr: number[] = [];
        for (let i = 0; i < step.arr.length; i++) {
          arr.push(step.arr[i]);
        }
        const js = arr.map(octet => `e.u8(${octet});`).join('\n');
        execSteps.push(new EncodingPlanStepExecJs(js));
      }

    }

    const js = /* js */ `(function(e){return function(${r}){
${execSteps.map((step) => (step as EncodingPlanStepExecJs).js).join('\n')}
};})`

    console.log(js);
  }
}
