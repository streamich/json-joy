import {apply, compose} from '..';
import {BinaryOtFuzzer} from './BinaryOtFuzzer';

const fuzzer = new BinaryOtFuzzer();

test('works', () => {
  for (let i = 0; i < 1000; i++) {
    const bin1 = fuzzer.genBinary();
    const bin2 = fuzzer.genOp(bin1);
    const str2 = apply(bin1, bin2);
    const op2 = fuzzer.genOp(str2);
    const bin3 = apply(str2, op2);
    const op3 = compose(bin2, op2);
    const bin4 = apply(bin1, op3);
    try {
      expect(bin4).toStrictEqual(bin3);
    } catch (error) {
      // tslint:disable-next-line no-console
      console.log([bin1, bin2, str2, op2, bin3, op3, bin4]);
      throw error;
    }
  }
});
