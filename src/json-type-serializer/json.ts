import {json_string} from '../json-brand';
import {TArray, TBoolean, TNumber, TObject, TString, TType, TRef} from '../json-type/types';
import {Codegen, CodegenStepExecJs} from '../util/codegen';
import {JsExpression} from '../util/codegen/util/JsExpression';
import {asString} from '../util/asString';

export type EncoderFn = <T>(value: T) => json_string<T>;

class WriteTextStep {
  constructor(public str: string) {}
}

type Step = WriteTextStep | CodegenStepExecJs;

export interface JsonSerializerCodegenOptions {
  type: TType;
  ref?: (id: string) => TType | undefined;
}

export class JsonSerializerCodegen {
  /** @ignore */
  protected options: Required<JsonSerializerCodegenOptions>;

  /** @ignore */
  protected codegen: Codegen<EncoderFn>;

  constructor(opts: JsonSerializerCodegenOptions) {
    this.options = {
      ref: (id: string) => undefined,
      ...opts,
    };
    this.codegen = new Codegen<EncoderFn>({
      name: 'toJson' + (this.options.type.id && /^[a-z][a-z0-9_]*$/i.test(this.options.type.id) ? (this.options.type.id[0].toUpperCase() + this.options.type.id.substr(1)) : ''),
      prologue: `var s = '';`,
      epilogue: `return s;`,
      processSteps: (steps) => {
        const stepsJoined: Step[] = [];
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          if (step instanceof CodegenStepExecJs) stepsJoined.push(step);
          else if (step instanceof WriteTextStep) {
            const last = stepsJoined[stepsJoined.length - 1];
            if (last instanceof WriteTextStep) last.str += step.str;
            else stepsJoined.push(step);
          }
        }
        const execSteps: CodegenStepExecJs[] = [];
        for (const step of stepsJoined) {
          if (step instanceof CodegenStepExecJs) {
            execSteps.push(step);
          } else if (step instanceof WriteTextStep) {
            const js = /* js */ `s += ${JSON.stringify(step.str)};`;
            execSteps.push(new CodegenStepExecJs(js));
          }
        }
        return execSteps;
      },
    });
    this.codegen.linkDependency(asString, 'asString');
    this.codegen.linkDependency(JSON.stringify, 'stringify');
  }

  protected js(js: string) {
    this.codegen.js(js);
  }

  protected writeText(str: string): void {
    this.codegen.step(new WriteTextStep(str));
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
    this.js(/* js */ `s += stringify(${value.use()});`);
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
    this.js(/* js */ `js += '"<BINARY>"';`);
  }

  public onRef(ref: TRef, value: JsExpression): void {
    const type = this.options.ref(ref.ref);
    if (type === undefined) {
      throw new Error(`Unknown [ref = ${ref.ref}].`);
    }
    this.onType(type, value);
  }

  public onAny(value: JsExpression) {
    this.js(/* js */ `s += stringify(${value.use()});`);
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

  public run(): this {
    const r = this.getRegister();
    const value = new JsExpression(() => r);
    this.onType(this.options.type, value);
    return this;
  }

  public generate() {
    return this.codegen.generate();
  }

  public compile() {
    return this.codegen.compile();
  }
}
