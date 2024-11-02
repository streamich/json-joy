import type {QuillTrace} from '../../types';

export const fuzz5QuillTrace: QuillTrace = {
  contents: {ops: [{insert: {link: 'A'}}]},
  transactions: [
    [{insert: {link: 'A'}}],
    [{insert: {link: 'B'}}, {retain: 1, attributes: {bold: true, italic: null}}],
    [{retain: 1}, {insert: {link: 'C'}}],
    [{retain: 1}, {retain: 2, attributes: {bold: null}}],
    [{delete: 2}, {retain: 1, attributes: {bold: null}}],
  ],
};
