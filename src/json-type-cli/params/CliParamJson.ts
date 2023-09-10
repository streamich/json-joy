import {applyPatch} from "../../json-patch";
import {toPath} from "../../json-pointer";
import type {Cli} from "../Cli";
import type {CliParam, CliParamInstance} from "../types";

export class CliParamJson implements CliParam {
  public readonly param = 'json';
  public readonly short = 'j';
  public readonly title = 'Set JSON value';
  public readonly createInstance = (cli: Cli, pointer: string, rawValue: unknown) => new class implements CliParamInstance {
    public readonly onRequest = async () => {
      const value = JSON.parse(String(rawValue));
      const path = toPath(pointer);
      applyPatch(cli.request, [{op: 'add', path, value}], {mutate: true});
    };
  }
}
