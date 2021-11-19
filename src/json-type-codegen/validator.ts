import type {Path} from '../json-pointer';
import {TArray, TBoolean, TNumber, TObject, TString, TType} from '../json-type/types/json';
import {JavaScript} from '../util/codegen';
import {JsExpression} from './util/JsExpression';

export type JsonTypeValidator = (value: unknown) => string;

class EncodingPlanStepExecJs {
  constructor(public readonly js: string) {}
}

export class JsonTypeValidatorCodegen {
  public steps: EncodingPlanStepExecJs[] = [];

  protected js(js: string) {
    this.steps.push(new EncodingPlanStepExecJs(js));
  }

  protected registerCounter = 0;

  protected getRegister(): string {
    return `r${++this.registerCounter}`;
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

  protected onString(path: Path, str: TString, value: JsExpression) {
    const r = this.getRegister();
    const pathStr = JSON.stringify(path);
    this.js(/* js */ `var ${r} = ${value.use()};`);
    if (str.const) {
      this.js(/* js */ `if(${r} !== "${JSON.stringify(str.const)}") return '["STR_CONST",${pathStr}]';`);
    } else {
      this.js(/* js */ `if(typeof ${r} !== "string") return '["STR",${pathStr}]';`);
    }
  }

  protected onNumber(path: Path, num: TNumber, value: JsExpression) {
    const r = this.getRegister();
    const pathStr = JSON.stringify(path);
    this.js(/* js */ `var ${r} = ${value.use()};`);
    if (num.const) {
      this.js(/* js */ `if(${r} !== "${JSON.stringify(num.const)}") return '["NUM_CONST",${pathStr}]';`);
    } else {
      this.js(/* js */ `if(typeof ${r} !== "number") return '["NUM",${pathStr}]';`);
    }
  }

  protected onBoolean(path: Path, bool: TBoolean, value: JsExpression) {
    const r = this.getRegister();
    const pathStr = JSON.stringify(path);
    this.js(/* js */ `var ${r} = ${value.use()};`);
    if (bool.const) {
      this.js(/* js */ `if(${r} !== "${JSON.stringify(bool.const)}") return '["BOOL_CONST",${pathStr}]';`);
    } else {
      this.js(/* js */ `if(typeof ${r} !== "boolean") return '["BOOL",${pathStr}]';`);
    }
  }

  protected onNull() {
    
  }

  protected onArray(arr: TArray, value: JsExpression) {

  }

  protected onObject(obj: TObject, value: JsExpression) {

  }

  protected onBinary(value: JsExpression) {
    
  }

  protected onType(type: TType, value: JsExpression): void {
    switch (type.__t) {
      case 'str': {
        this.onString([], type as TString, value);
        break;
      }
      case 'num': {
        this.onNumber([], type as TNumber, value);
        break;
      }
      case 'bool': {
        this.onBoolean([], type as TBoolean, value);
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

  public codegen(type: TType): JavaScript<JsonTypeValidator> {
    this.onType(type, new JsExpression(() => 'r0'));

    const js = /* js */ `(function(r0){
${this.steps.map((step) => (step as EncodingPlanStepExecJs).js).join('\n')}
return '';
})`
      
    return js as JavaScript<JsonTypeValidator>;
  }
}
