import type {QuillTrace} from '../../types';

export const fuzz7QuillTrace: QuillTrace = {
  contents: {ops: [{insert: {link: 'B'}}, {insert: 'AABBBB'}]},
  transactions: [
    [{insert: 'AAAAA'}],
    [{delete: 2}, {retain: 1, attributes: {bold: true, italic: true}}],
    [{retain: 3, attributes: {bold: null, italic: null}}],
    [{delete: 1}],
    [{insert: {link: 'B'}}, {retain: 2}, {insert: 'BBBB'}],
  ],
};
