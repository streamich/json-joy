import * as htmlExport from './export-html';
import * as htmlImport from './import-html';
import * as mdExport from './export-markdown';
import * as mdImport from './import-markdown';
import {PeritextDataTransfer} from './PeritextDataTransfer';
import type {Peritext} from '../Peritext';
import type {SliceRegistry} from '../registry/SliceRegistry';

export const create = (txt: Peritext, registry: SliceRegistry) => {
  const transfer = new PeritextDataTransfer(
    txt,
    {
      htmlExport,
      htmlImport,
      mdExport,
      mdImport,
    },
    registry,
  );
  return transfer;
};
