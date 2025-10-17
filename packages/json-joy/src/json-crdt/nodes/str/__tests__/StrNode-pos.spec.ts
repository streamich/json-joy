/* tslint:disable no-console */

import {StrNode} from '../StrNode';
import {LogicalClock} from '../../../../json-crdt-patch/clock';

describe('.pos()', () => {
  test('correctly returns positions of a characters in alphabet', () => {
    const clock = new LogicalClock(123, 1);
    const str = new StrNode(clock.tick(1));
    const txt = 'abcdefghijklmnopqrstuvwxyz';
    str.insAt(0, clock.tick(txt.length), txt);
    for (let i = 0; i < txt.length; i++) {
      const res = str.findChunk(i)!;
      const pos = str.pos(res[0]) + res[1];
      expect(pos).toBe(i);
    }
  });

  test('correctly returns positions of a characters in alphabet (characters inserted in reverse)', () => {
    const clock = new LogicalClock(123, 1);
    const str = new StrNode(clock.tick(1));
    str.insAt(0, clock.tick(1), 'z');
    str.insAt(0, clock.tick(1), 'y');
    str.insAt(0, clock.tick(1), 'x');
    str.insAt(0, clock.tick(1), 'w');
    str.insAt(0, clock.tick(1), 'v');
    str.insAt(0, clock.tick(1), 'u');
    str.insAt(0, clock.tick(1), 't');
    str.insAt(0, clock.tick(1), 's');
    str.insAt(0, clock.tick(1), 'r');
    str.insAt(0, clock.tick(1), 'q');
    str.insAt(0, clock.tick(1), 'p');
    str.insAt(0, clock.tick(1), 'o');
    str.insAt(0, clock.tick(1), 'n');
    str.insAt(0, clock.tick(1), 'm');
    str.insAt(0, clock.tick(1), 'l');
    str.insAt(0, clock.tick(1), 'k');
    str.insAt(0, clock.tick(1), 'j');
    str.insAt(0, clock.tick(1), 'i');
    str.insAt(0, clock.tick(1), 'h');
    str.insAt(0, clock.tick(1), 'g');
    str.insAt(0, clock.tick(1), 'f');
    str.insAt(0, clock.tick(1), 'e');
    str.insAt(0, clock.tick(1), 'd');
    str.insAt(0, clock.tick(1), 'c');
    str.insAt(0, clock.tick(1), 'b');
    str.insAt(0, clock.tick(1), 'a');
    const txt = 'abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < txt.length; i++) {
      const res = str.findChunk(i)!;
      const pos = str.pos(res[0]) + res[1];
      expect(pos).toBe(i);
    }
  });
});
