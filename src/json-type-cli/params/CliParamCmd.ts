import {applyPatch} from '../../json-patch';
import {spawn} from 'child_process';
import {toPath} from '../../json-pointer';
import {bufferToUint8Array} from '../../util/buffers/bufferToUint8Array';
import {listToUint8} from '../../util/buffers/concat';
import type {Cli} from '../Cli';
import type {CliParam, CliParamInstance} from '../types';

export class CliParamCmd implements CliParam {
  public readonly param = 'cmd';
  public readonly short = 'c';
  public readonly title = 'Set value by command';
  public readonly createInstance = (cli: Cli, pointer: string, rawValue: unknown) =>
    new (class implements CliParamInstance {
      public readonly onRequest = async () => {
        let cmd = String(rawValue);
        const regex = new RegExp(`^((${[...cli.codecs.codecs.keys()].join('|')}):)?(.+)$`);
        const match = regex.exec(cmd);
        let codec = cli.requestCodec;
        if (match) {
          const [, , codecName, cmd_] = match;
          const codec_ = cli.codecs.get(codecName);
          if (codec_) {
            codec = codec_;
            cmd = cmd_;
          }
        }
        const uint8 = await new Promise<Uint8Array>((resolve, reject) => {
          const ls = spawn(cmd, {shell: true});
          let uint8s: Uint8Array[] = [];
          ls.stdout.on('data', (data) => {
            uint8s.push(bufferToUint8Array(data));
          });
          ls.stderr.on('data', (data) => {
            reject(bufferToUint8Array(data));
          });
          ls.on('close', (code) => {
            resolve(listToUint8(uint8s));
          });
        });
        const value = codec.decode(uint8);
        const path = toPath(pointer);
        applyPatch(cli.request, [{op: 'add', path, value}], {mutate: true});
      };
    })();
}
