import {RandomJson} from "../../../../json-random";
import {Fuzzer} from "../../../../util/Fuzzer";
import {append, normalize} from "../StringType";
import {StringTypeOp} from "../types";

export class StringOtFuzzer extends Fuzzer {
  genString(): string {
    return RandomJson.genString(20);
  }

  genOp(str: string): StringTypeOp {
    if (!str) return [this.genString()];
    let op: StringTypeOp = [];
    let off = 0;
    let remaining = str.length;
    while (remaining > 0) {
      const len = Fuzzer.generateInteger(1, remaining);
      const fn = Fuzzer.pick([
        () => {
          append(op, len);
          off += len;
        },
        () => {
          if (Math.random() < 0.5) {
            append(op, -len);
          } else {
            append(op, [str.substring(off, off + len)]);
          }
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
