import {applyPatch} from '../../json-patch';
import {spawn} from 'child_process';
import {find, toPath, validateJsonPointer} from '../../json-pointer';
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
        let codec = cli.requestCodec;
        let cmdPointer: string = '';
        if (cmd[0] === '(') {
          const regex = /^\((.+)\)\:([a-z0-9]*)(\:([^\:]*))$/;
          const match = regex.exec(cmd);
          if (match) {
            const [, cmd_, cmdCodec, , cmdPointer_] = match;
            cmd = cmd_;
            if (cmdCodec) codec = cli.codecs.get(cmdCodec);
            if (cmdPointer_) {
              validateJsonPointer(cmdPointer_);
              cmdPointer = cmdPointer_;
            }
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
        let value = codec.decode(uint8);
        if (cmdPointer) value = find(value, toPath(cmdPointer)).val;
        const path = toPath(pointer);
        cli.request = applyPatch(cli.request, [{op: 'add', path, value}], {mutate: true}).doc;
      };
    })();
}
