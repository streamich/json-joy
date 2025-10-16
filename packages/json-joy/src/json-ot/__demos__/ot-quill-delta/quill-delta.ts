/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx ts-node src/json-ot/__demos__/ot-quill-delta/quill-delta.ts
 */

import Delta from 'quill-delta';

const delta = new Delta([
  {insert: 'Gandalf', attributes: {bold: true}},
  {insert: ' the '},
  {insert: 'Grey', attributes: {color: '#ccc'}},
]);
console.log(delta.ops.reduce((str, op) => str + (op.insert || ''), ''));
console.log(delta.ops);

const death = new Delta().retain(12).insert('White', {color: '#fff'}).delete(4);
console.log(death.ops.reduce((str, op) => str + (op.insert || ''), ''));
console.log(death.ops);

const result = delta.compose(death);
console.log(result.ops.reduce((str, op) => str + (op.insert || ''), ''));
console.log(result.ops);

const embed = new Delta([
  {retain: 2},
  {
    insert: {
      image: 'https://quilljs.com/assets/images/icon.png',
    },
    attributes: {
      link: 'https://quilljs.com',
    },
  },
]);

const result2 = result.compose(embed);
console.log(result2.ops);
