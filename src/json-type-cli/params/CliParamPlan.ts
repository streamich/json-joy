import {toTree} from '../../json-text/toTree';
import {AbstractType} from '../../json-type/type/classes';
import type {Cli} from '../Cli';
import type {CliContext, CliParam, CliParamInstance} from '../types';
import {formatError} from '../util';

export class CliParamPlan implements CliParam {
  public readonly param = 'plan';
  public readonly title = 'Show execution plan';
  public readonly createInstance = (cli: Cli, pointer: string, rawValue: unknown) =>
    new (class implements CliParamInstance {
      public readonly onBeforeCall = async (method: string, ctx: CliContext) => {
        const fn = cli.router.get(method).type;
        if (!fn) throw new Error(`Method ${method} not found`);
        const out: any = {
          Method: method,
        };
        try {
          const validator = (fn.req as AbstractType<any>).validator('object');
          const error = validator(cli.request);
          if (error) throw error;
          out.Validation = 'OK';
        } catch (error) {
          out.Validation = 'Failed';
          out.ValidationError = formatError(error);
        }
        out.Request = cli.request;
        cli.stdout.write(toTree(out) + '\n');
        cli.exit(0);
      };
    })();
}
