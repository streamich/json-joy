import {Model} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';

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
  model.api.str(['text']).ins(11, ' this game is awesome');
  const peritext = new Peritext(model, model.api.str(['text']).node, model.api.arr(['slices']).node);
  return {model, peritext};
};

test('initially slice list is empty', () => {
  const {peritext} = setup();
  expect(peritext.slices.size()).toBe(0);
  peritext.refresh();
  expect(peritext.slices.size()).toBe(0);
});

describe('inserts', () => {
  test('can insert a slice', () => {
    const {peritext} = setup();
    const {editor} = peritext;
    editor.setCursor(12, 7);
    const slice = editor.insertSlice('b', {bold: true});
    peritext.refresh();
    expect(peritext.slices.size()).toBe(1);
    expect(slice.start).toStrictEqual(editor.cursor.start);
    expect(slice.end).toStrictEqual(editor.cursor.end);
    expect(slice.data()).toStrictEqual({bold: true});
  });

  test('can insert two slices', () => {
    const {peritext} = setup();
    const {editor} = peritext;
    editor.setCursor(6, 5);
    const slice1 = editor.insertSlice('strong', {bold: true});
    editor.setCursor(12, 4);
    const slice2 = editor.insertSlice('i', {italic: true});
    peritext.refresh();
    expect(peritext.slices.size()).toBe(2);
    expect(slice1.data()).toStrictEqual({bold: true});
    expect(slice2.data()).toStrictEqual({italic: true});
  });

  test('updates hash on slice insert', () => {
    const {peritext} = setup();
    const {editor} = peritext;
    const changed1 = peritext.slices.hash !== peritext.slices.refresh();
    const hash1 = peritext.slices.hash;
    const changed2 = peritext.slices.hash !== peritext.slices.refresh();
    const hash2 = peritext.slices.hash;
    expect(changed1).toBe(true);
    expect(changed2).toBe(false);
    expect(hash1).toBe(hash2);
    editor.setCursor(12, 7);
    editor.insertSlice('b', {bold: true});
    const changed3 = peritext.slices.hash !== peritext.slices.refresh();
    const hash3 = peritext.slices.hash;
    const changed4 = peritext.slices.hash !== peritext.slices.refresh();
    const hash4 = peritext.slices.hash;
    expect(changed3).toBe(true);
    expect(changed4).toBe(false);
    expect(hash1).not.toStrictEqual(hash3);
    expect(hash3).toBe(hash4);
    editor.setCursor(12, 4);
    editor.insertSlice('em', {italic: true});
    const changed5 = peritext.slices.hash !== peritext.slices.refresh();
    const hash5 = peritext.slices.hash;
    const changed6 = peritext.slices.hash !== peritext.slices.refresh();
    const hash6 = peritext.slices.hash;
    expect(changed5).toBe(true);
    expect(changed6).toBe(false);
    expect(hash3).not.toBe(hash5);
    expect(hash5).toBe(hash6);
  });
});

describe('deletes', () => {
  test('can delete a slice', () => {
    const {peritext} = setup();
    const {editor} = peritext;
    editor.setCursor(6, 5);
    const slice1 = editor.insertSlice('b', {bold: true});
    peritext.refresh();
    const hash1 = peritext.slices.hash;
    expect(peritext.slices.size()).toBe(1);
    peritext.delSlice(slice1.id);
    peritext.refresh();
    const hash2 = peritext.slices.hash;
    expect(peritext.slices.size()).toBe(0);
    expect(hash1).not.toBe(hash2);
  });
});

describe('tag changes', () => {
  test('recomputes hash on tag change', () => {
    const {peritext} = setup();
    const {editor} = peritext;
    editor.setCursor(6, 5);
    const slice1 = editor.insertSlice('b', {bold: true});
    peritext.refresh();
    const hash1 = peritext.slices.hash;
    const tag = slice1.data()!;
    peritext.model.api.obj(['slices', 0, 4]).set({bold: false});
    peritext.refresh();
    const hash2 = peritext.slices.hash;
    peritext.refresh();
    const hash3 = peritext.slices.hash;
    expect(hash1).not.toBe(hash2);
    expect(hash2).toBe(hash3);
  });
});
