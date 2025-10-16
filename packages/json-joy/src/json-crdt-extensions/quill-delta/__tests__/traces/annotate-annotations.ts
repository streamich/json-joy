import type {QuillTrace} from '../../types';

export const annotateAnnotationsQuillTrace: QuillTrace = {
  contents: {
    ops: [
      {insert: 'A', attributes: {bold: true}},
      {insert: 'ABB', attributes: {bold: true, underline: true}},
      {
        insert: 'C',
        attributes: {italic: true, bold: true, underline: true},
      },
      {insert: 'C', attributes: {italic: true}},
    ],
  },
  transactions: [
    [{insert: 'AABBCC'}],
    [{retain: 2, attributes: {bold: true}}, {retain: 2}, {retain: 2, attributes: {italic: true}}],
    [{retain: 1}, {retain: 4, attributes: {bold: true, underline: true}}],
  ],
};
