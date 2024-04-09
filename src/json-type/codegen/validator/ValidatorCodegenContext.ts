import {Codegen} from '@jsonjoy.com/util/lib/codegen';
import {ValidationError, ValidationErrorMessage} from '../../constants';
import type {TypeSystem} from '../../system';
import type {Type} from '../../type';
import type {JsonTypeValidator, ValidationPath} from './types';

export interface ValidatorCodegenContextOptions {
  /** Type for which to generate the validator. */
  type: Type;

  /** Type system to use for alias and validator resolution. */
  system?: TypeSystem;

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
  errors: 'boolean' | 'string' | 'object';

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
}

export class ValidatorCodegenContext {
  public readonly options: ValidatorCodegenContextOptions;
  public readonly codegen: Codegen;

  constructor(options: ValidatorCodegenContextOptions) {
    this.options = {
      skipObjectExtraFieldsCheck: false,
      unsafeMode: false,
      ...options,
    };
    const successResult =
      this.options.errors === 'boolean' ? 'false' : this.options.errors === 'string' ? "''" : 'null';
    this.codegen = new Codegen<JsonTypeValidator>({
      epilogue: `return ${successResult};`,
    });
  }

  public js(js: string): void {
    this.codegen.js(js);
  }

  /** Generates an error message. The type of message form is dictated by `options.errors` setting. */
  public err(
    code: ValidationError,
    path: ValidationPath,
    opts: {refId?: string; refError?: string; validator?: string} = {},
  ): string {
    switch (this.options.errors) {
      case 'boolean':
        return 'true';
      case 'string': {
        let out = "'[" + JSON.stringify(ValidationError[code]);
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
        let out =
          '{code: ' +
          JSON.stringify(ValidationError[code]) +
          ', errno: ' +
          JSON.stringify(code) +
          ', message: ' +
          JSON.stringify(ValidationErrorMessage[code]) +
          ', path: [';
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
        if (opts.refId) {
          out += ', refId: ' + JSON.stringify(opts.refId);
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

  public emitCustomValidators(node: Type, path: ValidationPath, r: string): void {
    const validatorNames = node.getValidatorNames();
    for (const validatorName of validatorNames) {
      const codegen = this.codegen;
      const v = this.linkValidator(validatorName);
      const rerr = codegen.getRegister();
      const rc = codegen.getRegister();
      const err = this.err(ValidationError.VALIDATION, path, {validator: validatorName, refError: rerr});
      const errInCatch = this.err(ValidationError.VALIDATION, path, {validator: validatorName, refError: rc});
      const emitRc = this.options.errors === 'object';
      codegen.js(/* js */ `try {
  var ${rerr} = ${v}(${r});
  if (${rerr}) return ${err};
} catch (e) {
  ${emitRc ? /* js */ `var ${rc} = e ? e : new Error('Validator ${JSON.stringify(validatorName)} failed.');` : ''}
  return ${errInCatch};
}`);
    }
  }

  private validatorCache = new Map<string, string>();

  protected linkValidator(name: string): string {
    const cached = this.validatorCache.get(name);
    if (cached) return cached;
    const system = this.options.system;
    if (!system) throw new Error('Type system not set.');
    const codegen = this.codegen;
    const validator = system.getCustomValidator(name);
    if (!validator) throw new Error(`Custom validator "${name}" not found.`);
    const result = codegen.linkDependency(validator.fn);
    this.validatorCache.set(name, result);
    return result;
  }

  public compile() {
    return this.codegen.compile();
  }
}
