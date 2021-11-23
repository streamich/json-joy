import type {MsgPack, Encoder} from '../json-pack';
import {TArray, TBoolean, TNumber, TObject, TObjectField, TString, TType, TRef} from '../json-type/types';
import {JsExpression} from './util/JsExpression';

export type EncoderFn = <T>(value: T) => MsgPack<T>;

class JsonSerializerStepWriteText {
  constructor(public str: string) {}
}

class JsonSerializerStepExecJs {
  constructor(public readonly js: string) {}
}

type JsonSerializerStep = JsonSerializerStepWriteText | JsonSerializerStepExecJs;

export interface JsonSerializerCodegenOptions {
  ref?: (id: string) => TType | undefined;
}

export class JsonSerializerCodegen {
  public steps: JsonSerializerStep[] = [];

  /** @ignore */
  protected options: Required<JsonSerializerCodegenOptions>;

  constructor(opts: JsonSerializerCodegenOptions = {}) {
    this.options = {
      ref: (id: string) => undefined,
      ...opts,
    };
  }

  protected js(js: string) {
    this.steps.push(new JsonSerializerStepExecJs(js));
  }

  protected writeText(str: string): void {
    this.steps.push(new JsonSerializerStepWriteText(str));
  }

  protected registerCounter = 0;

  protected getRegister(): string {
    return `r${this.registerCounter++}`;
  }

  public onString(str: TString, value: JsExpression) {
    if (str.const !== undefined) {
      this.writeText(JSON.stringify(str.const));
      return;
    }
    this.js(/* js */ `s += asString(${value.use()});`);
  }

  public onNumber(num: TNumber, value: JsExpression) {
    if (num.const !== undefined) {
      this.writeText(JSON.stringify(num.const));
      return;
    }
    this.js(/* js */ `s += js(${value.use()});`);
  }

  public onBoolean(bool: TBoolean, value: JsExpression) {
    if (bool.const !== undefined) {
      this.writeText(JSON.stringify(bool.const));
      return;
    }
    this.js(/* js */ `s += ${value.use()} ? 'true' : 'false';`);
  }

  public onNull() {
    this.writeText('null');
  }

  public onArray(arr: TArray, value: JsExpression) {
    if (arr.const !== undefined) {
      this.writeText(JSON.stringify(arr.const));
      return;
    }
    this.writeText('[');
    this.writeText(']');
    const r = this.getRegister(); // array
    const rl = this.getRegister(); // array.length
    const ri = this.getRegister(); // index
    const rItem = this.getRegister(); // item
    this.js(/* js */ `var ${r} = ${value.use()}, ${rl} = ${r}.length, ${ri} = 0, ${rItem};`);
    this.js(/* js */ `for(; ${ri} < ${rl}; ${ri}++) ` + '{');
    this.js(/* js */ `${rItem} = ${r}[${ri}];`);
    this.onType(arr.type, new JsExpression(() => `${rItem}`));
    this.js(`}`)
  }

  public onObject(obj: TObject, value: JsExpression) {
    if (obj.unknownFields) {
      this.js(/* js */ `s += c0(${value.use()});`);
      return;
    }
    this.writeText('{');

    this.writeText('}');
  }

  public onBinary(value: JsExpression) {
    this.js(/* js */ `e.encodeBinary(${value.use()});`);
  }

  public onRef(ref: TRef, value: JsExpression): void {
    const type = this.options.ref(ref.ref);
    if (type === undefined) {
      throw new Error(`Unknown [ref = ${ref.ref}].`);
    }
    this.onType(type, value);
  }

  public onAny(value: JsExpression) {
    this.js(/* js */ `e.encodeAny(${value.use()});`);
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

  public createPlan(type: TType): void {
    const r = this.getRegister();
    const value = new JsExpression(() => r);
    this.onType(type, value);
  }

  public codegen(): string {
    const stepsJoined: JsonSerializerStep[] = [];
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      if (step instanceof JsonSerializerStepExecJs) stepsJoined.push(step);
      else if (step instanceof JsonSerializerStepWriteText) {
        const last = stepsJoined[stepsJoined.length - 1];
        if (last instanceof JsonSerializerStepWriteText) last.str += step.str;
        else stepsJoined.push(step);
      }
    }
    const execSteps: JsonSerializerStepExecJs[] = [];
    for (const step of stepsJoined) {
      if (step instanceof JsonSerializerStepExecJs) {
        execSteps.push(step);
      } else if (step instanceof JsonSerializerStepWriteText) {
        const js = /* js */ `s += ${JSON.stringify(step.str)};`;
        execSteps.push(new JsonSerializerStepExecJs(js));
      }
    }

    const js = /* js */ `(function(asString){
var js = JSON.serialize;
return function(r0){
var s = '';
${execSteps.map((step) => (step as JsonSerializerStepExecJs).js).join('\n')}
return e.flush();
}})`

    return js;
  }
}
