import type {RoutesBase, TypeRouter} from '../json-type/system/TypeRouter';
import type {Cli} from './Cli';
import type {WriteStream, ReadStream} from 'tty';

export interface CliCodec<Id extends string = string> {
  id: Id;
  encode: (value: unknown) => Uint8Array;
  decode: (bytes: Uint8Array) => unknown;
}

export interface CliContext<Router extends TypeRouter<RoutesBase> = TypeRouter<RoutesBase>> {
  cli: Cli<Router>;
  run: RunOptions;
  codecs: [request: CliCodec, response: CliCodec];
}

export interface RunOptions {
  argv?: string[];
  stdout?: WriteStream;
  stderr?: WriteStream;
  stdin?: ReadStream;
  exit?: (errno: number) => void;
}
