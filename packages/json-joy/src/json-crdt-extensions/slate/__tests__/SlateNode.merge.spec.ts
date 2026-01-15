import * as fixtures from './fixtures';
import {assertCanMergeInto, assertCanMergeTrain, assertEmptyMerge} from './setup';

describe('.mergeSlateDoc()', () => {
  test('can merge "twoBlockquotes" fixture into "paragraphs" fixture', () => {
    assertCanMergeInto(fixtures.twoBlockquotes, fixtures.paragraphs);
    assertCanMergeInto(fixtures.paragraphs, fixtures.twoBlockquotes);
  });

  test('can merge "inlineStyles" fixture into "nestedInlines" fixture', () => {
    assertCanMergeInto(fixtures.inlineStyles, fixtures.nestedInlines);
    assertCanMergeInto(fixtures.nestedInlines, fixtures.inlineStyles);
  });

  test('can merge "nestedInlinesWithAttributes" fixture into "nestedInlinesWithAttributes2" fixture', () => {
    assertCanMergeInto(fixtures.nestedInlinesWithAttributes2, fixtures.nestedInlinesWithAttributes);
    assertCanMergeInto(fixtures.nestedInlinesWithAttributes, fixtures.nestedInlinesWithAttributes2);
  });

  test('can merge "paragraph" fixture into "nestedInlinesWithAttributes" fixture', () => {
    assertCanMergeInto(fixtures.paragraph, fixtures.nestedInlinesWithAttributes);
    assertCanMergeInto(fixtures.nestedInlinesWithAttributes, fixtures.paragraph);
  });

  test('can merge "inlineStyles" fixture into "blockquotes" fixture', () => {
    assertCanMergeInto(fixtures.inlineStyles, fixtures.blockquotes);
    assertCanMergeInto(fixtures.blockquotes, fixtures.inlineStyles);
  });

  test('can merge "headings" fixture into "realisticDoc" fixture', () => {
    assertCanMergeInto(fixtures.headings, fixtures.realisticDoc);
    assertCanMergeInto(fixtures.realisticDoc, fixtures.headings);
  });

  test('can merge "realisticDoc" fixture into "realisticDoc" fixture', () => {
    assertCanMergeInto(fixtures.realisticDoc, fixtures.realisticDoc);
  });

  test('produces no changes when merging document into equivalent document', () => {
    assertEmptyMerge(fixtures.nestedInlinesWithAttributes);
    assertEmptyMerge(fixtures.realisticDoc);
  });

  test('can merge all docs one into each other', () => {
    assertCanMergeTrain([
      fixtures.paragraphs,
      fixtures.twoBlockquotes,
      fixtures.inlineStyles,
      fixtures.nestedInlines,
      fixtures.nestedInlinesWithAttributes,
      fixtures.nestedInlinesWithAttributes2,
      fixtures.blockquotes,
      fixtures.headings,
      fixtures.realisticDoc,

      fixtures.nestedInlinesWithAttributes2,
      fixtures.nestedInlines,
      fixtures.inlineStyles,
      fixtures.realisticDoc,
      fixtures.nestedInlinesWithAttributes,
      fixtures.blockquotes,
      fixtures.headings,
      fixtures.twoBlockquotes,
      fixtures.paragraphs,
    ]);
  });
});
