import type {Cli} from "../Cli";
import type {CliParam, CliParamInstance} from "../types";

export class CliParamVersion implements CliParam {
  public readonly param = 'version';
  public readonly short = 'v';
  public readonly title = 'Print version and exit';
  public readonly createInstance = (cli: Cli, pointer: string, value: string) => new class implements CliParamInstance {
    public readonly onParam = async () => {
      
    };
  }
}
