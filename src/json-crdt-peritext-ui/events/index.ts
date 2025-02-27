import {PeritextEventDefaults, PeritextEventDefaultsOpts} from './defaults/PeritextEventDefaults';
import {PeritextEventTarget} from './PeritextEventTarget';
import {ClipboardFacade} from './clipboard/ClipboardFacade';
import type {Peritext} from '../../json-crdt-extensions';

export const create = (txt: Peritext) => {
  const et = new PeritextEventTarget();
  const clipboard: PeritextEventDefaultsOpts['clipboard'] = typeof navigator === 'object' && navigator && navigator.clipboard
    ? new ClipboardFacade(navigator.clipboard) : undefined;
  const defaults = new PeritextEventDefaults(txt, et, {clipboard});
  et.defaults = defaults;
  return defaults;
};
