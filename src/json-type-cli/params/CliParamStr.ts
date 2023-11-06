import {applyPatch} from '../../json-patch';
import {toPath} from '../../json-pointer';
import type {Cli} from '../Cli';
import type {CliParam, CliParamInstance} from '../types';

export class CliParamStr implements CliParam {
  public readonly param = 'str';
  public readonly short = 's';
  public readonly title = 'Set string value';
  public readonly example = '--s/foo=abc';
  public readonly createInstance = (cli: Cli, pointer: string, rawValue: unknown) =>
    new (class implements CliParamInstance {
      public readonly onRequest = async () => {
        const value = String(rawValue);
        const path = toPath(pointer);
        cli.request = applyPatch(cli.request, [{op: 'add', path, value}], {mutate: true}).doc;
      };
    })();
}
