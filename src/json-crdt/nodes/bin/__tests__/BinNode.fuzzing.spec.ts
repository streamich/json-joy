/* tslint:disable no-console */

import {type ITimespanStruct, type ITimestampStruct, ts} from '../../../../json-crdt-patch/clock';
import {Fuzzer} from '@jsonjoy.com/util/lib/Fuzzer';
import {BinNode} from '../BinNode';
import {randomU32} from 'hyperdyperid/lib/randomU32';
import {RandomJson} from '@jsonjoy.com/util/lib/json-random';
import * as path from 'path';
import * as fs from 'fs';

type IdGenerator = (span: number) => ITimestampStruct;
type Operation = ((rga: BinNode) => void) & {toString: (symb?: string) => string};

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

  rga1 = new BinNode(ts(1, 0));
  rga2 = new BinNode(ts(1, 0));

  operation = (source: BinNode, id: IdGenerator): Operation => {
    const doInsert = !source.length() || !randomU32(0, 1);
    if (doInsert) {
      const pos = randomU32(0, source.length() - 1);
      const length = randomU32(1, 10);
      const after = source.find(pos) || source.id;
      const buf = RandomJson.genBinary(length);
      const stamp = id(length);
      const op = (rga: BinNode) => {
        rga.ins(after, stamp, buf);
      };
      op.toString = (symb: string = 'rga') => `${symb}.ins(${tsToStr(after)}, ${tsToStr(stamp)}, ${uint8ToStr(buf)});`;
      return op;
    } else {
      const pos = randomU32(0, source.length() - 1);
      const length = randomU32(0, source.length() - pos);
      const range = source.findInterval(pos, length);
      const op = (rga: BinNode) => {
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
const uint8ToStr = (buf: Uint8Array) => `new Uint8Array([${buf}])`;

const assertEmptyNodes = (rga: BinNode) => {
  for (let chunk = rga.first(); chunk; chunk = rga.next(chunk)) {
    if (chunk.del) {
      if (chunk.data) {
        throw new Error('chunk.data must be undefined');
      }
    } else {
      if (!chunk.data || !chunk.data.length) {
        throw new Error('chunk.data is empty');
      }
    }
  }
};

test('fuzzing BinNode', () => {
  for (let j = 0; j < 1000; j++) {
    const fuzzer = new BinNodeFuzzer();
    const lines: string[] = [];
    lines.push(`import {ts, tss} from "../../../../json-crdt-patch/clock";`);
    lines.push(`import {BinNode} from "../BinNode";`);
    lines.push('');
    lines.push(`test('two concurrent users - #', () => {`);
    lines.push(`  const rga1 = new BinNode(${tsToStr(fuzzer.rga1.id)});`);
    lines.push(`  const rga2 = new BinNode(${tsToStr(fuzzer.rga2.id)});`);
    lines.push('');

    let oldOp1: Operation | undefined;
    let oldOp2: Operation | undefined;

    for (let i = 0; i < 20; i++) {
      const op1 = fuzzer.operation(fuzzer.rga1, fuzzer.id1);
      const op2 = fuzzer.operation(fuzzer.rga2, fuzzer.id2);
      lines.push('  ' + op1.toString('rga1'));
      lines.push('  ' + op2.toString('rga1'));
      lines.push('  ' + op2.toString('rga2'));
      lines.push('  ' + op1.toString('rga2'));
      lines.push('');

      op1(fuzzer.rga1);
      op2(fuzzer.rga1);

      op2(fuzzer.rga2);
      op1(fuzzer.rga2);

      if (oldOp1) {
        lines.push('  ' + oldOp1.toString('rga1'));
        lines.push('  ' + oldOp1.toString('rga2'));
        oldOp1(fuzzer.rga1);
        oldOp1(fuzzer.rga2);
      }
      if (oldOp2) {
        lines.push('  ' + oldOp2.toString('rga1'));
        lines.push('  ' + oldOp2.toString('rga2'));
        oldOp2(fuzzer.rga1);
        oldOp2(fuzzer.rga2);
      }

      assertEmptyNodes(fuzzer.rga1);
      assertEmptyNodes(fuzzer.rga2);

      oldOp1 = op1;
      oldOp2 = op2;

      fuzzer.syncClocks();
      try {
        expect(fuzzer.rga1.view()).toStrictEqual(fuzzer.rga2.view());
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
