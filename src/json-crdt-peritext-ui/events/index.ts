import {PeritextEventDefaults, type PeritextEventDefaultsOpts} from './defaults/PeritextEventDefaults';
import {PeritextEventTarget} from './PeritextEventTarget';
import {DomClipboard} from './clipboard/DomClipboard';
import {create as createDataTransfer} from '../../json-crdt-extensions/peritext/transfer/create';
import {DomUndoRedo} from './undo/DomUndoRedo';
import type {Peritext} from '../../json-crdt-extensions';

export const create = (txt: Peritext) => {
  const et = new PeritextEventTarget();
  const clipboard: PeritextEventDefaultsOpts['clipboard'] =
    typeof navigator === 'object' && navigator && navigator.clipboard
      ? new DomClipboard(navigator.clipboard)
      : undefined;
  const transfer = createDataTransfer(txt);
  const undo = new DomUndoRedo();
  const defaults = new PeritextEventDefaults(txt, et, {clipboard, transfer, undo});
  et.defaults = defaults;
  return defaults;
};
