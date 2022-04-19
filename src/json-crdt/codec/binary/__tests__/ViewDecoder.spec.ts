import {LogicalVectorClock} from '../../../../json-crdt-patch/clock';
import {Model} from '../../../model';
import {Encoder} from '../Encoder';
import {ViewDecoder} from '../ViewDecoder';

describe('logical', () => {
  test('decodes clock', () => {
    const doc1 = Model.withLogicalClock(new LogicalVectorClock(222, 0));
    doc1.api.root([1, 'asdf', false, {}, {foo: 'bar'}]).commit();
    doc1.api.str([1]).ins(4, '!').commit();
    doc1.api.str([4, 'foo']).del(1, 1).commit();
    doc1.api.arr([]).ins(1, [new Uint8Array([1, 2, 3])]).commit();
    doc1.api.bin([1]).del(2, 1).commit();
    doc1.api.arr([]).ins(6, ['a', 'b', 'c']).commit();
    doc1.api.arr([]).del(7, 1).commit();
    doc1.api.obj([4]).set({a: [], b: true}).commit();
    doc1.api.obj([4]).del(['a']).commit();
    const encoder = new Encoder();
    const decoder = new ViewDecoder();
    const encoded = encoder.encode(doc1);
    const decoded = decoder.decode(encoded);
    // console.log('.toView()', doc1.toView());
    // console.log('decoded', decoded);
    expect(decoded).toStrictEqual([1, new Uint8Array([1, 2]), 'asdf!', false, {b: true}, {foo: 'br'}, 'a', 'c']);
  });
});
