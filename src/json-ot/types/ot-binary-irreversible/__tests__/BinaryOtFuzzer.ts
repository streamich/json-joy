import {RandomJson} from '@jsonjoy.com/util/lib/json-random';
import {Fuzzer} from '@jsonjoy.com/util/lib/Fuzzer';
import {append, normalize} from '../util';
import type {BinaryOp} from '../types';

export class BinaryOtFuzzer extends Fuzzer {
  genBinary(): Uint8Array {
    return RandomJson.genBinary(20);
  }

  genOp(bin: Uint8Array): BinaryOp {
    if (!bin) return [this.genBinary()];
    let op: BinaryOp = [];
    let off = 0;
    let remaining = bin.length;
    while (remaining > 0) {
      const len = Fuzzer.randomInt(1, remaining);
      const fn = Fuzzer.pick([
        () => {
          append(op, len);
          off += len;
        },
        () => {
          append(op, -len);
          off += len;
        },
        () => {
          append(op, RandomJson.genBinary(len));
        },
      ]);
      fn();
      remaining = bin.length - off;
    }
    op = normalize(op);
    if (op.length === 1 && typeof op[0] === 'number' && op[0] > 0) return [this.genBinary()];
    return op;
  }
}
