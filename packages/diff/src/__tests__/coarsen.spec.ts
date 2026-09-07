import {byteSizeModel, type CoarsenModel, coarsen, opCountModel} from '../optimize';
import {diff, dst as getDst, src as getSrc, PATCH_OP_TYPE, type Patch} from '../str';
import {int, logSeed, pick} from './rnd';

const cost = (patch: Patch, model: CoarsenModel): number => {
  let sum = 0;
  for (const [type, txt] of patch) {
    sum += type === PATCH_OP_TYPE.EQL ? model.eql : type === PATCH_OP_TYPE.DEL ? model.del : model.ins;
    if (type === PATCH_OP_TYPE.INS) sum += model.unit * txt.length;
  }
  return sum;
};

describe('coarsen()', () => {
  test('absorbs a short equality between two full edit pairs', () => {
    const patch: Patch = [
      [-1, 'ab'],
      [1, '12'],
      [0, 'xyz'],
      [-1, 'cd'],
      [1, '34'],
    ];
    expect(coarsen(patch)).toEqual([
      [-1, 'abxyzcd'],
      [1, '12xyz34'],
    ]);
  });

  test('keeps an equality at the threshold', () => {
    const patch: Patch = [
      [-1, 'ab'],
      [1, '12'],
      [0, 'xyzxyz'],
      [-1, 'cd'],
      [1, '34'],
    ];
    expect(coarsen(patch)).toEqual(patch);
  });

  test('one-sided edits absorb only 1-char equalities under the default model', () => {
    expect(
      coarsen([
        [-1, 'a'],
        [0, 'e'],
        [-1, 'b'],
      ]),
    ).toEqual([
      [-1, 'aeb'],
      [1, 'e'],
    ]);
    const kept: Patch = [
      [-1, 'a'],
      [0, 'ee'],
      [-1, 'b'],
    ];
    expect(coarsen(kept)).toEqual(kept);
  });

  test('absorbing cascades back to previously kept equalities', () => {
    const patch: Patch = [
      [-1, 'a'],
      [0, 'ee'],
      [-1, 'b'],
      [0, 'f'],
      [1, 'i'],
      [-1, 'c'],
    ];
    expect(coarsen(patch)).toEqual([
      [-1, 'aeebfc'],
      [1, 'eefi'],
    ]);
  });

  test('absorbs leading and trailing equalities when the model favors it', () => {
    expect(
      coarsen(
        [
          [0, 'x'],
          [-1, 'aa'],
          [1, 'bb'],
        ],
        byteSizeModel(),
      ),
    ).toEqual([
      [-1, 'xaa'],
      [1, 'xbb'],
    ]);
    expect(
      coarsen(
        [
          [-1, 'aa'],
          [1, 'bb'],
          [0, 'x'],
        ],
        byteSizeModel(),
      ),
    ).toEqual([
      [-1, 'aax'],
      [1, 'bbx'],
    ]);
    const kept: Patch = [
      [0, 'xxx'],
      [-1, 'aa'],
      [1, 'bb'],
    ];
    expect(coarsen(kept, byteSizeModel())).toEqual(kept);
  });

  test('an extreme op cost collapses any patch to a single edit pair', () => {
    const patch = diff('the quick brown fox', 'the quiet brown cat');
    const out = coarsen(patch, opCountModel(1e9));
    expect(out.length).toBeLessThanOrEqual(2);
    expect(getSrc(out)).toBe('the quick brown fox');
    expect(getDst(out)).toBe('the quiet brown cat');
  });

  test('a zero-benefit model leaves the patch unchanged', () => {
    const patch = diff('hello world', 'help sword');
    expect(coarsen(patch, {eql: 0, del: 0, ins: 0, unit: 1})).toEqual(patch);
  });

  test('passes through empty and single-op patches', () => {
    expect(coarsen([])).toEqual([]);
    expect(coarsen([[0, 'abc']])).toEqual([[0, 'abc']]);
    expect(coarsen([[1, 'abc']])).toEqual([[1, 'abc']]);
  });

  test('canonicalizes interleaved edit runs to DEL before INS', () => {
    expect(
      coarsen([
        [1, 'b'],
        [-1, 'a'],
        [1, 'd'],
        [-1, 'c'],
      ]),
    ).toEqual([
      [-1, 'ac'],
      [1, 'bd'],
    ]);
  });

  test('fuzz: reconstruction, canonical shape, monotone cost, idempotence', () => {
    const pool = ['a', 'b', 'c', ' ', 'word', '😀', '🙂', 'é', '中'];
    for (let i = 0; i < 300; i++) {
      let a = '';
      let b = '';
      const la = int(20);
      const lb = int(20);
      for (let j = 0; j < la; j++) a += pick(pool);
      for (let j = 0; j < lb; j++) b += pick(pool);
      const patch = diff(a, b);
      const model: CoarsenModel = {eql: int(9), del: int(9), ins: int(9), unit: 1 + int(3)};
      try {
        const out = coarsen(patch, model);
        expect(getSrc(out)).toBe(a);
        expect(getDst(out)).toBe(b);
        for (let j = 0; j < out.length; j++) {
          expect(out[j][1]).not.toBe('');
          if (j > 0) {
            expect(out[j][0]).not.toBe(out[j - 1][0]);
            if (out[j - 1][0] === PATCH_OP_TYPE.INS) expect(out[j][0]).not.toBe(PATCH_OP_TYPE.DEL);
          }
        }
        expect(cost(out, model)).toBeLessThanOrEqual(cost(patch, model));
        expect(coarsen(out, model)).toEqual(out);
      } catch (error) {
        logSeed({a, b, model});
        throw error;
      }
    }
  });
});
