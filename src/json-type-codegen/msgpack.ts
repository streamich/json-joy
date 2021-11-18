// import type {Encoder} from '../../json-pack/Encoder';
import type {MsgPack, Encoder} from '../json-pack';
import {encoder} from '../json-pack/util';
import {TNumber, TObject, TString, TType} from '../json-type/types/json';
import {CompiledFunction, JavaScriptWithDependencies} from '../util/codegen';
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

  public onString(str: TString, value: JsExpression) {
    if (str.const) {
      const uint8Array = encoder.encode(str.const);
      this.writeBlob(uint8Array);
      return;
    }
    this.execJs(/* js */ `
      e.encodeString(${value.use()});
    `);
  }

  public onNumber(num: TNumber) {
    if (num.const) {
      const uint8Array = encoder.encode(num.const);
      this.writeBlob(uint8Array);
      return;
    }
    this.execJs(/* js */ `
      e.encodeNumber(cur);
    `);
  }

  public onObject(obj: TObject, value: JsExpression) {
    // const keys = obj.fields.map((field) => field.key);
    const length = obj.fields.length;

    const objHeaderBlob = this.getBlob(encoder => encoder.encodeObjectHeader(length));
    this.writeBlob(objHeaderBlob);

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
        this.onType(type, value.chain(() => `${r}[${JSON.stringify(field.key)}]`));
      } else {
        // Encode any...
      }
    }
  }

  public onType(type: TType, value: JsExpression) {
    switch (type.__t) {
      case 'str': {
        this.onString(type as TString, value);
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

    const js = /* js */ `(function(e){
  return function(${r}){
    ${execSteps.map((step) => (step as EncodingPlanStepExecJs).js).join('\n')}
  };
})`

    console.log(js);
  }
}
