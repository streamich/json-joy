import {s} from '../../../json-crdt-patch';
import {Model} from '../../../json-crdt/model';
import {SchemaToJsonNode} from '../../../json-crdt/schema/types';
import {ModelWithExt, ext} from '../../ModelWithExt';

export type Schema = ReturnType<typeof schema>;
export type Kit = ReturnType<typeof setupKit>;

const schema = (text: string) =>
  s.obj({
    text: ext.peritext.new(text),
  });

export const setupKit = (
  initialText: string = '',
  edits: (model: Model<SchemaToJsonNode<Schema>>) => void = () => {},
  sid?: number,
) => {
  const model = ModelWithExt.create(schema(initialText), sid);
  edits(model);
  const api = model.api;
  const peritextApi = model.s.text.toExt();
  const peritext = peritextApi.txt;
  const editor = peritextApi.editor;
  return {
    schema,
    model,
    api,
    peritextApi,
    peritext,
    editor,
  };
};

export const setupHelloWorldKit = (): Kit => {
  return setupKit('', (model) => {
    const str = model.s.text.toExt().text();
    str.ins(0, 'hello world');
    if (str.view() !== 'hello world') throw new Error('Invalid text');
  });
};

export const setupHelloWorldWithFewEditsKit = (): Kit => {
  return setupKit('', (model) => {
    const str = model.s.text.toExt().text();
    str.ins(0, 'wworld');
    str.ins(0, 'helo ');
    str.ins(2, 'l');
    str.del(7, 1);
    if (str.view() !== 'hello world') throw new Error('Invalid text');
  });
};

/**
 * Creates a Peritext instance with text "0123456789", no edits.
 */
export const setupNumbersKit = (): Kit => {
  return setupKit('', (model) => {
    const str = model.s.text.toExt().text();
    str.ins(0, '0123456789');
    if (str.view() !== '0123456789') throw new Error('Invalid text');
  });
};

/**
 * Creates a Peritext instance with text "0123456789", with single-char and
 * block-wise chunks, as well as with plenty of tombstones.
 */
export const setupNumbersWithTombstonesKit = (sid?: number): Kit => {
  return setupKit(
    '1234',
    (model) => {
      const str = model.s.text.toExt().text();
      str.ins(0, '234');
      str.ins(1, '234');
      str.ins(2, '345');
      str.ins(3, '456');
      str.ins(4, '567');
      str.ins(5, '678');
      str.ins(6, '789');
      str.del(7, 1);
      str.del(8, 1);
      str.ins(0, '0');
      str.del(1, 4);
      str.del(2, 1);
      str.ins(1, '1');
      str.del(0, 1);
      str.ins(0, '0');
      str.ins(2, '234');
      str.del(4, 7);
      str.del(4, 2);
      str.del(7, 3);
      str.ins(6, '6789');
      str.del(7, 2);
      str.ins(7, '78');
      str.del(10, 2);
      str.del(2, 3);
      str.ins(2, 'x234');
      str.del(2, 1);
      str.del(10, 3);
      if (str.view() !== '0123456789') throw new Error('Invalid text');
    },
    sid,
  );
};

/**
 * Creates a Peritext instance with text "abcdefghijklmnopqrstuvwxyz", no edits.
 */
export const setupAlphabetKit = (): Kit => {
  return setupKit('', (model) => {
    const str = model.s.text.toExt().text();
    str.ins(0, 'abcdefghijklmnopqrstuvwxyz');
    if (str.view() !== 'abcdefghijklmnopqrstuvwxyz') throw new Error('Invalid text');
  });
};

/**
 * Creates a Peritext instance with text "abcdefghijklmnopqrstuvwxyz", two text chunks.
 */
export const setupAlphabetWithTwoChunksKit = (): Kit => {
  return setupKit('', (model) => {
    const str = model.s.text.toExt().text();
    str.ins(0, 'lmnopqrstuvwxyz');
    str.ins(0, 'abcdefghijk');
    if (str.view() !== 'abcdefghijklmnopqrstuvwxyz') throw new Error('Invalid text');
  });
};

/**
 * Creates a Peritext instance with text "abcdefghijklmnopqrstuvwxyz", with RGA chunks split.
 */
export const setupAlphabetChunkSplitKit = (): Kit => {
  return setupKit('', (model) => {
    const str = model.s.text.toExt().text();
    str.ins(0, 'lmnwxyz');
    str.ins(3, 'opqrstuv');
    str.ins(0, 'abcdefghijk');
    if (str.view() !== 'abcdefghijklmnopqrstuvwxyz') throw new Error('Invalid text');
  });
};

/**
 * Creates a Peritext instance with text "abcdefghijklmnopqrstuvwxyz", with RGA deletes.
 */
export const setupAlphabetWithDeletesKit = (): Kit => {
  return setupKit('', (model) => {
    const str = model.s.text.toExt().text();
    str.ins(0, 'lmXXXnwYxyz');
    str.del(2, 3);
    str.ins(3, 'opqrstuv');
    str.del(12, 1);
    str.ins(0, 'ab1c3defghijk4444');
    str.del(2, 1);
    str.del(3, 1);
    str.del(11, 4);
    if (str.view() !== 'abcdefghijklmnopqrstuvwxyz') throw new Error('Invalid text');
  });
};
