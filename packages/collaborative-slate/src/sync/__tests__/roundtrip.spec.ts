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

    describe('inline element nodes', () => {
      const isInline = (el: any) => el?.type === 'math-inline';

      test('inline element between two text runs', () => {
        const doc = [
          {
            type: 'p',
            children: [
              {text: 'a '},
              {type: 'math-inline', '@thing': 't-1', children: [{text: ''}]},
              {text: ' b'},
            ],
          },
        ];
        assertSlatePeritextSlateRoundtrip(doc, {isInline});
      });

      test('inline element at start of paragraph', () => {
        const doc = [
          {
            type: 'p',
            children: [
              {text: ''},
              {type: 'math-inline', '@thing': 't-1', children: [{text: ''}]},
              {text: ' rest'},
            ],
          },
        ];
        assertSlatePeritextSlateRoundtrip(doc, {isInline});
      });

      test('inline element at end of paragraph', () => {
        const doc = [
          {
            type: 'p',
            children: [
              {text: 'before '},
              {type: 'math-inline', '@thing': 't-1', children: [{text: ''}]},
              {text: ''},
            ],
          },
        ];
        assertSlatePeritextSlateRoundtrip(doc, {isInline});
      });

      test('two inline elements in same paragraph', () => {
        const doc = [
          {
            type: 'p',
            children: [
              {text: 'a '},
              {type: 'math-inline', '@thing': 't-1', children: [{text: ''}]},
              {text: ' and '},
              {type: 'math-inline', '@thing': 't-2', children: [{text: ''}]},
              {text: ' b'},
            ],
          },
        ];
        assertSlatePeritextSlateRoundtrip(doc, {isInline});
      });
    });
  });

  describe('traces', () => {
    test('roundtrip each checkpoint of traces', () => {
      assertRoundtripForTraceCheckpoints(traces.slateEnterCharsTrace);
      assertRoundtripForTraceCheckpoints(traces.slateInsertCharsTrace);
      assertRoundtripForTraceCheckpoints(traces.slateDeleteCharsTrace);
      assertRoundtripForTraceCheckpoints(traces.slateInsertRangeTrace);
      assertRoundtripForTraceCheckpoints(traces.slateRangeDeletesTrace);
      assertRoundtripForTraceCheckpoints(traces.slateAddInlineFormattingTrace);
      assertRoundtripForTraceCheckpoints(traces.slateToggleInlineFormattingTrace);
      assertRoundtripForTraceCheckpoints(traces.slateCrossBlockInlineFormattingTrace);
      assertRoundtripForTraceCheckpoints(traces.slateOverlappingFormattingTrace);
      assertRoundtripForTraceCheckpoints(traces.slateBlockSplitsTrace);
      assertRoundtripForTraceCheckpoints(traces.slateBlockJoinTrace);
      assertRoundtripForTraceCheckpoints(traces.slateBlockJoinThroughDeleteTrace);
      assertRoundtripForTraceCheckpoints(traces.slateBlockAttributesTrace);
      assertRoundtripForTraceCheckpoints(traces.slateVariousEditingTrace);
    });
  });
});
