import {Model} from '../../../json-crdt/model';
import {size} from 'sonic-forest/lib/util';
import {Peritext} from '../Peritext';

const setup = () => {
  const model = Model.withLogicalClock();
  model.api.root({
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

test('can insert markers', () => {
  const {peritext} = setup();
  const {editor} = peritext;
  expect(size(peritext.overlay.root)).toBe(0);
  editor.setCursor(0);
  editor.insMarker(['p'], '<p>');
  peritext.refresh();
  expect(size(peritext.overlay.root)).toBe(1);
  editor.setCursor(9);
  editor.insMarker(['p'], '<p>');
  peritext.refresh();
  expect(size(peritext.overlay.root)).toBe(3);
});

test('can insert slices', () => {
  const {peritext} = setup();
  const {editor} = peritext;
  expect(size(peritext.overlay.root)).toBe(0);
  editor.setCursor(2, 2);
  editor.insertSlice('bold');
  peritext.refresh();
  expect(size(peritext.overlay.root)).toBe(2);
  editor.setCursor(6, 5);
  editor.insertSlice('italic');
  peritext.refresh();
  expect(size(peritext.overlay.root)).toBe(4);
  editor.setCursor(0, 5);
  editor.insertSlice('underline');
  peritext.refresh();
  expect(size(peritext.overlay.root)).toBe(6);
});
