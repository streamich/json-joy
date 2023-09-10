import {applyPatch} from '../../json-patch';
import {find, toPath, validateJsonPointer} from '../../json-pointer';
import {promises} from 'fs';
import type {Cli} from '../Cli';
import type {CliParam, CliParamInstance} from '../types';

export class CliParamFile implements CliParam {
  public readonly param = 'file';
  public readonly short = 'f';
  public readonly title = 'Read value from file';
  public readonly createInstance = (cli: Cli, pointer: string, rawValue: unknown) =>
    new (class implements CliParamInstance {
      public readonly onRequest = async () => {
        const [filename, fileCodec, filePointer] = String(rawValue).split(':');
        const codec = fileCodec ? cli.codecs.get(fileCodec) : cli.requestCodec;
        const uint8 = await promises.readFile(filename);
        let value = codec.decode(uint8);
        if (filePointer) {
          validateJsonPointer(filePointer);
          value = find(value, toPath(filePointer)).val;
        }
        validateJsonPointer(pointer);
        const path = toPath(pointer);
        applyPatch(cli.request, [{op: 'add', path, value}], {mutate: true});
      };
    })();
}
