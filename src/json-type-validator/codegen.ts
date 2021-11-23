import type {JsonTypeValidator} from './types';
import type {TType, TArray, TBoolean, TNumber, TObject, TString, TRef, TOr, TEnum} from '../json-type/types';
import {CompiledFunction, compileFn} from '../util/codegen';
import {BooleanValidator, CustomValidator, CustomValidatorType, ObjectValidator, StringValidator} from '.';
import {$$deepEqual} from '../json-equal/$$deepEqual';
import {normalizeAccessor} from '../util/codegen/util/normalizeAccessor';

type Path = Array<string | number | {r: string}>;

class EncodingPlanStepExecJs {
  constructor(public readonly js: string) {}
}

const canSkipObjectKeyUndefinedCheck = (type: string): boolean => {
  switch (type) {
    case 'bool':
    case 'num':
    case 'str':
    case 'nil':
    case 'obj':
    case 'arr':
    case 'bin':
      return true;
    default: return false;
  }
};

/**
 * List of validation error codes.
 */
export enum JsonTypeValidatorError {
  STR = 0,
  STR_CONST,
  NUM,
  NUM_CONST,
  BOOL,
  BOOL_CONST,
  NIL,
  ARR,
  OBJ,
  KEY,
  KEYS,
  BIN,
  OR,
  REF,
  ENUM,
  VALIDATION,
}

/**
 * List of human-readable error messages by error code.
 */
export const JsonTypeValidatorErrorMessage = {
  [JsonTypeValidatorError.STR]: 'Not a string.',
  [JsonTypeValidatorError.STR_CONST]: 'Invalid string constant.',
  [JsonTypeValidatorError.NUM]: 'Not a number.',
  [JsonTypeValidatorError.NUM_CONST]: 'Invalid number constant.',
  [JsonTypeValidatorError.BOOL]: 'Not a boolean.',
  [JsonTypeValidatorError.BOOL_CONST]: 'Invalid boolean constant.',
  [JsonTypeValidatorError.NIL]: 'Not null.',
  [JsonTypeValidatorError.ARR]: 'Not an array.',
  [JsonTypeValidatorError.OBJ]: 'Not an object.',
  [JsonTypeValidatorError.KEY]: 'Missing key.',
  [JsonTypeValidatorError.KEYS]: 'Too many or missing object keys.',
  [JsonTypeValidatorError.BIN]: 'Not a binary.',
  [JsonTypeValidatorError.OR]: 'None of types matched.',
  [JsonTypeValidatorError.REF]: 'Validation error in referenced type.',
  [JsonTypeValidatorError.ENUM]: 'Not an enum value.',
  [JsonTypeValidatorError.VALIDATION]: 'Custom validator failed.',
}

/**
 * {@link JsonTypeValidatorCodegen} configuration options.
 */
export interface JsonTypeValidatorCodegenOptions {
  /**
   * Specifies how errors should be reported. The validator always returns a truthy
   * value on error, and falsy value on success. Depending on the value of this
   * option, the validator will either return boolean, string, or object on error.
   *
   * - `"boolean"`: The validator will return `true` on error, and `false` on success.
   * - `"string"`: The validator will return a string on error, and empty string `""`
   *   on success. The error string contains error code and path where error happened
   *   serialized as JSON.
   * - `"object"`: The validator will return an object on error, and `null` on success. The
   *   error object contains error code and path where error happened as well as human readable
   *   description of the error.
   *
   * Use `"boolean"` for best performance.
   */
  errorReporting?: 'boolean' | 'string' | 'object';

  /**
   * When an object type does not have "extraFields" set to true, the validator
   * will check that there are not excess fields besides those explicitly
   * defined. This settings removes this check.
   *
   * It may be useful when validating incoming data in RPC request as extra fields
   * would not hurt, but removing this check may improve performance. In one
   * micro-benchmark, this setting improves performance 5x. See json-type/validator.js benchmark.
   */
  skipObjectExtraFieldsCheck?: boolean;

  /**
   * In unsafe mode the validator will skip some checks which may result in
   * error being thrown. When running validators in unsafe mode, it is assumed
   * that the code is wrapped in a try-catch block. Micro-benchmarks DO NOT show
   * that this setting improves performance much.
   */
  unsafeMode?: boolean;

  /**
   * Get validator for a "ref" type.
   */
  ref?: (id: string) => JsonTypeValidator | undefined;

  /**
   * User-defined custom validators.
   */
  customValidators?: CustomValidator[];
}

export class JsonTypeValidatorCodegen {
  /** @ignore */
  protected steps: EncodingPlanStepExecJs[] = [];

  /** @ignore */
  protected options: Required<JsonTypeValidatorCodegenOptions>;

  /**
   * @ignore
   * Type for which validator is being generated.
   */
  protected type!: TType;

  constructor(options: JsonTypeValidatorCodegenOptions = {}) {
    this.options = {
      errorReporting: 'boolean',
      skipObjectExtraFieldsCheck: false,
      unsafeMode: false,
      ref: () => undefined,
      customValidators: [],
      ...options,
    };
  }

  /** @ignore */
  protected js(js: string) {
    this.steps.push(new EncodingPlanStepExecJs(js));
  }

  /** @ignore */
  protected registerCounter = 0;

  /** @ignore */
  protected getRegister(): string {
    return `r${++this.registerCounter}`;
  }

  /** @ignore */
  protected dependencies: unknown[] = [];

  /** @ignore */
  protected addDependencies(deps: unknown[]): string[] {
    let symbols: string [] = [];
    for (const dep of deps) {
      this.dependencies.push(dep);
      symbols.push(`d${this.dependencies.length - 1}`);
    }
    return symbols;
  }

  /** @ignore */
  protected consts: string[] = [];

  /** @ignore */
  protected addConsts(consts: string[]): string[] {
    let symbols: string [] = [];
    for (const const_ of consts) {
      this.consts.push(const_);
      symbols.push(`c${this.consts.length - 1}`);
    }
    return symbols;
  }

  /** @ignore */
  protected err(code: JsonTypeValidatorError, path: Path, opts: {refError?: string; validator?: string} = {}): string {
    switch (this.options.errorReporting) {
      case 'boolean': return 'true';
      case 'string': {
        let out = "'[" + JSON.stringify(JsonTypeValidatorError[code]);
        for (const step of path) {
          if (typeof step === 'object') {
            out += ",' + JSON.stringify(" + step.r + ") + '";
          } else {
            out += ',' + JSON.stringify(step);
          }
        }
        return out + "]'";
      }
      case 'object':
      default: {
        let out = '{code: ' + JSON.stringify(JsonTypeValidatorError[code]) + ', errno: ' + JSON.stringify(code) + ', message: ' + JSON.stringify(JsonTypeValidatorErrorMessage[code]) + ', path: [';
        let i = 0;
        for (const step of path) {
          if (i) out += ', ';
          if (typeof step === 'object') {
            out += step.r;
          } else {
            out += JSON.stringify(step);
          }
          i++;
        }
        out += ']';
        if (this.type.id) {
          out += ', type: ' + JSON.stringify(this.type.id || '');
        }
        if (opts.refError) {
          out += ', ref: ' + opts.refError;
        }
        if (opts.validator) {
          out += ', validator: ' + JSON.stringify(opts.validator);
        }
        return out + '}';
      }
    }
  }

  /** @ignore */
  protected refErr(path: Path, r: string): string {
    switch (this.options.errorReporting) {
      case 'boolean': return r;
      case 'string': {
        return this.err(JsonTypeValidatorError.REF, [...path, {r}]);
      }
      case 'object':
      default: {
        return this.err(JsonTypeValidatorError.REF, [...path], {refError: r});
      }
    }
  }

  /** @ignore */
  protected emitValidations(path: Path, validatorNames: string[], type: CustomValidatorType, r: string): void {
    for (const validatorName of validatorNames) {
      const v = this.linkValidator(validatorName, type);
      const rerr = this.getRegister();
      const rc = this.getRegister();
      const err = this.err(JsonTypeValidatorError.VALIDATION, path, {validator: validatorName, refError: rerr});
      const errInCatch = this.err(JsonTypeValidatorError.VALIDATION, path, {validator: validatorName, refError: rc});
      this.js(`try {`);
      this.js(/* js */ `const ${rerr} = ${v}(${r});`);
      this.js(/* js */ `if (${rerr}) return ${err};`);
      this.js(`} catch (e) {`);
      this.js(/* js */ `var ${rc} = e ? e : new Error('Validator ${JSON.stringify(validatorName)} failed.');`);
      this.js(/* js */ `return ${errInCatch};`);
      this.js(`}`);
    }
  }

  /** @ignore */
  protected linkValidator(name: string, type: CustomValidatorType): string {
    for (const validator of this.options.customValidators) {
      if (name !== validator.name) continue;
      if (validator.types.indexOf(type) === -1) continue;
      return this.addDependencies([validator.fn])[0];
    }
    throw new Error(`Custom validator "${name}" not found.`);
  }

  /** @ignore */
  protected onString(path: Path, str: TString, r: string) {
    if (str.const !== undefined) {
      const error = this.err(JsonTypeValidatorError.STR_CONST, path);
      this.js(/* js */ `if(${r} !== ${JSON.stringify(str.const)}) return ${error};`);
    } else {
      const error = this.err(JsonTypeValidatorError.STR, path);
      this.js(/* js */ `if(typeof ${r} !== "string") return ${error};`);
    }
    if (str.validator) {
      this.emitValidations(path, str.validator instanceof Array ? str.validator : [str.validator], 'string', r);
    }
  }

  /** @ignore */
  protected onNumber(path: Path, num: TNumber, r: string) {
    if (num.const !== undefined) {
      const err = this.err(JsonTypeValidatorError.NUM_CONST, path);
      this.js(/* js */ `if(${r} !== ${JSON.stringify(num.const)}) return ${err};`);
    } else {
      const err = this.err(JsonTypeValidatorError.NUM, path);
      this.js(/* js */ `if(typeof ${r} !== "number") return ${err};`);
    }
  }

  /** @ignore */
  protected onBoolean(path: Path, bool: TBoolean, r: string) {
    if (bool.const !== undefined) {
      const err = this.err(JsonTypeValidatorError.BOOL_CONST, path);
      this.js(/* js */ `if(${r} !== ${bool.const ? 'true' : 'false'}) return ${err};`);
    } else {
      const err = this.err(JsonTypeValidatorError.BOOL, path);
      this.js(/* js */ `if(typeof ${r} !== "boolean") return ${err};`);
    }
  }

  /** @ignore */
  protected onNull(path: Path, r: string) {
    const err = this.err(JsonTypeValidatorError.NIL, path);
    this.js(/* js */ `if(${r} !== null) return ${err};`);
  }

  /** @ignore */
  protected onArray(path: Path, arr: TArray, expr: string) {
    const r = this.getRegister();
    const ri = this.getRegister();
    const rv = this.getRegister();
    this.js(/* js */ `var ${r} = ${expr};`);
    const err = this.err(JsonTypeValidatorError.ARR, path);
    this.js(/* js */ `if (!(${r} instanceof Array)) return ${err};`);
    this.js(`for (var ${rv}, ${ri} = ${r}.length; ${ri}-- !== 0;) {`);
    this.js(`${rv} = ${r}[${ri}];`);
    this.onType([...path, {r: ri}], arr.type, rv);
    this.js(`}`);
  }

  /** @ignore */
  protected onObject(path: Path, obj: TObject, expr: string) {
    const r = this.getRegister();
    this.js(/* js */ `var ${r} = ${expr};`);
    const canSkipObjectTypeCheck = this.options.unsafeMode && (obj.fields.length > 0);
    if (!canSkipObjectTypeCheck) {
      const err = this.err(JsonTypeValidatorError.OBJ, path);
      this.js(/* js */ `if (typeof ${r} !== 'object' || !${r} || (${r} instanceof Array)) return ${err};`);
    }
    if (obj.fields.length && !obj.unknownFields && !this.options.skipObjectExtraFieldsCheck) {
      const rk = this.getRegister();
      this.js(`for (var ${rk} in ${r}) {`);
      this.js(`switch (${rk}) { case ${obj.fields.map(field => JSON.stringify(field.key)).join(": case ")}: break; default: return ${this.err(JsonTypeValidatorError.KEYS, [...path, {r: rk}])};}`);
      this.js(`}`);
    }
    for (let i = 0; i < obj.fields.length; i++) {
      const field = obj.fields[i];
      const rv = this.getRegister();
      const accessor = normalizeAccessor(field.key);
      const keyPath = [...path, field.key];
      if (field.isOptional) {
        this.js(/* js */ `var ${rv} = ${r}${accessor};`);
        this.js(`if (${rv} !== undefined) {`);
        this.onType(keyPath, field.type, rv);
        this.js(`}`);
      } else {
        if (canSkipObjectKeyUndefinedCheck(field.type.__t)) {
          this.onType(keyPath, field.type, `${r}${accessor}`);
        } else {
          this.js(/* js */ `var ${rv} = ${r}${accessor};`);
          const err = this.err(JsonTypeValidatorError.KEY, [...path, field.key]);
          this.js(/* js */ `if (${rv} === undefined) return ${err};`);
          this.onType(keyPath, field.type, rv);
        }
      }
    }
  }

  /** @ignore */
  protected onBinary(path: Path, expr: string) {
    const hasBuffer = typeof Buffer === 'function';
    const r = this.getRegister();
    this.js(/* js */ `var ${r} = ${expr};`);
    const err = this.err(JsonTypeValidatorError.BIN, path);
    this.js(/* js */ `if(!(${r} instanceof Uint8Array)${hasBuffer ? /* js */ ` && !Buffer.isBuffer(${r})` : ''}) return ${err};`);
  }

  /** @ignore */
  protected onRef(path: Path, ref: TRef, expr: string) {
    const validator = this.options.ref(ref.ref);
    if (!validator) {
      throw new Error(`Could not resolve validator for [ref = ${ref.ref}]. Provide it through .ref option.`);
    }
    const [d] = this.addDependencies([validator]);
    const rerr = this.getRegister();
    this.js(/* js */ `var ${rerr} = ${d}(${expr});`);
    this.js(/* js */ `if (${rerr}) return ${this.refErr(path, rerr)};`);
  }

  /** @ignore */
  protected onOr(path: Path, or: TOr, expr: string) {
    if (or.types.length === 1) {
      this.onType(path, or.types[0], expr);
      return;
    }
    const consts = this.addConsts(or.types.map((type) => {
      const codegen = new JsonTypeValidatorCodegen({...this.options, errorReporting: 'boolean'});
      const fn = codegen.generate(type);
      const symbols = this.addDependencies(fn.deps);
      return `((${fn.js})(${symbols.join(', ')}))`;
    })).map(c => `${c}(${expr})`);
    const err = this.err(JsonTypeValidatorError.OR, path);
    this.js(`if (${consts.join(' && ')}) return ${err}`);
  }

  protected onEnum(path: Path, type: TEnum, r: string) {
    if (!type.values.length) throw new Error('Enum values are not specified.');
    const equals = type.values.map(value => $$deepEqual(value));
    const consts = this.addConsts(equals);
    const exprs = consts.map(c => `!${c}(${r})`);
    this.js(`if (${exprs.join(' && ')}) return ${this.err(JsonTypeValidatorError.ENUM, path)}`);
  }

  /** @ignore */
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
      case 'obj': {
        this.onObject(path, type as TObject, expr);
        break;
      }
      case 'bin': {
        this.onBinary(path, expr);
        break;
      }
      case 'any': {
        // Nothing to validate...
        break;
      }
      case 'ref': {
        this.onRef(path, type as TRef, expr);
        break;
      }
      case 'or': {
        this.onOr(path, type as TOr, expr);
        break;
      }
      case 'enum': {
        this.onEnum(path, type as TEnum, expr);
        break;
      }
      default: {
        throw new Error(`Unknown node type [__t = ${type.__t}].`);
      }
    }
  }

  public generate(type: TType): CompiledFunction<JsonTypeValidator> {
    this.type = type;
    this.onType([], type, 'r0');
    const successResult = this.options.errorReporting === 'boolean'
      ? 'false'
      : this.options.errorReporting === 'string'
        ? "''"
        : 'null';

    const dependencyArgs = this.dependencies.map((_, index) => `d${index}`).join(', ');

    const js = /* js */ `(function(${dependencyArgs}){
${this.consts.map((value, index) => `var c${index} = (${value});`).join('\n')}
return function(r0){
${this.steps.map((step) => (step as EncodingPlanStepExecJs).js).join('\n')}
return ${successResult};
}})`

// IF YOUR ARE INTERESTED HOW IT WORKS, THIS IS THE LINE YOU WANT TO UNCOMMENT:
// console.log(js);

    return {
      deps: this.dependencies as unknown[],
      js,
    } as CompiledFunction<JsonTypeValidator>;
  }
}

/**
 * Given json-type schema and options creates an optimized JavaScript function
 * for JSON value validation according to the schema.
 *
 * @param type json-type for which to compile a validator function.
 * @param options Code-generator options.
 * @returns Compiled validator function.
 */
 export const createValidator = (type: TType, options: JsonTypeValidatorCodegenOptions = {}): JsonTypeValidator => {
  const codegen = new JsonTypeValidatorCodegen(options);
  const fn = codegen.generate(type);
  return compileFn(fn);
};

/**
 * Given json-type schema and options creates an optimized
 * {@link BooleanValidator} function for JSON value validation according to the
 * schema.
 *
 * Validator returns `true` if error was found, and `false` if no error was
 * found.
 */
export const createBoolValidator = (type: TType, options: Omit<JsonTypeValidatorCodegenOptions, 'errorReporting'> = {}): BooleanValidator => {
  return createValidator(type, {
    ...options,
    errorReporting: 'boolean',
  }) as BooleanValidator;
};

/**
 * Given json-type schema and options creates an optimized
 * {@link StringValidator} function for JSON value validation according to the
 * schema.
 *
 * Validator returns JSON array encoded in string, such as
 * `'["STR","foo","bar"]'`, if error was found, and empty string `""` if no
 * error was not found.
 *
 * The error string contains error code and path where error happened. First,
 * element in the encoded JSON array represents the error type, see
 * {@link JsonTypeValidatorError} and {@link JsonTypeValidatorErrorMessage} for
 * more info. The remaining elements in the array represent the path where error
 * happened.
 */
export const createStrValidator = (type: TType, options: Omit<JsonTypeValidatorCodegenOptions, 'errorReporting'> = {}): StringValidator => {
  return createValidator(type, {
    ...options,
    errorReporting: 'string',
  }) as StringValidator;
};

/**
 * Same as {@link createStrValidator}, but creates {@link ObjectValidator},
 * which returns errors as objects of type {@link ObjectValidatorError}; or
 * `null` on no error.
 */
export const createObjValidator = (type: TType, options: Omit<JsonTypeValidatorCodegenOptions, 'errorReporting'> = {}): ObjectValidator => {
  return createValidator(type, {
    ...options,
    errorReporting: 'object',
  }) as ObjectValidator;
};
