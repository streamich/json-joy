import {PeritextEventDefaults, type PeritextEventDefaultsOpts} from './defaults/PeritextEventDefaults';
import {PeritextEventTarget} from './PeritextEventTarget';
import {DomClipboard} from './clipboard/DomClipboard';
import {create as createDataTransfer} from '../../../json-crdt-extensions/peritext/transfer/create';
import type {Peritext} from '../../../json-crdt-extensions';

/**
 * @todo Move into separately importable file.
 * @todo Rename to `createDefaults`.
 */
export const createEvents = (txt: Peritext): PeritextEventDefaults => {
  const et = new PeritextEventTarget();
  const clipboard: PeritextEventDefaultsOpts['clipboard'] =
    typeof navigator === 'object' && navigator && navigator.clipboard
      ? new DomClipboard(navigator.clipboard)
      : undefined;
  const transfer = createDataTransfer(txt);
  const defaults = new PeritextEventDefaults(txt, et, {clipboard, transfer});
  et.defaults = defaults;
  return defaults;
};

export * from './types';
