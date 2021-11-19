import type {Path} from '../json-pointer';
import {TArray, TBoolean, TNumber, TObject, TObjectField, TString, TType} from '../json-type/types/json';
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

  protected err(type: string, path: Path) {
    return JSON.stringify([type, ...path]);
  }

  protected onString(path: Path, str: TString, r: string) {
    this.js(/* js */ `var ${r} = ${r};`);
    if (str.const) {
      this.js(/* js */ `if(${r} !== "${JSON.stringify(str.const)}") return '${this.err('STR_CONST', path)}';`);
    } else {
      this.js(/* js */ `if(typeof ${r} !== "string") return '${this.err('STR', path)}';`);
    }
  }

  protected onNumber(path: Path, num: TNumber, r: string) {
    if (num.const) {
      this.js(/* js */ `if(${r} !== "${JSON.stringify(num.const)}") return '${this.err('NUM_CONST', path)}';`);
    } else {
      this.js(/* js */ `if(typeof ${r} !== "number") return '${this.err('NUM', path)}';`);
    }
  }

  protected onBoolean(path: Path, bool: TBoolean, r: string) {
    if (bool.const) {
      this.js(/* js */ `if(${r} !== "${JSON.stringify(bool.const)}") return '${this.err('BOOL_CONST', path)}';`);
    } else {
      this.js(/* js */ `if(typeof ${r} !== "boolean") return '${this.err('BOOL', path)}';`);
    }
  }

  protected onNull(path: Path, r: string) {
    this.js(/* js */ `if(typeof ${r} !== null) return '${this.err('NULL', path)}';`);
  }

  protected onArray(arr: TArray, r: string) {

  }

  protected onObject(path: Path, obj: TObject, expr: string) {
    const r = this.getRegister();
    this.js(/* js */ `var ${r} = ${expr};`);
    this.js(/* js */ `if (!${r} || typeof ${r} !== 'object') return '${this.err('OBJ', path)}';`);

    const requiredFields: TObjectField[] = [];
    const optionalFields: TObjectField[] = [];
    for (let i = 0; i < obj.fields.length; i++) {
      const field = obj.fields[i];
      if (field.isOptional) optionalFields.push(field);
      else requiredFields.push(field);
    }
    
    for (const requiredField of requiredFields) {
      const rv = this.getRegister();
      const accessor = this.normalizeAccessor(requiredField.key);
      const keyPath = [...path, requiredField.key];
      const types = this.normalizeTypes(requiredField.type);
      this.js(/* js */ `var ${rv} = ${r}${accessor};`);
      this.js(/* js */ `if (${rv} === undefined) return '${this.err('KEY', keyPath)}';`);
      this.onTypes(keyPath, types, rv);
    }

    for (const optionalField of optionalFields) {
      const rv = this.getRegister();
      const accessor = this.normalizeAccessor(optionalField.key);
      const keyPath = [...path, optionalField.key];
      const types = this.normalizeTypes(optionalField.type);
      this.js(/* js */ `var ${rv} = ${r}${accessor};`);
      this.js(`if (${rv} !== undefined) {`);
      this.onTypes(keyPath, types, rv);
      this.js(`}`);
    }
  }

  protected onBinary(expr: string) {
    
  }

  protected onTypes(path: Path, types: TType[], expr: string) {
    if (types.length === 1) {
      this.onType(path, types[0], expr);
      return;
    }
    this.onTypesRecursive(path, types, expr);
  }

  protected onTypesRecursive(path: Path, types: TType[], expr: string) {
    if (!types.length) {
      this.js(/* js */ `return ${this.err('OR', path)};`);
      return;
    }
    const type = types[0];
    const fn = new JsonTypeValidatorCodegen().codegen(type);
    this.js(`if (${fn}(${expr})) {`);
    this.onTypesRecursive(path, types.slice(1), expr);
    this.js(`}`);
  }

  protected onType(path: Path, type: TType, expr: string): void {
    switch (type.__t) {
      case 'str': {
        this.onString(path, type as TString, expr);
        break;
      }
      case 'num': {
        this.onNumber(path, type as TNumber, expr);
        break;
      }
      case 'bool': {
        this.onBoolean(path, type as TBoolean, expr);
        break;
      }
      case 'nil': {
        this.onNull(path, expr);
        break;
      }
      case 'arr': {
        this.onArray(type as TArray, expr);
        break;
      }
      // TODO: Ability to have unknown props. `object` TypeScript type...
      case 'obj': {
        this.onObject(path, type as TObject, expr);
        break;
      }
      case 'bin': {
        this.onBinary(expr);
        break;
      }
    }
  }

  public codegen(type: TType): JavaScript<JsonTypeValidator> {
    this.onType([], type, 'r0');

    const js = /* js */ `(function(r0){
${this.steps.map((step) => (step as EncodingPlanStepExecJs).js).join('\n')}
return '';
})`
      
    return js as JavaScript<JsonTypeValidator>;
  }
}
