import {ts} from '../../../../json-crdt-patch/clock';
import {BinNode} from '../BinNode';

const b = (...octets: number[]) => new Uint8Array(octets);

describe('.insAt()', () => {
  test('can insert into empty blob', () => {
    const type = new BinNode(ts(1, 1));
    type.insAt(0, ts(1, 2), b(1, 2, 3));
    expect(type.view()).toEqual(b(1, 2, 3));
  });

  test('can insert at the beginning of a blob', () => {
    const type = new BinNode(ts(1, 1));
    type.insAt(0, ts(1, 2), b(1, 2, 3));
    type.insAt(0, ts(1, 66), b(0));
    expect(type.view()).toEqual(b(0, 1, 2, 3));
    type.insAt(0, ts(1, 67), b(9));
    expect(type.view()).toEqual(b(9, 0, 1, 2, 3));
  });

  test('can insert at the end of blob with sequential ID', () => {
    const type = new BinNode(ts(1, 1));
    type.insAt(0, ts(1, 2), b(1));
    expect(type.view()).toEqual(b(1));
    type.insAt(1, ts(1, 3), b(2));
    expect(type.view()).toEqual(b(1, 2));
  });

  test('can insert at the end of blob with ID jump', () => {
    const type = new BinNode(ts(1, 1));
    type.insAt(0, ts(1, 2), b(1));
    expect(type.view()).toEqual(b(1));
    type.insAt(1, ts(1, 33), b(2));
    expect(type.view()).toEqual(b(1, 2));
  });
});
