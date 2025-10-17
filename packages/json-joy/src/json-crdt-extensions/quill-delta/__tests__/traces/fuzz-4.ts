import type {QuillTrace} from '../../types';

export const fuzz4QuillTrace: QuillTrace = {
  contents: {ops: [{insert: '0'}, {insert: {link: '1111'}}, {insert: '0'}]},
  transactions: [
    [{insert: '00000'}],
    [{retain: 1}, {retain: 3, attributes: {bold: null}}, {insert: {link: '1111'}}],
    [{delete: 3}],
  ],
};
