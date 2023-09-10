import type {Cli} from '../Cli';
import type {CliParam, CliParamInstance} from '../types';

export class CliParamVersion implements CliParam {
  public readonly param = 'version';
  public readonly short = 'v';
  public readonly title = 'Print version and exit';
  public readonly createInstance = (cli: Cli, pointer: string, value: unknown) =>
    new (class implements CliParamInstance {
      public readonly onParam = async () => {
        const version = cli.options.version ?? '0.0.0-unknown';
        cli.stdout.write(version + '\n');
        cli.exit(0);
      };
    })();
}
