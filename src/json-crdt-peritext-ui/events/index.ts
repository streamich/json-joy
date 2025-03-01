import {PeritextEventDefaults, PeritextEventDefaultsOpts} from './defaults/PeritextEventDefaults';
import {PeritextEventTarget} from './PeritextEventTarget';
import {ClipboardFacade} from './clipboard/ClipboardFacade';
import {PeritextDataTransfer} from '../../json-crdt-extensions/peritext/PeritextDataTransfer';
import * as htmlExport from '../../json-crdt-extensions/peritext/lazy/export-html';
import * as htmlImport from '../../json-crdt-extensions/peritext/lazy/import-html';
import * as mdExport from '../../json-crdt-extensions/peritext/lazy/export-markdown';
import * as mdImport from '../../json-crdt-extensions/peritext/lazy/import-markdown';
import type {Peritext} from '../../json-crdt-extensions';

export const create = (txt: Peritext) => {
  const et = new PeritextEventTarget();
  const clipboard: PeritextEventDefaultsOpts['clipboard'] = typeof navigator === 'object' && navigator && navigator.clipboard
    ? new ClipboardFacade(navigator.clipboard) : undefined;
  const transfer = new PeritextDataTransfer(txt, {
    htmlExport,
    htmlImport,
    mdExport,
    mdImport,
  });
  const defaults = new PeritextEventDefaults(txt, et, {clipboard, transfer});
  et.defaults = defaults;
  return defaults;
};
