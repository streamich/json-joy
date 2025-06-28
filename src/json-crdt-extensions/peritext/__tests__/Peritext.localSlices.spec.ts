import {Model} from '../../../json-crdt/model';
import {Peritext} from '../Peritext';

const setup = () => {
  const model = Model.withLogicalClock();
  model.api.set({
    text: '',
    slices: [],
  });
  model.api.str(['text']).ins(0, 'wworld');
  model.api.str(['text']).ins(0, 'helo ');
  model.api.str(['text']).ins(2, 'l');
  model.api.str(['text']).del(7, 1);
  const peritext = new Peritext(model, model.api.str(['text']).node, model.api.arr(['slices']).node);
  return {model, peritext};
};

test('clears change history', () => {
  const {peritext} = setup();
  const {editor} = peritext;
  editor.cursor.setAt(0);
  editor.cursor.setAt(1);
  editor.cursor.setAt(2);
  editor.cursor.setAt(3);
  expect(peritext.localSlices.set.doc.api.flush().ops.length).toBe(0);
});

test('clears slice set tombstones', () => {
  const _random = Math.random;
  // It is probabilistic, if we set `Math.random` to 0 it will always remove tombstones.
  Math.random = () => 0;
  const {peritext} = setup();
  const slicesRga = peritext.localSlices.set.doc.root.node()!.get(0)!;
  const count = slicesRga.size();
  const slice1 = peritext.localSlices.insOne(peritext.rangeAt(1, 2), 1);
  const slice2 = peritext.localSlices.insOne(peritext.rangeAt(1, 2), 3);
  const slice3 = peritext.localSlices.insOne(peritext.rangeAt(1, 2), 2);
  expect(slicesRga.size()).toBe(count + 3);
  peritext.localSlices.del(slice2.id);
  expect(slicesRga.size()).toBe(count + 2);
  peritext.localSlices.del(slice1.id);
  expect(slicesRga.size()).toBe(count + 1);
  peritext.localSlices.del(slice3.id);
  expect(slicesRga.size()).toBe(count);
  Math.random = _random;
});
