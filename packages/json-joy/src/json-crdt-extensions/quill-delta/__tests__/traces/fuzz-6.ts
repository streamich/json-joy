import type {QuillTrace} from '../../types';

export const fuzz6QuillTrace: QuillTrace = {
  contents: {ops: [{attributes: {italic: true}, insert: 'AA'}, {insert: 'ABBBB'}, {insert: {link: 'C'}}]},
  transactions: [
    [{insert: 'AAAA'}],
    [{retain: 3, attributes: {bold: null}}],
    [{retain: 2, attributes: {italic: true}}, {delete: 1}],
    [{retain: 3}, {insert: 'BBBB'}, {insert: {link: 'C'}}],
    [{retain: 2}, {retain: 2, attributes: {bold: null}}],
  ],
};
