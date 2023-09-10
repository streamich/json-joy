import {applyPatch} from "../../json-patch";
import {toPath} from "../../json-pointer";
import type {Cli} from "../Cli";
import type {CliParam, CliParamInstance} from "../types";

export class CliParamNum implements CliParam {
  public readonly param = 'num';
  public readonly short = 'n';
  public readonly title = 'Set number value';
  public readonly createInstance = (cli: Cli, pointer: string, rawValue: unknown) => new class implements CliParamInstance {
    public readonly onRequest = async () => {
      const value = Number(JSON.parse(String(rawValue)));
      const path = toPath(pointer);
      applyPatch(cli.request, [{op: 'add', path, value}], {mutate: true});
    };
  }
}
