import {ConNode} from '../../../types/con/Const';
import {ConstApi, ObjectApi, ValueApi} from '../nodes';
import {Model} from '../../Model';
import {ObjectLww} from '../../../types/lww-object/ObjectLww';
import {RootLww} from '../../../types/lww-root/RootLww';
import {ValueLww} from '../../../types/lww-value/ValueLww';

describe('can use .in() method to reference any model node', () => {
  const doc = Model.withLogicalClock();

  test('can access root node', () => {
    const node = doc.api.r.asVal();
    expect(node.node).toBeInstanceOf(RootLww);
  });

  doc.api.root({
    foo: [1],
  });
  doc.api.r.in('/foo/0').asVal().set({bar: 'baz'});

  test('can access array element ValueLww and its contents', () => {
    const register1 = doc.api.r.in().in('foo').in(0).asVal();
    const register2 = doc.api.val('/foo/0');
    const register3 = doc.api.val(['foo', 0]);
    expect(register1).toBeInstanceOf(ValueApi);
    expect(register1.node).toBeInstanceOf(ValueLww);
    expect(register1.node).toBe(register2.node);
    expect(register1.node).toBe(register3.node);
    const obj1 = register1.in();
    expect(obj1).toBeInstanceOf(ObjectApi);
    expect(obj1.node).toBeInstanceOf(ObjectLww);
  });

  doc.api.obj([]).set({val: doc.api.builder.jsonVal(123)});

  test('can access object key ValueLww and its contents', () => {
    const register1 = doc.api.r.in().in('val').asVal();
    const register2 = doc.api.val('/val');
    const register3 = doc.api.val(['val']);
    expect(register1).toBeInstanceOf(ValueApi);
    expect(register1.node).toBeInstanceOf(ValueLww);
    expect(register1.node).toBe(register2.node);
    expect(register1.node).toBe(register3.node);
    const const1 = register1.in();
    expect(const1).toBeInstanceOf(ConstApi);
    expect(const1.node).toBeInstanceOf(ConNode);
  });
});
