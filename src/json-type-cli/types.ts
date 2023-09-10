import type {RoutesBase, TypeRouter} from '../json-type/system/TypeRouter';
import type {Cli} from './Cli';

export interface CliCodec<Id extends string = string> {
  id: Id;
  description: string;
  encode: (value: unknown) => Uint8Array;
  decode: (bytes: Uint8Array) => unknown;
}

export interface CliContext<Router extends TypeRouter<RoutesBase> = TypeRouter<RoutesBase>> {
  cli: Cli<Router>;
  codecs: [request: CliCodec, response: CliCodec];
}

export interface CliParam {
  param: string;
  short?: string;
  title: string;
  createInstance: (cli: Cli, pointer: string, value: string) => CliParamInstance;
}

export interface CliParamInstance {
  onParam?: () => Promise<void>;
  onBeforeExec?: (cli: Cli) => Promise<void>;
  onAfterExec?: (cli: Cli) => Promise<void>;
}
