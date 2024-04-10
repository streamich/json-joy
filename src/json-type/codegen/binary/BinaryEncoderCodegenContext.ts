import {Codegen, CodegenStepExecJs} from '@jsonjoy.com/util/lib/codegen';
import {WriteBlobStep} from '../WriteBlobStep';
import {concat} from '@jsonjoy.com/util/lib/buffers/concat';
import {Value} from '../../../json-type-value/Value';
import type {TypeSystem} from '../../system';
import type {Type} from '../../type';
import type {CompiledBinaryEncoder} from '../types';
import type {BinaryJsonEncoder} from '@jsonjoy.com/json-pack/lib/types';

type Step = WriteBlobStep | CodegenStepExecJs;

export interface BinaryEncoderCodegenContextOptions<Encoder extends BinaryJsonEncoder> {
  /** Type for which to generate the encoder. */
  type: Type;

  /** Encoder to generate inlined blobs. */
  encoder: Encoder;

  /** Type system to use for alias and validator resolution. */
  system?: TypeSystem;

  /** Name to concatenate to the end of the generated function. */
  name?: string;
}

export class BinaryEncoderCodegenContext<Encoder extends BinaryJsonEncoder> {
  public readonly codegen: Codegen<CompiledBinaryEncoder>;

  constructor(public readonly options: BinaryEncoderCodegenContextOptions<Encoder>) {
    this.codegen = new Codegen<CompiledBinaryEncoder>({
      name: 'toBinary' + (options.name ? '_' + options.name : ''),
      args: ['r0', 'encoder'],
      prologue: /* js */ `
var writer = encoder.writer;
writer.ensureCapacity(capacityEstimator(r0));
var uint8 = writer.uint8, view = writer.view;`,
      epilogue: '',
      linkable: {
        Value,
      },
      processSteps: (steps) => {
        const stepsJoined: Step[] = [];
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          if (step instanceof CodegenStepExecJs) stepsJoined.push(step);
          else if (step instanceof WriteBlobStep) {
            const last = stepsJoined[stepsJoined.length - 1];
            if (last instanceof WriteBlobStep) last.arr = concat(last.arr, step.arr);
            else stepsJoined.push(step);
          }
        }
        const execSteps: CodegenStepExecJs[] = [];
        for (const step of stepsJoined) {
          if (step instanceof CodegenStepExecJs) {
            execSteps.push(step);
          } else if (step instanceof WriteBlobStep) {
            execSteps.push(this.codegenBlob(step));
          }
        }
        return execSteps;
      },
    });
    this.codegen.linkDependency(options.type.capacityEstimator(), 'capacityEstimator');
  }

  public getBigIntStr(arr: Uint8Array, offset: number): string {
    const buf = new Uint8Array(8);
    for (let i = 0; i < 8; i++) buf[i] = arr[offset + i];
    const view = new DataView(buf.buffer);
    const bigint = view.getBigUint64(0);
    return bigint.toString() + 'n';
  }

  private codegenBlob(step: WriteBlobStep) {
    const lines: string[] = [];
    const ro = this.codegen.getRegister();
    const length = step.arr.length;
    if (length === 1) {
      lines.push(/* js */ `uint8[writer.x++] = ${step.arr[0]};`);
    } else {
      lines.push(`var ${ro} = writer.x;`);
      lines.push(`writer.x += ${step.arr.length};`);
      let i = 0;
      while (i < length) {
        const remaining = length - i;
        if (remaining >= 8) {
          const value = this.getBigIntStr(step.arr, i);
          lines.push(/* js */ `view.setBigUint64(${ro}${i ? ` + ${i}` : ''}, ${value});`);
          i += 8;
        } else if (remaining >= 4) {
          const value = (step.arr[i] << 24) | (step.arr[i + 1] << 16) | (step.arr[i + 2] << 8) | step.arr[i + 3];
          lines.push(/* js */ `view.setInt32(${ro}${i ? ` + ${i}` : ''}, ${value});`);
          i += 4;
        } else if (remaining >= 2) {
          const value = (step.arr[i] << 8) | step.arr[i + 1];
          lines.push(/* js */ `view.setInt16(${ro}${i ? ` + ${i}` : ''}, ${value});`);
          i += 2;
        } else {
          lines.push(/* js */ `uint8[${ro}${i ? ` + ${i}` : ''}] = ${step.arr[i]};`);
          i++;
        }
      }
    }
    const js = lines.join('\n');
    return new CodegenStepExecJs(js);
  }

  public js(js: string): void {
    this.codegen.js(js);
  }

  public gen(callback: (encoder: Encoder) => void): Uint8Array {
    const {encoder} = this.options;
    encoder.writer.reset();
    callback(encoder);
    return encoder.writer.flush();
  }

  public blob(arr: Uint8Array): void {
    this.codegen.step(new WriteBlobStep(arr));
  }

  public compile() {
    return this.codegen.compile();
  }
}
