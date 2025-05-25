import {Model, type ObjApi} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';
import {setupNumbersWithTombstonesKit} from '../../__tests__/setup';
import {Anchor} from '../../rga/constants';
import {SliceStacking} from '../../slice/constants';

const setup = () => {
  const sid = 123456789;
  const model = Model.create(undefined, sid);
  model.api.root({
    text: '',
    slices: [],
    markers: [],
    data: {},
  });
  model.api.str(['text']).ins(0, 'wworld');
  model.api.str(['text']).ins(0, 'helo ');
  model.api.str(['text']).ins(2, 'l');
  model.api.str(['text']).del(7, 1);
  const peritext = new Peritext(model, model.api.str(['text']).node, model.api.arr(['slices']).node, model.api.obj(['data']));
  return {model, peritext};
};

type Kit = ReturnType<typeof setup>;

describe('Overlay.refresh()', () => {
  test('can select all text using relative range', () => {
    const {peritext, editor} = setupNumbersWithTombstonesKit();
    const overlay = peritext.overlay;
    const range = peritext.range(peritext.pointStart()!, peritext.pointEnd()!);
    editor.cursor.setRange(range);
    peritext.refresh();
    expect(editor.cursor.text()).toBe('0123456789');
    const overlayPoints = [...overlay.points()];
    expect(overlayPoints.length).toBe(2);
    expect(overlayPoints[0].id.time).toBe(editor.cursor.start.id.time);
    expect(overlayPoints[1].id.time).toBe(editor.cursor.end.id.time);
  });

  test('can select all text using absolute range', () => {
    const {peritext, editor} = setupNumbersWithTombstonesKit();
    const overlay = peritext.overlay;
    const range = peritext.range(peritext.pointAbsStart(), peritext.pointAbsEnd());
    editor.cursor.setRange(range);
    peritext.refresh();
    expect(editor.cursor.text()).toBe('0123456789');
    const overlayPoints = [...overlay.points()];
    expect(overlayPoints.length).toBe(2);
    expect(overlayPoints[0].id.time).toBe(editor.cursor.start.id.time);
    expect(overlayPoints[1].id.time).toBe(editor.cursor.end.id.time);
  });

  const testRefresh = (name: string, update: (kit: Kit, refresh: () => void) => void) => {
    test(name, () => {
      const kit = setup();
      const overlay = kit.peritext.overlay;
      let hash1: number | undefined, hash2: number | undefined, hash3: number | undefined;
      update(kit, () => {
        hash1 = overlay.refresh();
        hash2 = overlay.refresh();
        hash3 = overlay.refresh();
      });
      const hash4 = overlay.refresh();
      const hash5 = overlay.refresh();
      const hash6 = overlay.refresh();
      expect(hash1).toBe(hash2);
      expect(hash2).toBe(hash3);
      expect(hash3).not.toBe(hash4);
      expect(hash4).toBe(hash5);
      expect(hash5).toBe(hash6);
    });
  };

  describe('saved slices', () => {
    describe('updates hash', () => {
      testRefresh('when a slice is inserted', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(1, 4);
        refresh();
        kit.peritext.editor.saved.insStack('bold');
      });

      testRefresh('when a collapsed slice is inserted', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(5);
        refresh();
        kit.peritext.editor.saved.insStack('<flag>');
      });

      testRefresh('when a marker is inserted', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(0);
        refresh();
        kit.peritext.editor.saved.insMarker('<paragraph>');
      });

      testRefresh('when a marker is inserted at the same position', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(0);
        kit.peritext.editor.saved.insMarker('<paragraph>');
        refresh();
        kit.peritext.editor.saved.insMarker('<paragraph>');
      });

      testRefresh('when slice is deleted', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(0, 1);
        const [slice] = kit.peritext.editor.saved.insStack('<b>');
        refresh();
        kit.peritext.savedSlices.del(slice.id);
      });

      testRefresh('when slice type is changed', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(0, 1);
        const [slice] = kit.peritext.editor.saved.insStack('<b>');
        refresh();
        slice.update({type: '<i>'});
      });

      testRefresh('when slice behavior is changed', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(0, 1);
        const [slice] = kit.peritext.editor.saved.insStack(123);
        refresh();
        slice.update({stacking: SliceStacking.Erase});
      });

      testRefresh('when slice data is overwritten', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(0, 1);
        const [slice] = kit.peritext.editor.saved.insStack(123, 'a');
        refresh();
        slice.update({data: 'b'});
      });

      testRefresh('when slice data is updated inline', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(0, 1);
        const [slice] = kit.peritext.editor.saved.insStack(123, {foo: 'bar'});
        refresh();
        const api = slice.dataNode()! as ObjApi<any>;
        api.set({foo: 'baz'});
      });

      testRefresh('when slice start point anchor is changed', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(0, 1);
        const [slice] = kit.peritext.editor.saved.insStack(123, 456);
        expect(slice.start.anchor).toBe(Anchor.Before);
        refresh();
        const range = slice.range();
        range.start.anchor = Anchor.After;
        slice.update({range});
      });

      testRefresh('when slice end point anchor is changed', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(3, 3);
        const [slice] = kit.peritext.editor.saved.insStack(0, 0);
        expect(slice.end.anchor).toBe(Anchor.After);
        refresh();
        const range = slice.range();
        range.end.anchor = Anchor.Before;
        slice.update({range});
      });

      testRefresh('when slice range changes', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(3, 3);
        kit.peritext.editor.saved.insStack(0, 0);
        kit.peritext.editor.saved.insStack(1, 1);
        kit.peritext.editor.saved.insStack(3, 3);
        const range1 = kit.peritext.rangeAt(1, 2);
        const slice = kit.peritext.savedSlices.insErase(range1, 'gg');
        expect(slice.end.anchor).toBe(Anchor.After);
        refresh();
        const range2 = kit.peritext.rangeAt(2, 2);
        slice.update({range: range2});
      });
    });
  });

  describe('extra slices', () => {
    describe('updates hash', () => {
      testRefresh('when a slice is inserted', (kit, refresh) => {
        const range = kit.peritext.rangeAt(1, 4);
        refresh();
        kit.peritext.extraSlices.insOne(range, 'bold');
      });

      testRefresh('when a collapsed slice is inserted', (kit, refresh) => {
        const range = kit.peritext.rangeAt(5);
        refresh();
        kit.peritext.extraSlices.insStack(range, '<flag>');
      });

      testRefresh('when a marker is inserted', (kit, refresh) => {
        const range = kit.peritext.rangeAt(0);
        refresh();
        kit.peritext.extraSlices.insMarker(range, '<paragraph>');
      });

      testRefresh('when a marker is inserted at the same position', (kit, refresh) => {
        const range = kit.peritext.rangeAt(0);
        kit.peritext.extraSlices.insMarker(range, '<paragraph>');
        refresh();
        kit.peritext.extraSlices.insMarker(range, '<paragraph>');
      });

      testRefresh('when slice is deleted', (kit, refresh) => {
        const range = kit.peritext.rangeAt(0, 1);
        const slice = kit.peritext.extraSlices.insMarker(range, '<b>');
        refresh();
        kit.peritext.extraSlices.del(slice.id);
      });

      testRefresh('when slice type is changed', (kit, refresh) => {
        const range = kit.peritext.rangeAt(0, 1);
        const slice = kit.peritext.extraSlices.insStack(range, '<b>');
        refresh();
        slice.update({type: '<i>'});
      });

      testRefresh('when slice behavior is changed', (kit, refresh) => {
        const range = kit.peritext.rangeAt(2, 7);
        const slice = kit.peritext.extraSlices.insStack(range, 123);
        refresh();
        slice.update({stacking: SliceStacking.Erase});
      });

      testRefresh('when slice data is overwritten', (kit, refresh) => {
        const range = kit.peritext.rangeAt(2, 7);
        const slice = kit.peritext.extraSlices.insStack(range, 123, 'a');
        refresh();
        slice.update({data: 'b'});
      });

      testRefresh('when slice data is updated inline', (kit, refresh) => {
        const range = kit.peritext.rangeAt(1, 1);
        const slice = kit.peritext.extraSlices.insStack(range, 123, {foo: 'bar'});
        refresh();
        const api = slice.dataNode()! as ObjApi<any>;
        api.set({foo: 'baz'});
      });

      testRefresh('when slice start point anchor is changed', (kit, refresh) => {
        const range = kit.peritext.rangeAt(0, 1);
        const slice = kit.peritext.extraSlices.insStack(range, 123, 456);
        expect(slice.start.anchor).toBe(Anchor.Before);
        refresh();
        const range2 = slice.range();
        range2.start.anchor = Anchor.After;
        slice.update({range: range2});
      });

      testRefresh('when slice end point anchor is changed', (kit, refresh) => {
        const range = kit.peritext.rangeAt(3, 3);
        const slice = kit.peritext.extraSlices.insStack(range, 0, 0);
        expect(slice.end.anchor).toBe(Anchor.After);
        refresh();
        const range2 = slice.range();
        range2.end.anchor = Anchor.Before;
        slice.update({range: range2});
      });

      testRefresh('when slice range changes', (kit, refresh) => {
        const range = kit.peritext.rangeAt(3, 3);
        kit.peritext.extraSlices.insStack(range, 0, 0);
        kit.peritext.extraSlices.insStack(range, 1, 1);
        kit.peritext.extraSlices.insStack(range, 3, 3);
        const range1 = kit.peritext.rangeAt(1, 2);
        const slice = kit.peritext.extraSlices.insErase(range1, 'gg');
        expect(slice.end.anchor).toBe(Anchor.After);
        refresh();
        const range2 = kit.peritext.rangeAt(2, 2);
        slice.update({range: range2});
      });
    });
  });

  describe('local slices - cursor', () => {
    describe('updates hash', () => {
      testRefresh('when cursor start anchor changes', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(3, 3);
        expect(kit.peritext.editor.cursor.start.anchor).toBe(Anchor.Before);
        refresh();
        const start = kit.peritext.editor.cursor.start.clone();
        start.anchor = Anchor.After;
        kit.peritext.editor.cursor.setRange(kit.peritext.range(start, kit.peritext.editor.cursor.end));
      });

      testRefresh('when cursor end anchor changes', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(3, 3);
        expect(kit.peritext.editor.cursor.end.anchor).toBe(Anchor.After);
        refresh();
        const end = kit.peritext.editor.cursor.start.clone();
        end.anchor = Anchor.Before;
        kit.peritext.editor.cursor.setRange(kit.peritext.range(kit.peritext.editor.cursor.start, end));
      });

      testRefresh('when cursor data changes', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(3, 3);
        const slice = kit.peritext.editor.cursor;
        slice.update({data: {a: 'b'}});
        refresh();
        const api = slice.dataNode()! as ObjApi<any>;
        api.set({a: 'c'});
      });
    });
  });

  describe('text contents', () => {
    describe('updates hash', () => {
      testRefresh('when the first character is deleted and reinserted', (kit, refresh) => {
        const index = 0;
        const str = kit.peritext.strApi();
        const char = str.view()[index];
        const view = str.view();
        refresh();
        kit.peritext.strApi().del(index, 1);
        kit.peritext.strApi().ins(index, char);
        expect(str.view()).toEqual(view);
      });

      testRefresh('when the last character is deleted and reinserted', (kit, refresh) => {
        const index = kit.peritext.strApi().view().length - 1;
        const str = kit.peritext.strApi();
        const char = str.view()[index];
        const view = str.view();
        refresh();
        kit.peritext.strApi().del(index, 1);
        kit.peritext.strApi().ins(index, char);
        expect(str.view()).toEqual(view);
      });

      testRefresh('when the third character is reinserted', (kit, refresh) => {
        const index = 3;
        const str = kit.peritext.strApi();
        const char = str.view()[index];
        const view = str.view();
        refresh();
        kit.peritext.strApi().del(index, 1);
        kit.peritext.strApi().ins(index, char);
        expect(str.view()).toEqual(view);
      });
    });
  });
});
