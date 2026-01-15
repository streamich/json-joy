import * as fixtures from './fixtures/documents';
import * as traces from './fixtures/traces';
import {assertRoundtripForTraceCheckpoints, assertSlatePeritextSlateRoundtrip} from './tools/assertions';

describe('convert: Slate-Peritext-Slate', () => {
  describe('sample documents', () => {
    describe('single paragraph', () => {
      test('single text paragraph', () => {
        assertSlatePeritextSlateRoundtrip(fixtures.paragraph);
      });

      test('multiple paragraphs', () => {
        assertSlatePeritextSlateRoundtrip(fixtures.paragraphs);
      });
    });

    describe('blockquotes', () => {
      test('single blockquote', () => {
        assertSlatePeritextSlateRoundtrip(fixtures.twoBlockquotes);
      });

      test('multiple blockquotes', () => {
        assertSlatePeritextSlateRoundtrip(fixtures.blockquotes);
      });
    });

    describe('lists', () => {
      test('unordered list', () => {
        assertSlatePeritextSlateRoundtrip(fixtures.list);
      });

      test('nested list', () => {
        assertSlatePeritextSlateRoundtrip(fixtures.nestedList);
      });
    });

    describe('headings', () => {
      test('multiple headings', () => {
        assertSlatePeritextSlateRoundtrip(fixtures.headings);
      });
    });

    describe('complex documents', () => {
      test('realistic document', () => {
        assertSlatePeritextSlateRoundtrip(fixtures.realisticDoc);
      });
    });

    describe('inline styles', () => {
      test('inline styles', () => {
        assertSlatePeritextSlateRoundtrip(fixtures.inlineStyles);
      });

      test('nested inline styles', () => {
        assertSlatePeritextSlateRoundtrip(fixtures.nestedInlines);
      });

      test('nested inline styles with attributes', () => {
        assertSlatePeritextSlateRoundtrip(fixtures.nestedInlinesWithAttributes);
      });
    });
  });

  describe('traces', () => {
    test('...', () => {
      assertRoundtripForTraceCheckpoints(traces.slateEnterCharsTrace);
      assertRoundtripForTraceCheckpoints(traces.slateInsertCharsTrace);
      assertRoundtripForTraceCheckpoints(traces.slateDeleteCharsTrace);
      assertRoundtripForTraceCheckpoints(traces.slateInsertRangeTrace);
      assertRoundtripForTraceCheckpoints(traces.slateRangeDeletesTrace);
      assertRoundtripForTraceCheckpoints(traces.slateAddInlineFormattingTrace);
      // assertRoundtripForTraceCheckpoints(traces.slateToggleInlineFormattingTrace);
      assertRoundtripForTraceCheckpoints(traces.slateCrossBlockInlineFormattingTrace);
      // assertRoundtripForTraceCheckpoints(traces.slateOverlappingFormattingTrace);
      assertRoundtripForTraceCheckpoints(traces.slateVariousEditingTrace);
    });
  });
});
