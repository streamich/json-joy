import {type Kit, runAlphabetKitTestSuite} from '../../../../json-crdt-extensions/peritext/__tests__/setup';
import {ArrApi, ObjApi} from '../../../../json-crdt/model';
import {SliceTypeCon} from '../../slice/constants';
import {getEventsKit} from './setup';

const testSuite = (getKit: () => Kit) => {
  const setup = () => getEventsKit(getKit);

  describe('"ins" action', () => {
    test('can mark text as bold', () => {
      const kit = setup();
      kit.et.cursor({at: [3, 6]});
      kit.et.format({action: 'ins', type: SliceTypeCon.b});
      const html = kit.toHtml();
      expect(html).toBe('<p>abc<b>def</b>ghijklmnopqrstuvwxyz</p>');
    });

    test('can insert formatting with data', () => {
      const kit = setup();
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.col, data: {color: 'red'}});
      expect(kit.toHtml()).toBe('<p>abcdefghij<col data-attr=\'{"color":"red"}\'>klmnopqrst</col>uvwxyz</p>');
    });
  });

  describe('"erase" action', () => {
    test('inverts part of formatting', () => {
      const kit = setup();
      kit.et.cursor({at: [5, 10]});
      kit.et.format({action: 'ins', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>abcde<b>fghij</b>klmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(1);
      kit.et.cursor({at: [7, 9]});
      kit.et.format({action: 'erase'});
      expect(kit.toHtml()).toBe('<p>abcde<b>fg</b>hi<b>j</b>klmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(2);
    });

    test('removes entire formatting slice when cointained', () => {
      const kit = setup();
      kit.et.cursor({at: [5, 10]});
      kit.et.format({action: 'ins', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>abcde<b>fghij</b>klmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(1);
      kit.et.cursor({at: [4, 11]});
      kit.et.format({action: 'erase'});
      expect(kit.toHtml()).toBe('<p>abcdefghijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(0);
    });

    test('can "erase" all formatting for two overlapping formattings', () => {
      const kit = setup();
      kit.et.cursor({at: [5, 15]});
      kit.et.format({action: 'ins', type: SliceTypeCon.b});
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.i});
      expect(kit.toHtml()).toBe('<p>abcde<b>fghij</b><i><b>klmno</b></i><i>pqrst</i>uvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(2);
      kit.et.cursor({at: [11, 13]});
      kit.et.format({action: 'erase'});
      expect(kit.toHtml()).toBe('<p>abcde<b>fghij</b><i><b>k</b></i>lm<i><b>no</b></i><i>pqrst</i>uvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(4);
    });

    test('can "erase" specific formatting type', () => {
      const kit = setup();
      kit.et.cursor({at: [5, 15]});
      kit.et.format({action: 'ins', type: SliceTypeCon.b});
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.i});
      expect(kit.toHtml()).toBe('<p>abcde<b>fghij</b><i><b>klmno</b></i><i>pqrst</i>uvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(2);
      kit.et.cursor({at: [11, 13]});
      kit.et.format({action: 'erase', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>abcde<b>fghij</b><i><b>k</b></i><i>lm</i><i><b>no</b></i><i>pqrst</i>uvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(3);
    });
  });

  describe('"del" action', () => {
    test('deletes all intersecting formattings', () => {
      const kit = setup();
      kit.et.cursor({at: [5, 15]});
      kit.et.format({action: 'ins', type: SliceTypeCon.b});
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.i});
      expect(kit.toHtml()).toBe('<p>abcde<b>fghij</b><i><b>klmno</b></i><i>pqrst</i>uvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(2);
      kit.et.cursor({at: [11, 13]});
      kit.et.format({action: 'del'});
      expect(kit.toHtml()).toBe('<p>abcdefghijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(0);
    });

    test('delete specific PersistedSlice', () => {
      const kit = setup();
      kit.et.cursor({at: [5, 15]});
      kit.et.format({action: 'ins', type: SliceTypeCon.b});
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.i});
      kit.et.cursor({at: [0]});
      expect(kit.toHtml()).toBe('<p>abcde<b>fghij</b><i><b>klmno</b></i><i>pqrst</i>uvwxyz</p>');
      const slice = kit.peritext.savedSlices.each().find((slice) => slice.type() === SliceTypeCon.i);
      kit.et.cursor({clear: true});
      kit.et.format({action: 'del', slice});
      expect(kit.toHtml()).toBe('<p>abcde<b>fghijklmno</b>pqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(1);
    });

    test('delete specific PersistedSlice by ID', () => {
      const kit = setup();
      kit.et.cursor({at: [5, 15]});
      kit.et.format({action: 'ins', type: SliceTypeCon.b});
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.i});
      kit.et.cursor({at: [0]});
      expect(kit.toHtml()).toBe('<p>abcde<b>fghij</b><i><b>klmno</b></i><i>pqrst</i>uvwxyz</p>');
      const slice = kit.peritext.savedSlices.each().find((slice) => slice.type() === SliceTypeCon.b)!;
      kit.et.cursor({clear: true});
      kit.et.format({action: 'del', slice: slice!.id});
      expect(kit.toHtml()).toBe('<p>abcdefghij<i>klmnopqrst</i>uvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(1);
    });
  });

  describe('"tog" action', () => {
    test('can toggle annotation', () => {
      const kit = setup();
      expect(kit.toHtml()).toBe('<p>abcdefghijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(0);
      kit.et.cursor({at: [3, 6]});
      kit.et.format({action: 'tog', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>abc<b>def</b>ghijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(1);
      kit.et.cursor({at: [3, 6]});
      kit.et.format({action: 'tog', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>abcdefghijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(0);
      kit.et.cursor({at: [3, 6]});
      kit.et.format({action: 'tog', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>abc<b>def</b>ghijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(1);
    });

    test('can toggle inside an annotation', () => {
      const kit = setup();
      expect(kit.toHtml()).toBe('<p>abcdefghijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(0);
      kit.et.cursor({at: [2, 7]});
      kit.et.format({action: 'tog', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>ab<b>cdefg</b>hijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(1);
      kit.et.cursor({at: [3, 6]});
      kit.et.format({action: 'tog', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>ab<b>c</b>def<b>g</b>hijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(2);
      kit.et.cursor({at: [3, 6]});
      kit.et.format({action: 'tog', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>ab<b>c</b><b>def</b><b>g</b>hijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(2);
      kit.et.cursor({at: [3, 6]});
      kit.et.format({action: 'tog', type: SliceTypeCon.b});
      expect(kit.toHtml()).toBe('<p>ab<b>c</b>def<b>g</b>hijklmnopqrstuvwxyz</p>');
      expect(kit.peritext.savedSlices.size()).toBe(2);
    });
  });

  describe('"upd" action', () => {
    test('can diff an "obj" node', () => {
      const kit = setup();
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.col, data: {color: 'green', opacity: 0.5}});
      expect(kit.toHtml()).toBe(
        '<p>abcdefghij<col data-attr=\'{"color":"green","opacity":0.5}\'>klmnopqrst</col>uvwxyz</p>',
      );
      const slice = kit.peritext.savedSlices.each().find((slice) => slice.type() === SliceTypeCon.col)!;
      expect(slice.data()).toEqual({color: 'green', opacity: 0.5});
      kit.et.format({action: 'upd', slice, data: {color: 'green', opacity: 1}});
      expect(slice.data()).toEqual({color: 'green', opacity: 1});
    });

    test('can overwrite a non-"obj" node', () => {
      const kit = setup();
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.col, data: ['data']});
      expect(kit.toHtml()).toBe('<p>abcdefghij<col data-attr=\'["data"]\'>klmnopqrst</col>uvwxyz</p>');
      const slice = kit.peritext.savedSlices.each().find((slice) => slice.type() === SliceTypeCon.col)!;
      expect(slice.data()).toEqual(['data']);
      kit.et.format({action: 'upd', slice, data: {color: 'green', opacity: 1}});
      expect(slice.data()).toEqual({color: 'green', opacity: 1});
    });

    test('can overwrite by non object', () => {
      const kit = setup();
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.col, data: {color: 'red'}});
      expect(kit.toHtml()).toBe('<p>abcdefghij<col data-attr=\'{"color":"red"}\'>klmnopqrst</col>uvwxyz</p>');
      const slice = kit.peritext.savedSlices.each().find((slice) => slice.type() === SliceTypeCon.col)!;
      expect(slice.data()).toEqual({color: 'red'});
      kit.et.format({action: 'upd', slice, data: 'test'});
      expect(slice.data()).toEqual('test');
    });
  });

  describe('"set" action', () => {
    test('can overwrite formatting data', () => {
      const kit = setup();
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.col, data: {color: 'green', opacity: 0.5}});
      expect(kit.toHtml()).toBe(
        '<p>abcdefghij<col data-attr=\'{"color":"green","opacity":0.5}\'>klmnopqrst</col>uvwxyz</p>',
      );
      const slice = kit.peritext.savedSlices.each().find((slice) => slice.type() === SliceTypeCon.col)!;
      expect(slice.data()).toEqual({color: 'green', opacity: 0.5});
      kit.et.format({action: 'set', slice, data: {color: 'red'}});
      expect(slice.data()).toEqual({color: 'red'});
    });

    test('can overwrite formatting data with non-object', () => {
      const kit = setup();
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.col, data: {color: 'green', opacity: 0.5}});
      expect(kit.toHtml()).toBe(
        '<p>abcdefghij<col data-attr=\'{"color":"green","opacity":0.5}\'>klmnopqrst</col>uvwxyz</p>',
      );
      const slice = kit.peritext.savedSlices.each().find((slice) => slice.type() === SliceTypeCon.col)!;
      expect(slice.data()).toEqual({color: 'green', opacity: 0.5});
      kit.et.format({action: 'set', slice, data: 123});
      expect(slice.data()).toEqual(123);
    });

    test('can overwrite non-object with object', () => {
      const kit = setup();
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.col, data: true});
      expect(kit.toHtml()).toBe("<p>abcdefghij<col data-attr='true'>klmnopqrst</col>uvwxyz</p>");
      const slice = kit.peritext.savedSlices.each().find((slice) => slice.type() === SliceTypeCon.col)!;
      expect(slice.data()).toEqual(true);
      kit.et.format({action: 'set', slice, data: {col: '#fff'}});
      expect(slice.data()).toEqual({col: '#fff'});
    });
  });

  describe('data', () => {
    test('can retrive formatting data, when specified as "obj"', () => {
      const kit = setup();
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.col, data: {color: 'red'}});
      expect(kit.toHtml()).toBe('<p>abcdefghij<col data-attr=\'{"color":"red"}\'>klmnopqrst</col>uvwxyz</p>');
      const slice = kit.peritext.savedSlices.each().find((slice) => slice.type() === SliceTypeCon.col)!;
      expect(slice.data()).toEqual({color: 'red'});
      const obj = slice.dataNode()!;
      expect(obj instanceof ObjApi).toBe(true);
      expect((obj as unknown as ObjApi).view()).toEqual({color: 'red'});
      const obj2 = slice.dataAsObj();
      expect(obj2 instanceof ObjApi).toBe(true);
      expect(obj2.view()).toEqual({color: 'red'});
      obj2.set({color: 'blue'});
      expect(slice.data()).toEqual({color: 'blue'});
      expect(kit.toHtml()).toBe('<p>abcdefghij<col data-attr=\'{"color":"blue"}\'>klmnopqrst</col>uvwxyz</p>');
    });

    test('can retrive formatting data, when non-"obj" node used', () => {
      const kit = setup();
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.col, data: 'red'});
      expect(kit.toHtml()).toBe('<p>abcdefghij<col data-attr=\'"red"\'>klmnopqrst</col>uvwxyz</p>');
      const slice = kit.peritext.savedSlices.each().find((slice) => slice.type() === SliceTypeCon.col)!;
      expect(slice.data()).toEqual('red');
      const obj = slice.dataNode()!;
      expect(obj.view()).toEqual('red');
    });

    test('can force-convert data to "obj" node', () => {
      const kit = setup();
      kit.et.cursor({at: [10, 20]});
      kit.et.format({action: 'ins', type: SliceTypeCon.col, data: ['green', 'red']});
      expect(kit.toHtml()).toBe('<p>abcdefghij<col data-attr=\'["green","red"]\'>klmnopqrst</col>uvwxyz</p>');
      const slice = kit.peritext.savedSlices.each().find((slice) => slice.type() === SliceTypeCon.col)!;
      expect(slice.data()).toEqual(['green', 'red']);
      const api = slice.dataNode()!;
      expect(api instanceof ArrApi).toBe(true);
      expect(api.view()).toEqual(['green', 'red']);
      const obj = slice.dataAsObj();
      expect(obj instanceof ObjApi).toBe(true);
      expect(obj.view()).toEqual({});
      expect(slice.data()).toEqual({});
      const api2 = slice.dataNode()!;
      expect(api2 instanceof ObjApi).toBe(true);
      expect(api2.view()).toEqual({});
    });
  });
};

describe('"format" event', () => {
  runAlphabetKitTestSuite(testSuite);
});
