import {Model} from '../../../../json-crdt/model';
import {size} from 'sonic-forest/lib/util';
import {Peritext} from '../../Peritext';
import {Anchor} from '../../rga/constants';

describe('.getOrNextLower()', () => {
  test('combines overlay points - right anchor', () => {
    const model = Model.withLogicalClock();
    const api = model.api;
    api.root({
      text: '1234',
      slices: [],
    });
    const peritext = new Peritext(model, api.str(['text']).node, api.arr(['slices']).node);
    peritext.editor.cursor.setAt(1, 1);
    peritext.editor.insStackSlice(2);
    peritext.refresh();
    const str = peritext.str;
    const id1 = str.find(1)!;
    const id2 = str.find(2)!;
    const p1 = peritext.point(id1, Anchor.After);
    const p2 = peritext.point(id2, Anchor.After);
    peritext.editor.cursor.set(p1, p2);
    peritext.editor.insStackSlice(3);
    peritext.refresh();
    const cnt = size(peritext.overlay.root);
    expect(cnt).toBe(3);
  });

  test('combines overlay points - right anchor 2', () => {
    const model = Model.withLogicalClock();
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
    peritext.editor.insStackSlice(3);
    peritext.refresh();
    peritext.editor.cursor.setAt(2, 1);
    peritext.editor.insStackSlice(33);
    peritext.refresh();
    const cnt = size(peritext.overlay.root);
    expect(cnt).toBe(3);
  });
});
