import {decode} from '../decode';
import {encode} from '../encode';

const encoded1 = {
  id: [6987898974598205, 25],
  ops: [
    {
      op: 'obj',
    },
    {
      op: 'val',
      value: 666832391.8907177,
    },
    {
      op: 'bin',
    },
    {
      op: 'bin_ins',
      obj: [6987898974598205, 27],
      after: [6987898974598205, 27],
      value: '0UTYEA==',
    },
    {
      op: 'val',
      value: 953896599.532661,
    },
    {
      op: 'obj_set',
      obj: [6987898974598205, 25],
      tuples: [
        ['aUt/w?4(RFcAwLm', [6987898974598205, 26]],
        ['OrTy', [6987898974598205, 27]],
        ['MA|m*3V#Y+G&w', [6987898974598205, 32]],
      ],
    },
    {
      op: 'obj_set',
      obj: [592121839932052, 4],
      tuples: [['땣땣땣땣땣땣땣땣땣', [6987898974598205, 25]]],
    },
  ],
};

test('should decode and encode patch back to exact same JSON', () => {
  const decoded1 = decode(encoded1 as any);
  const encoded2 = encode(decoded1);
  expect(encoded2).toStrictEqual(encoded1);
});
