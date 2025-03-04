import * as htmlExport from '../lazy/export-html';
import * as htmlImport from '../lazy/import-html';
import * as mdExport from '../lazy/export-markdown';
import * as mdImport from '../lazy/import-markdown';
import {PeritextDataTransfer} from '../PeritextDataTransfer';
import {setupKit} from './setup';

const setup = () => {
  const kit = setupKit();
  const transfer = new PeritextDataTransfer(kit.peritext, {
    htmlExport,
    htmlImport,
    mdExport,
    mdImport,
  });
  return {...kit, transfer};
};

test('ignores empty inline tags', () => {
  const {peritext, transfer} = setup();
  const html = '1<span><a/></span><b></b>2<span />';
  peritext.strApi().ins(0, 'ab');
  transfer.fromHtml(1, html);
  peritext.refresh();
  // console.log(peritext + '');
  expect(peritext.savedSlices.size()).toBe(0);
  expect(peritext.strApi().view()).toBe('a12b');
});

// test('can insert HTML fragment with <meta> and trailing export data blocks', () => {
//   const {peritext, transfer} = setup();
//   const html = '<meta charset="utf-8"><p>123</p><b data-json-joy-peritext="eyJ2aWV3IjpbImdyYXBwbGVzIiw4MixbXV19"></b>';
//   peritext.strApi().ins(0, 'ab');

//   transfer.fromHtml(1, html);
//   peritext.refresh();
  
//   console.log(peritext + '');
// });
