/* tslint:disable no-console */

import {type ITimespanStruct, type ITimestampStruct, ts} from '../../../../json-crdt-patch/clock';
import {Fuzzer} from '@jsonjoy.com/util/lib/Fuzzer';
import {StrNode} from '../StrNode';
import {randomU32} from 'hyperdyperid/lib/randomU32';
import * as path from 'path';
import * as fs from 'fs';

const generateString = (length: number) =>
  Fuzzer.pick([() => 'a'.repeat(length), () => 'b'.repeat(length), () => 'c'.repeat(length), () => 'd'.repeat(length)]);

type IdGenerator = (span: number) => ITimestampStruct;
type Operation = ((rga: StrNode) => void) & {toString: (symb?: string) => string};

class BinNodeFuzzer extends Fuzzer {
  t1: number = 1;
  t2: number = 1;

  id1 = (span: number) => {
    const id = ts(100, this.t1);
    this.t1 += span;
    return id;
  };

  id2 = (span: number) => {
    const id = ts(200, this.t2);
    this.t2 += span;
    return id;
  };

  rga1 = new StrNode(ts(1, 0));
  rga2 = new StrNode(ts(1, 0));

  operation = (source: StrNode, id: IdGenerator): Operation => {
    const doInsert = !source.length() || !randomU32(0, 1);
    if (doInsert) {
      const pos = randomU32(0, source.length() - 1);
      const length = randomU32(1, 4);
      const after = source.find(pos) || source.id;
      const content = generateString(length)();
      const stamp = id(length);
      const op = (rga: StrNode) => {
        rga.ins(after, stamp, content);
      };
      op.toString = (symb: string = 'rga') =>
        `${symb}.ins(${tsToStr(after)}, ${tsToStr(stamp)}, ${JSON.stringify(content)});`;
      return op;
    } else {
      const pos = randomU32(0, source.length() - 1);
      const length = randomU32(0, source.length() - pos);
      const range = source.findInterval(pos, length);
      const op = (rga: StrNode) => {
        rga.delete(range);
      };
      op.toString = (symb: string = 'rga') => `${symb}.delete([${range.map(tssToStr).join(', ')}]);`;
      return op;
    }
  };

  syncClocks() {
    this.t1 = Math.max(this.t1, this.t2);
    this.t2 = Math.max(this.t1, this.t2);
  }
}

const tsToStr = (stamp: ITimestampStruct) => `ts(${stamp.sid}, ${stamp.time})`;
const tssToStr = (span: ITimespanStruct) => `tss(${span.sid}, ${span.time}, ${span.span})`;

test('fuzzing StrNode', () => {
  for (let j = 0; j < 1000; j++) {
    const fuzzer = new BinNodeFuzzer();
    const lines: string[] = [];
    lines.push(`import {ts, tss} from "../../../../json-crdt-patch/clock";`);
    lines.push(`import {StrNode} from "../StrNode";`);
    lines.push('');
    lines.push(`test('two concurrent users - #', () => {`);
    lines.push(`  const rga1 = new StrNode(${tsToStr(fuzzer.rga1.id)});`);
    lines.push(`  const rga2 = new StrNode(${tsToStr(fuzzer.rga2.id)});`);
    lines.push('');

    for (let i = 0; i < 10; i++) {
      const op1 = fuzzer.operation(fuzzer.rga1, fuzzer.id1);
      const op2 = fuzzer.operation(fuzzer.rga2, fuzzer.id2);
      lines.push('  ' + op1.toString('rga1'));
      lines.push('  ' + op2.toString('rga1'));
      lines.push('  ' + op2.toString('rga2'));
      lines.push('  ' + op1.toString('rga2'));
      lines.push('');

      op1(fuzzer.rga1);
      op1(fuzzer.rga1);
      op1(fuzzer.rga1);
      op2(fuzzer.rga1);
      op2(fuzzer.rga1);
      op2(fuzzer.rga1);

      op2(fuzzer.rga2);
      op2(fuzzer.rga2);
      op2(fuzzer.rga2);
      op1(fuzzer.rga2);
      op1(fuzzer.rga2);
      op1(fuzzer.rga2);

      fuzzer.syncClocks();
      try {
        const view1 = fuzzer.rga1.view();
        expect(view1).toStrictEqual(fuzzer.rga2.view());
        expect(view1.length).toBe(fuzzer.rga1.length());
      } catch (error) {
        lines.push('  expect(rga1.view()).toStrictEqual(rga2.view());');
        lines.push('});');
        const testCase = lines.join('\n');
        const fileName = path.dirname(__filename) + `/fuzzer-bug-${Date.now()}.spec.ts`;
        fs.writeFileSync(fileName, testCase);
        console.log(`Test case written to ${fileName}`);
        throw error;
      }
    }
  }
});
