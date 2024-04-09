import {Codegen, CodegenStepExecJs} from '@jsonjoy.com/util/lib/codegen';
import {asString} from '@jsonjoy.com/util/lib/strings/asString';
import {toBase64} from '@jsonjoy.com/base64/lib/toBase64';
import type {TypeSystem} from '../../system';
import type {Type} from '../../type';
import type {json_string} from '@jsonjoy.com/util/lib/json-brand';

export type JsonEncoderFn = <T>(value: T) => json_string<T>;

class WriteTextStep {
  constructor(public str: string) {}
}

type Step = WriteTextStep | CodegenStepExecJs;

export interface JsonTextEncoderCodegenContextOptions {
  /** Type for which to generate the encoder. */
  type: Type;

  /** Type system to use for alias and validator resolution. */
  system?: TypeSystem;

  name?: string;
}

export class JsonTextEncoderCodegenContext {
  public readonly codegen: Codegen<JsonEncoderFn>;

  constructor(public readonly options: JsonTextEncoderCodegenContextOptions) {
    this.codegen = new Codegen<JsonEncoderFn>({
      name: 'toJson' + (options.name ? '_' + options.name : ''),
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

  public js(js: string): void {
    this.codegen.js(js);
  }

  public writeText(str: string): void {
    this.codegen.step(new WriteTextStep(str));
  }

  protected base64Linked = false;
  public linkBase64() {
    if (this.base64Linked) return;
    this.codegen.linkDependency(toBase64, 'toBase64');
  }

  public compile() {
    return this.codegen.compile();
  }
}
