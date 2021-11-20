import {TArray, TBoolean, TNumber, TObject, TString, TType} from '../json-type/types/json';
import {JavaScript} from '../util/codegen';

export type JsonTypeValidator = (value: unknown) => string;

type Path = Array<string | number | {js: string}>;

class EncodingPlanStepExecJs {
  constructor(public readonly js: string) {}
}

const isPrimitiveType = (type: string): boolean => {
  switch (type) {
    case 'bool':
    case 'num':
    case 'str':
    case 'nil':
      return true;
    default: return false;
  }
};

export interface JsonTypeValidatorCodegenOptions {
  detailedErrors?: boolean;
}

export class JsonTypeValidatorCodegen {
  public steps: EncodingPlanStepExecJs[] = [];

  constructor(protected readonly options: JsonTypeValidatorCodegenOptions = {}) {}

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
    if (!this.options.detailedErrors) return 'true';
    let json = '[' + JSON.stringify(type);
    for (const step of path) {
      if (typeof step === 'object') {
        json += step.js;
      } else {
        json += ',' + JSON.stringify(step);
      }
    }
    return "'" + json + "]'";
  }

  protected onString(path: Path, str: TString, r: string) {
    if (str.const) {
      this.js(/* js */ `if(${r} !== "${JSON.stringify(str.const)}") return ${this.err('STR_CONST', path)};`);
    } else {
      this.js(/* js */ `if(typeof ${r} !== "string") return ${this.err('STR', path)};`);
    }
  }

  protected onNumber(path: Path, num: TNumber, r: string) {
    if (num.const) {
      this.js(/* js */ `if(${r} !== "${JSON.stringify(num.const)}") return ${this.err('NUM_CONST', path)};`);
    } else {
      this.js(/* js */ `if(typeof ${r} !== "number") return ${this.err('NUM', path)};`);
    }
  }

  protected onBoolean(path: Path, bool: TBoolean, r: string) {
    if (bool.const) {
      this.js(/* js */ `if(${r} !== "${JSON.stringify(bool.const)}") return ${this.err('BOOL_CONST', path)};`);
    } else {
      this.js(/* js */ `if(typeof ${r} !== "boolean") return ${this.err('BOOL', path)};`);
    }
  }

  protected onNull(path: Path, r: string) {
    this.js(/* js */ `if(typeof ${r} !== null) return ${this.err('NULL', path)};`);
  }

  protected onArray(path: Path, arr: TArray, expr: string) {
    const r = this.getRegister();
    const ri = this.getRegister();
    const rv = this.getRegister();
    this.js(/* js */ `var ${r} = ${expr};`);
    this.js(/* js */ `if (!(${r} instanceof Array)) return ${this.err('ARR', path)};`);
    this.js(`for (var ${rv}, ${ri} = ${r}.length; ${ri}-- !== 0;) {`);
    this.js(`${rv} = ${r}[${ri}];`);
    this.onTypes([...path, {js: `,' + ${ri} + '`}], this.normalizeTypes(arr.type), rv);
    this.js(`}`);
  }

  protected onObject(path: Path, obj: TObject, expr: string) {
    const r = this.getRegister();
    this.js(/* js */ `var ${r} = ${expr};`);
    this.js(/* js */ `if (!${r} || typeof ${r} !== 'object' || Array.isArray(${r})) return ${this.err('OBJ', path)};`);
    if (!obj.unknownFields) {
      const rk = this.getRegister();
      const keys = obj.fields.map(field => field.key);
      this.js(`for (var ${rk} in ${r}) {`);
      this.js(`if (${keys.map(key => `(${rk} !== ${JSON.stringify(key)})`).join('&&')}) return ${this.err('EXTRA_KEY', [...path, {js: `,' + ${rk} + '`}])};`);
      this.js(`}`);
    }
    for (let i = 0; i < obj.fields.length; i++) {
      const field = obj.fields[i];
      const rv = this.getRegister();
      const accessor = this.normalizeAccessor(field.key);
      const keyPath = [...path, field.key];
      const types = this.normalizeTypes(field.type);
      if (field.isOptional) {
        this.js(/* js */ `var ${rv} = ${r}${accessor};`);
        this.js(`if (${rv} !== undefined) {`);
        this.onTypes(keyPath, types, rv);
        this.js(`}`);
      } else {
        if (types.length === 1 && isPrimitiveType(types[0].__t)) {
          this.onTypes(keyPath, types, `${r}${accessor}`);
        } else {
          this.js(/* js */ `var ${rv} = ${r}${accessor};`);
          this.js(/* js */ `if (${rv} === undefined) return ${this.err('KEY', keyPath)};`);
          this.onTypes(keyPath, types, rv);
        }
      }
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
        this.onArray(path, type as TArray, expr);
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
return ${this.options.detailedErrors ? '""' : 'false'};
})`
      
    return js as JavaScript<JsonTypeValidator>;
  }
}
