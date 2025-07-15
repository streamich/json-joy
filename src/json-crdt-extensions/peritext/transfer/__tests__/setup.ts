import * as htmlExport from '../export-html';
import * as htmlImport from '../import-html';
import * as mdExport from '../export-markdown';
import * as mdImport from '../import-markdown';
import {PeritextDataTransfer} from '../PeritextDataTransfer';
import {setupKit} from '../../__tests__/setup';

export const setup = () => {
  const kit = setupKit();
  const transfer = new PeritextDataTransfer(kit.peritext, {
    htmlExport,
    htmlImport,
    mdExport,
    mdImport,
  });
  return {...kit, transfer};
};
