import {Model} from '../../../../json-crdt/model';
import {size} from 'sonic-forest/lib/util';
import {Peritext} from '../../Peritext';
import {Anchor} from '../../rga/constants';
import {setupNumbersWithTombstones} from '../../__tests__/setup';
import {OverlayPoint} from '../OverlayPoint';
import {OverlayRefSliceEnd, OverlayRefSliceStart} from '../refs';

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
    let overlayPoint = peritext.overlay.getOrNextLower(slice1.start)!;
    expect(overlayPoint.layers.length).toBe(1);
    expect(overlayPoint.layers[0]).toBe(slice1);
    overlayPoint = peritext.overlay.getOrNextLower(slice1.end)!;
    expect(overlayPoint.layers.length).toBe(0);
    overlayPoint = peritext.overlay.getOrNextLower(slice2.start)!;
    expect(overlayPoint.layers.length).toBe(1);
    expect(overlayPoint.layers[0]).toBe(slice2);
    overlayPoint = peritext.overlay.getOrNextLower(slice2.end)!;
    expect(overlayPoint.layers.length).toBe(0);
    overlayPoint = peritext.overlay.getOrNextLower(slice3.start)!;
    expect(overlayPoint.layers.length).toBe(1);
    expect(overlayPoint.layers[0]).toBe(slice3);
    overlayPoint = peritext.overlay.getOrNextLower(slice3.end)!;
    expect(overlayPoint.layers.length).toBe(0);
    overlayPoint = peritext.overlay.getOrNextLower(slice4.start)!;
    expect(overlayPoint.layers.length).toBe(2);
    overlayPoint = peritext.overlay.getOrNextLower(slice4.end)!;
    expect(overlayPoint.layers.length).toBe(0);
  });

  describe('when all text selected, using relative range', () => {
    test('can select the starting point', () => {
      const {peritext, editor} = setupNumbersWithTombstones();
      const range = peritext.range(peritext.pointStart()!, peritext.pointEnd()!);
      editor.cursor.setRange(range);
      peritext.refresh();
      const overlayPoint = peritext.overlay.getOrNextLower(peritext.pointAbsStart())!;
      expect(overlayPoint).toBeInstanceOf(OverlayPoint);
      expect(overlayPoint.refs.length).toBe(1);
      expect(overlayPoint.refs[0]).toEqual(new OverlayRefSliceEnd(editor.cursor));
      expect(overlayPoint.layers.length).toBe(1);
      expect(overlayPoint.layers[0]).toEqual(editor.cursor);
    });

    test('can select the ending point', () => {
      const {peritext, editor} = setupNumbersWithTombstones();
      const range = peritext.range(peritext.pointStart()!, peritext.pointEnd()!);
      editor.cursor.setRange(range);
      peritext.refresh();
      const overlayPoint = peritext.overlay.getOrNextLower(peritext.pointAbsEnd())!;
      expect(overlayPoint).toBeInstanceOf(OverlayPoint);
      expect(overlayPoint.refs.length).toBe(1);
      expect(overlayPoint.refs[0]).toEqual(new OverlayRefSliceStart(editor.cursor));
    });
  });

  describe('when all text selected, using absolute range', () => {
    test('can select the starting point', () => {
      const {peritext, editor} = setupNumbersWithTombstones();
      const range = peritext.range(peritext.pointAbsStart(), peritext.pointAbsEnd());
      editor.cursor.setRange(range);
      peritext.refresh();
      const overlayPoint = peritext.overlay.getOrNextLower(peritext.pointAbsStart())!;
      expect(overlayPoint).toBeInstanceOf(OverlayPoint);
      expect(overlayPoint.refs.length).toBe(1);
      expect(overlayPoint.refs[0]).toEqual(new OverlayRefSliceEnd(editor.cursor));
      expect(overlayPoint.layers.length).toBe(1);
      expect(overlayPoint.layers[0]).toEqual(editor.cursor);
    });

    test('can select the end point', () => {
      const {peritext, editor} = setupNumbersWithTombstones();
      const range = peritext.range(peritext.pointAbsStart(), peritext.pointAbsEnd());
      editor.cursor.setRange(range);
      peritext.refresh();
      const overlayPoint = peritext.overlay.getOrNextHigher(peritext.pointAbsStart()!)!;
      expect(overlayPoint).toBeInstanceOf(OverlayPoint);
      expect(overlayPoint.refs.length).toBe(1);
      expect(overlayPoint.refs[0]).toEqual(new OverlayRefSliceStart(editor.cursor));
      expect(overlayPoint.layers.length).toBe(1);
      expect(overlayPoint.layers[0]).toEqual(editor.cursor);
    });
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

  describe('when all text selected, using relative range', () => {
    test('can select the ending point', () => {
      const {peritext, editor} = setupNumbersWithTombstones();
      const range = peritext.range(peritext.pointStart()!, peritext.pointEnd()!);
      editor.cursor.setRange(range);
      peritext.refresh();
      const overlayPoint = peritext.overlay.getOrNextHigher(peritext.pointAbsEnd())!;
      expect(overlayPoint).toBeInstanceOf(OverlayPoint);
      expect(overlayPoint.refs.length).toBe(1);
      expect(overlayPoint.refs[0]).toEqual(new OverlayRefSliceEnd(editor.cursor));
    });

    test('can select the start point', () => {
      const {peritext, editor} = setupNumbersWithTombstones();
      const range = peritext.range(peritext.pointStart()!, peritext.pointEnd()!);
      editor.cursor.setRange(range);
      peritext.refresh();
      const overlayPoint = peritext.overlay.getOrNextHigher(peritext.pointAbsStart()!)!;
      expect(overlayPoint).toBeInstanceOf(OverlayPoint);
      expect(overlayPoint.refs.length).toBe(1);
      expect(overlayPoint.refs[0]).toEqual(new OverlayRefSliceStart(editor.cursor));
      expect(overlayPoint.layers.length).toBe(1);
      expect(overlayPoint.layers[0]).toEqual(editor.cursor);
    });
  });

  describe('when all text selected, using absolute range', () => {
    test('can select the ending point', () => {
      const {peritext, editor} = setupNumbersWithTombstones();
      const range = peritext.range(peritext.pointAbsStart(), peritext.pointAbsEnd());
      editor.cursor.setRange(range);
      peritext.refresh();
      const overlayPoint = peritext.overlay.getOrNextHigher(peritext.pointAbsEnd())!;
      expect(overlayPoint).toBeInstanceOf(OverlayPoint);
      expect(overlayPoint.refs.length).toBe(1);
      expect(overlayPoint.refs[0]).toEqual(new OverlayRefSliceEnd(editor.cursor));
    });

    test('can select the start point', () => {
      const {peritext, editor} = setupNumbersWithTombstones();
      const range = peritext.range(peritext.pointAbsStart(), peritext.pointAbsEnd());
      editor.cursor.setRange(range);
      peritext.refresh();
      const overlayPoint = peritext.overlay.getOrNextHigher(peritext.pointAbsStart()!)!;
      expect(overlayPoint).toBeInstanceOf(OverlayPoint);
      expect(overlayPoint.refs.length).toBe(1);
      expect(overlayPoint.refs[0]).toEqual(new OverlayRefSliceStart(editor.cursor));
      expect(overlayPoint.layers.length).toBe(1);
      expect(overlayPoint.layers[0]).toEqual(editor.cursor);
    });
  });
});
