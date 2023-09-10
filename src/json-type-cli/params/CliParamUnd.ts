import {applyPatch} from '../../json-patch';
import {toPath} from '../../json-pointer';
import type {Cli} from '../Cli';
import type {CliParam, CliParamInstance} from '../types';

export class CliParamUnd implements CliParam {
  public readonly param = 'und';
  public readonly title = 'Set undefined value';
  public readonly createInstance = (cli: Cli, pointer: string, rawValue: unknown) =>
    new (class implements CliParamInstance {
      public readonly onRequest = async () => {
        const path = toPath(pointer);
        applyPatch(cli.request, [{op: 'add', path, value: undefined}], {mutate: true});
      };
    })();
}
