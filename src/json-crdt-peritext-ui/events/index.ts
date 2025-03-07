import {PeritextEventDefaults, type PeritextEventDefaultsOpts} from './defaults/PeritextEventDefaults';
import {PeritextEventTarget} from './PeritextEventTarget';
import {DomClipboard} from './clipboard/DomClipboard';
import {PeritextDataTransfer} from '../../json-crdt-extensions/peritext/transfer/PeritextDataTransfer';
import * as htmlExport from '../../json-crdt-extensions/peritext/transfer/export-html';
import * as htmlImport from '../../json-crdt-extensions/peritext/transfer/import-html';
import * as mdExport from '../../json-crdt-extensions/peritext/transfer/export-markdown';
import * as mdImport from '../../json-crdt-extensions/peritext/transfer/import-markdown';
import type {Peritext} from '../../json-crdt-extensions';

export const create = (txt: Peritext) => {
  const et = new PeritextEventTarget();
  const clipboard: PeritextEventDefaultsOpts['clipboard'] =
    typeof navigator === 'object' && navigator && navigator.clipboard
      ? new DomClipboard(navigator.clipboard)
      : undefined;
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
