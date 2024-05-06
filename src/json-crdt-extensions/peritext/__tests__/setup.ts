import {s} from "../../../json-crdt-patch";
import {ModelWithExt, ext} from "../../ModelWithExt";

/**
 * Creates a Peritext instance with text "0123456789", with single-char and
 * block-wise chunks, as well as with plenty of tombstones.
 */
export const setupNumbersWithTombstones = () => {
  const schema = s.obj({
    text: ext.peritext.new('1234'),
  });
  const model = ModelWithExt.create(schema);
  const str = model.s.text.toExt().text();
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
  str.ins(2, '234');
  if (str.view() !== '0123456789') throw new Error('Invalid text');
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
