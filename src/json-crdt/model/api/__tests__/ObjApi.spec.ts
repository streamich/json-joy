import {s} from '../../../../json-crdt-patch';
import {Model} from '../../Model';

test('can insert a value and delete all previous ones', () => {
  const doc = Model.create(s.obj({
    id: s.str('test'),
    x: s.con(1),
    y: s.con(2),
  }));
  const obj = doc.s.toApi();
  const events = obj.events;
  const x = events.keyGetter('x');
  const a: number = x();
  expect(a).toBe(1);
});
