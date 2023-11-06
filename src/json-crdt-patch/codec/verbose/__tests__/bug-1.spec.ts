import {decode} from '../decode';
import {encode} from '../encode';

const encoded1 = {
  id: [698, 25],
  ops: [
    {
      op: 'new_obj',
    },
    {
      op: 'new_val',
    },
    {
      op: 'new_bin',
    },
    {
      op: 'ins_bin',
      obj: [698, 27],
      after: [698, 27],
      value: '0UTYEA==',
    },
    {
      op: 'new_val',
    },
    {
      op: 'ins_obj',
      obj: [698, 25],
      value: [
        ['aUt/w?4(RFcAwLm', [698, 26]],
        ['OrTy', [698, 27]],
        ['MA|m*3V#Y+G&w', [698, 32]],
      ],
    },
    {
      op: 'ins_obj',
      obj: [592121, 4],
      value: [['땣땣땣땣땣땣땣땣땣', [698, 25]]],
    },
  ],
};

test('should decode and encode patch back to exact same JSON', () => {
  const decoded1 = decode(encoded1 as any);
  const encoded2 = encode(decoded1);
  expect(encoded2).toStrictEqual(encoded1);
});
