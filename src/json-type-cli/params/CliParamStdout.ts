import {find, toPath, validateJsonPointer} from '../../json-pointer';
import type {Cli} from '../Cli';
import type {CliParam, CliParamInstance} from '../types';

export class CliParamStdout implements CliParam {
  public readonly param = 'stdout';
  public readonly short = 'out';
  public readonly title = 'Write data to stdout';
  public readonly createInstance = (cli: Cli, _: string, rawValue: unknown) => {
    return new (class implements CliParamInstance {
      public readonly onResponse = async () => {
        const pointer = String(rawValue);
        validateJsonPointer(pointer);
        const path = toPath(pointer);
        cli.response = find(cli.response, path).val;
      };
    })();
  };
}
