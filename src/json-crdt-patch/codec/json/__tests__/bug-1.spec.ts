import {decode} from '../decode';
import {encode} from '../encode';

const encoded1 = {
  id: [698, 25],
  ops: [
    {
      op: 'obj',
    },
    {
      op: 'val',
      value: 1,
    },
    {
      op: 'bin',
    },
    {
      op: 'bin_ins',
      obj: [698, 27],
      after: [698, 27],
      value: '0UTYEA==',
    },
    {
      op: 'val',
      value: 2,
    },
    {
      op: 'obj_set',
      obj: [698, 25],
      tuples: [
        ['aUt/w?4(RFcAwLm', [698, 26]],
        ['OrTy', [698, 27]],
        ['MA|m*3V#Y+G&w', [698, 32]],
      ],
    },
    {
      op: 'obj_set',
      obj: [592121, 4],
      tuples: [['땣땣땣땣땣땣땣땣땣', [698, 25]]],
    },
  ],
};

test('should decode and encode patch back to exact same JSON', () => {
  const decoded1 = decode(encoded1 as any);
  const encoded2 = encode(decoded1);
  expect(encoded2).toStrictEqual(encoded1);
});
