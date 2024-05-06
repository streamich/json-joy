import {Model} from '../../../../json-crdt/model';
import {size} from 'sonic-forest/lib/util';
import {Peritext} from '../../Peritext';
import {Anchor} from '../../rga/constants';

describe('.getOrNextLower()', () => {
  test('combines overlay points - right anchor', () => {
    const model = Model.create();
    const api = model.api;
    api.root({
      text: '1234',
      slices: [],
    });
    const peritext = new Peritext(model, api.str(['text']).node, api.arr(['slices']).node);
    peritext.editor.cursor.setAt(1, 1);
    peritext.editor.saved.insStack(2);
    peritext.refresh();
    const str = peritext.str;
    const id1 = str.find(1)!;
    const id2 = str.find(2)!;
    const p1 = peritext.point(id1, Anchor.After);
    const p2 = peritext.point(id2, Anchor.After);
    peritext.editor.cursor.set(p1, p2);
    peritext.editor.saved.insStack(3);
    peritext.refresh();
    const cnt = size(peritext.overlay.root);
    expect(cnt).toBe(3);
  });

  test('combines overlay points - right anchor 2', () => {
    const model = Model.create();
    const api = model.api;
    api.root({
      text: '1234',
      slices: [],
    });
    const peritext = new Peritext(model, api.str(['text']).node, api.arr(['slices']).node);
    const str = peritext.str;
    const id1 = str.find(1)!;
    const id2 = str.find(2)!;
    const p1 = peritext.point(id1, Anchor.After);
    const p2 = peritext.point(id2, Anchor.After);
    peritext.editor.cursor.set(p1, p2);
    peritext.editor.saved.insStack(3);
    peritext.refresh();
    peritext.editor.cursor.setAt(2, 1);
    peritext.editor.saved.insStack(33);
    peritext.refresh();
    const cnt = size(peritext.overlay.root);
    expect(cnt).toBe(3);
  });
});

describe('.getOrNextHigher()', () => {
  test('can iterate through all character points', () => {
    const model = Model.create();
    const api = model.api;
    api.root({
      text: '1234',
      slices: [],
    });
    const peritext = new Peritext(model, api.str(['text']).node, api.arr(['slices']).node);
    const editor = peritext.editor;
    editor.cursor.setAt(0, 1);
    const [slice1] = editor.saved.insStack(1);
    editor.cursor.setAt(1, 1);
    const [slice2] = editor.saved.insStack(2);
    editor.cursor.setAt(2, 1);
    const [slice3] = editor.saved.insStack(3);
    editor.cursor.setAt(3, 1);
    const [slice4] = editor.saved.insStack(4);
    peritext.refresh();
    let overlayPoint = peritext.overlay.getOrNextHigher(slice4.end)!;
    expect(overlayPoint.layers.length).toBe(0);
    overlayPoint = peritext.overlay.getOrNextHigher(slice4.start)!;
    expect(overlayPoint.layers.length).toBe(2);
    overlayPoint = peritext.overlay.getOrNextHigher(slice3.end)!;
    expect(overlayPoint.layers.length).toBe(0);
    overlayPoint = peritext.overlay.getOrNextHigher(slice3.start)!;
    expect(overlayPoint.layers.length).toBe(1);
    expect(overlayPoint.layers[0]).toBe(slice3);
    overlayPoint = peritext.overlay.getOrNextHigher(slice2.end)!;
    expect(overlayPoint.layers.length).toBe(0);
    overlayPoint = peritext.overlay.getOrNextHigher(slice2.start)!;
    expect(overlayPoint.layers.length).toBe(1);
    expect(overlayPoint.layers[0]).toBe(slice2);
    overlayPoint = peritext.overlay.getOrNextHigher(slice1.end)!;
    expect(overlayPoint.layers.length).toBe(0);
    overlayPoint = peritext.overlay.getOrNextHigher(slice1.start)!;
    expect(overlayPoint.layers.length).toBe(1);
    expect(overlayPoint.layers[0]).toBe(slice1);
  });
});
