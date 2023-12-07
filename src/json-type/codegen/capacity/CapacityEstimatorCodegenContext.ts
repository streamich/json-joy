import {Codegen, CodegenStepExecJs} from '../../../util/codegen';
import {maxEncodingCapacity} from '../../../json-size';
import {RpcValue} from '../../../reactive-rpc/common/messages/Value';
import type {TypeSystem} from '../../system';
import type {Type} from '../../type';

export type CompiledCapacityEstimator = (value: any) => number;

class IncrementSizeStep {
  constructor(public readonly inc: number) {}
}

export interface CapacityEstimatorCodegenContextOptions {
  /** Type for which to generate the encoder. */
  type: Type;

  /** Type system to use for alias and validator resolution. */
  system?: TypeSystem;

  /** Name to concatenate to the end of the generated function. */
  name?: string;
}

export class CapacityEstimatorCodegenContext {
  public readonly codegen: Codegen<CompiledCapacityEstimator>;

  constructor(public readonly options: CapacityEstimatorCodegenContextOptions) {
    this.codegen = new Codegen({
      name: 'approxSize' + (options.name ? '_' + options.name : ''),
      args: ['r0'],
      prologue: /* js */ `var size = 0;`,
      epilogue: /* js */ `return size;`,
      linkable: {
        Value: RpcValue,
      },
      processSteps: (steps) => {
        const stepsJoined: CodegenStepExecJs[] = [];
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          if (step instanceof CodegenStepExecJs) stepsJoined.push(step);
          else if (step instanceof IncrementSizeStep) {
            stepsJoined.push(new CodegenStepExecJs(/* js */ `size += ${step.inc};`));
          }
        }
        return stepsJoined;
      },
    });
    this.codegen.linkDependency(maxEncodingCapacity, 'maxEncodingCapacity');
  }

  public inc(inc: number): void {
    this.codegen.step(new IncrementSizeStep(inc));
  }

  public compile(): CompiledCapacityEstimator {
    return this.codegen.compile();
  }
}
