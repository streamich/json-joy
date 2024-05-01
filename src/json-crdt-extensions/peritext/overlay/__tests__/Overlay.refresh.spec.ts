import {Model, ObjApi} from '../../../../json-crdt/model';
import {Peritext} from '../../Peritext';
import {Anchor} from '../../rga/constants';
import {SliceBehavior} from '../../slice/constants';

const setup = () => {
  const sid = 123456789;
  const model = Model.withLogicalClock(sid);
  model.api.root({
    text: '',
    slices: [],
    markers: [],
  });
  model.api.str(['text']).ins(0, 'wworld');
  model.api.str(['text']).ins(0, 'helo ');
  model.api.str(['text']).ins(2, 'l');
  model.api.str(['text']).del(7, 1);
  const peritext = new Peritext(model, model.api.str(['text']).node, model.api.arr(['slices']).node);
  return {model, peritext};
};

type Kit = ReturnType<typeof setup>;

describe('Overlay.refresh()', () => {
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

  describe('slices', () => {
    describe('updates hash', () => {
      testRefresh('when a slice is inserted', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(1, 4);
        refresh();
        kit.peritext.editor.insStackSlice('bold');
      });

      testRefresh('when a collapsed slice is inserted', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(5);
        refresh();
        kit.peritext.editor.insStackSlice('<flag>');
      });

      testRefresh('when a marker is inserted', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(0);
        refresh();
        kit.peritext.editor.insMarker('<paragraph>');
      });

      testRefresh('when a marker is inserted at the same position', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(0);
        kit.peritext.editor.insMarker('<paragraph>');
        refresh();
        kit.peritext.editor.insMarker('<paragraph>');
      });

      testRefresh('when slice is deleted', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(0, 1);
        const slice = kit.peritext.editor.insStackSlice('<b>');
        refresh();
        kit.peritext.savedSlices.del(slice.id);
      });

      testRefresh('when slice type is changed', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(0, 1);
        const slice = kit.peritext.editor.insStackSlice('<b>');
        refresh();
        slice.update({type: '<i>'});
      });

      testRefresh('when slice behavior is changed', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(0, 1);
        const slice = kit.peritext.editor.insStackSlice(123);
        refresh();
        slice.update({behavior: SliceBehavior.Erase});
      });

      testRefresh('when slice data is overwritten', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(0, 1);
        const slice = kit.peritext.editor.insStackSlice(123, 'a');
        refresh();
        slice.update({data: 'b'});
      });

      testRefresh('when slice data is updated inline', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(0, 1);
        const slice = kit.peritext.editor.insStackSlice(123, {foo: 'bar'});
        refresh();
        const api = slice.dataNode()! as ObjApi;
        api.set({foo: 'baz'});
      });

      testRefresh('when slice start point anchor is changed', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(0, 1);
        const slice = kit.peritext.editor.insStackSlice(123, 456);
        expect(slice.start.anchor).toBe(Anchor.Before);
        refresh();
        const range = slice.range();
        range.start.anchor = Anchor.After;
        slice.update({range});
      });

      testRefresh('when slice end point anchor is changed', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(3, 3);
        const slice = kit.peritext.editor.insStackSlice(0, 0);
        expect(slice.end.anchor).toBe(Anchor.After);
        refresh();
        const range = slice.range();
        range.end.anchor = Anchor.Before;
        slice.update({range});
      });

      testRefresh('when slice range changes', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(3, 3);
        kit.peritext.editor.insStackSlice(0, 0);
        kit.peritext.editor.insStackSlice(1, 1);
        kit.peritext.editor.insStackSlice(3, 3);
        const range1 = kit.peritext.rangeAt(1, 2);
        const slice = kit.peritext.savedSlices.insErase(range1, 'gg');
        expect(slice.end.anchor).toBe(Anchor.After);
        refresh();
        const range2 = kit.peritext.rangeAt(2, 2);
        slice.update({range: range2});
      });
    });
  });

  describe('cursor', () => {
    describe('updates hash', () => {
      testRefresh('when cursor char ID changes', (kit, refresh) => {
        kit.peritext.editor.cursor.setAt(1);
        refresh();
        kit.peritext.editor.cursor.setAt(1);
      });

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
    });
  });
});
