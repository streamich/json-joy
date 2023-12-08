import type {ObjectValue} from '../json-type-value/ObjectValue';
import type {Cli} from './Cli';

export interface CliCodec<Id extends string = string> {
  id: Id;
  description: string;
  encode: (value: unknown) => Uint8Array;
  decode: (bytes: Uint8Array) => unknown;
}

export interface CliContext<Router extends ObjectValue<any> = ObjectValue<any>> {
  cli: Cli<Router>;
}

export interface CliParam {
  param: string;
  short?: string;
  title: string;
  example?: string;
  examples?: string[];
  createInstance: (cli: Cli, pointer: string, value: unknown) => CliParamInstance;
}

export interface CliParamInstance {
  onParam?: () => Promise<void>;
  onStdin?: () => Promise<void>;
  onRequest?: () => Promise<void>;
  onBeforeCall?: (method: string, ctx: CliContext) => Promise<void>;
  onResponse?: () => Promise<void>;
}
