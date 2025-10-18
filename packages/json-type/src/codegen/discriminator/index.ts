import {JsonExpressionCodegen} from '@jsonjoy.com/json-expression';
import {Vars} from '@jsonjoy.com/json-expression/lib/Vars';
import {operatorsMap} from '@jsonjoy.com/json-expression/lib/operators';
import type {OrType} from '../../type';
import {lazyKeyedFactory} from '../util';

export type DiscriminatorFn = (val: unknown) => number;

export class DiscriminatorCodegen {
  public static readonly get = lazyKeyedFactory((or: OrType): DiscriminatorFn => {
    const expr = or.schema.discriminator;
    if (!expr || (expr[0] === 'num' && expr[1] === 0)) throw new Error('NO_DISCRIMINATOR');
    const codegen = new JsonExpressionCodegen({
      expression: expr,
      operators: operatorsMap,
    });
    const generated = codegen.run().compile();
    return (data: unknown) => +(generated(new Vars(data)) as any);
  });
}
