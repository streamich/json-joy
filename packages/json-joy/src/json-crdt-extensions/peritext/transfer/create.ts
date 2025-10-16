import * as htmlExport from './export-html';
import * as htmlImport from './import-html';
import * as mdExport from './export-markdown';
import * as mdImport from './import-markdown';
import {PeritextDataTransfer} from './PeritextDataTransfer';
import type {Peritext} from '../Peritext';

export const create = (txt: Peritext) => {
  const transfer = new PeritextDataTransfer(txt, {
    htmlExport,
    htmlImport,
    mdExport,
    mdImport,
  });
  return transfer;
};
