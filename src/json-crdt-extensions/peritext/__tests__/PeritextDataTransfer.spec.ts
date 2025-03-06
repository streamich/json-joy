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
  const html = '1<span><a/></span><b></b>2<span /><b data-json-joy-peritext="eyJ2aWV3IjpbImdyYXBwbGVzIiw4MixbXV19"></b>';
  peritext.strApi().ins(0, 'ab');
  transfer.fromHtml(1, html);
  peritext.refresh();
  // console.log(peritext + '');
  expect(peritext.savedSlices.size()).toBe(0);
  expect(peritext.strApi().view()).toBe('a12b');
});

test('removes meta tags', () => {
  const {peritext, transfer} = setup();
  const html = '<meta>0</meta>12<meta />';
  peritext.strApi().ins(0, 'ab');
  transfer.fromHtml(1, html);
  peritext.refresh();
  // console.log(peritext + '');
  expect(peritext.savedSlices.size()).toBe(0);
  expect(peritext.strApi().view()).toBe('a12b');
});

test('does not insert a first paragraph, if insert inside the first block (implicit paragraph)', () => {
  const {peritext, transfer} = setup();
  const html = '<p>123</p>';
  peritext.strApi().ins(0, 'ab');
  transfer.fromHtml(1, html);
  peritext.refresh();
  expect(peritext.strApi().view()).toBe('a123b');
  expect(peritext.blocks.root.children.length).toBe(1);
  const html2 = transfer.toHtml(peritext.rangeAll()!);
  expect(html2).toBe('<p>a123b</p>');
});

test('does not insert a first paragraph, inserts the second paragraph, if insert inside the first block (implicit paragraph)', () => {
  const {peritext, transfer} = setup();
  const html = '<p>1</p><p>2</p>';
  peritext.strApi().ins(0, 'ab');
  transfer.fromHtml(1, html);
  peritext.refresh();
  expect(peritext.strApi().view()).toBe('a1\n2b');
  expect(peritext.blocks.root.children.length).toBe(2);
  const html2 = transfer.toHtml(peritext.rangeAll()!);
  expect(html2).toBe('<p>a1</p><p>2b</p>');
});

test('does not insert a first paragraph, inserts the second paragraph, if inside a paragraph', () => {
  const {peritext, transfer} = setup();
  transfer.fromHtml(0, '<p>ab</p><p>cd</p>');
  peritext.refresh();
  const html = '<p>1</p><p>2</p>';
  transfer.fromHtml(4, html);
  peritext.refresh();
  expect(peritext.strApi().view()).toBe('ab\nc1\n2d');
  expect(peritext.blocks.root.children.length).toBe(3);
  const html2 = transfer.toHtml(peritext.rangeAll()!);
  expect(html2).toBe('<p>ab</p><p>c1</p><p>2d</p>');
});

test('inserts the first paragraph if markers of different type', () => {
  const {peritext, transfer} = setup();
  transfer.fromHtml(0, '<p>ab</p><p>cd</p>');
  peritext.refresh();
  const html = '<blockquote>1</blockquote><blockquote>2</blockquote>';
  transfer.fromHtml(4, html);
  peritext.refresh();
  expect(peritext.strApi().view()).toBe('ab\nc\n1\n2d');
  expect(peritext.blocks.root.children.length).toBe(4);
  const html2 = transfer.toHtml(peritext.rangeAll()!);
  expect(html2).toBe('<p>ab</p><p>c</p><blockquote>1</blockquote><blockquote>2d</blockquote>');
});

test('does not insert paragraph marker into an empty document', () => {
  const {peritext, transfer} = setup();
  transfer.fromHtml(0, '<p>1</p>');
  peritext.refresh();
  expect(peritext.strApi().view()).toBe('1');
  expect(peritext.blocks.root.children.length).toBe(1);
  expect(peritext.savedSlices.size()).toBe(0);
});

test('does not insert the first paragraph marker into an empty document, two paragraphs', () => {
  const {peritext, transfer} = setup();
  transfer.fromHtml(0, '<p>1</p><p>2</p>');
  peritext.refresh();
  expect(peritext.strApi().view()).toBe('1\n2');
  expect(peritext.blocks.root.children.length).toBe(2);
  expect(peritext.savedSlices.size()).toBe(1);
});

test('does not create a new paragraph if, inserted inside a paragraph', () => {
  const {peritext, transfer} = setup();
  const html = '<meta charset="utf-8"><p>123</p><b data-json-joy-peritext="eyJ2aWV3IjpbImdyYXBwbGVzIiw4MixbXV19"></b>';
  peritext.strApi().ins(0, 'ab');
  transfer.fromHtml(1, html);
  peritext.refresh();
  expect(peritext.strApi().view()).toBe('a123b');
  expect(peritext.blocks.root.children.length).toBe(1);
  const html2 = transfer.toHtml(peritext.rangeAll()!);
  expect(html2).toBe('<p>a123b</p>');
});
