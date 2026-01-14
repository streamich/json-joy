import * as fixtures from './fixtures/documents';
import {assertCanConvert} from './tools/assertions';

describe('convert: Slate-Peritext-Slate', () => {
  describe('single paragraph', () => {
    test('single text paragraph', () => {
      assertCanConvert(fixtures.paragraph);
    });

    test('multiple paragraphs', () => {
      assertCanConvert(fixtures.paragraphs);
    });
  });

  describe('blockquotes', () => {
    test('single blockquote', () => {
      assertCanConvert(fixtures.twoBlockquotes);
    });

    test('multiple blockquotes', () => {
      assertCanConvert(fixtures.blockquotes);
    });
  });

  describe('lists', () => {
    test('unordered list', () => {
      assertCanConvert(fixtures.list);
    });

    test('nested list', () => {
      assertCanConvert(fixtures.nestedList);
    });
  });

  describe('headings', () => {
    test('multiple headings', () => {
      assertCanConvert(fixtures.headings);
    });
  });

  describe('complex documents', () => {
    test('realistic document', () => {
      assertCanConvert(fixtures.realisticDoc);
    });
  });

  describe('inline styles', () => {
    test('inline styles', () => {
      assertCanConvert(fixtures.inlineStyles);
    });

    test('nested inline styles', () => {
      assertCanConvert(fixtures.nestedInlines);
    });

    test('nested inline styles with attributes', () => {
      assertCanConvert(fixtures.nestedInlinesWithAttributes);
    });
  });
});
