import {RandomJson} from '@jsonjoy.com/json-random';
import {Fuzzer} from '@jsonjoy.com/util/lib/Fuzzer';
import {append, normalize} from '../util';
import type {StringOp} from '../types';

export class StringOtFuzzer extends Fuzzer {
  genString(): string {
    return RandomJson.genString(20);
  }

  genOp(str: string): StringOp {
    if (!str) return [this.genString()];
    let op: StringOp = [];
    let off = 0;
    let remaining = str.length;
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
          append(op, RandomJson.genString(len));
        },
      ]);
      fn();
      remaining = str.length - off;
    }
    op = normalize(op);
    if (op.length === 1 && typeof op[0] === 'number' && op[0] > 0) return [this.genString()];
    return op;
  }
}
