import {apply, transform} from '..';
import {BinaryOtFuzzer} from './BinaryOtFuzzer';

const fuzzer = new BinaryOtFuzzer();

test('works', () => {
  for (let i = 0; i < 100; i++) {
    const bin1 = fuzzer.genBinary();
    const op1 = fuzzer.genOp(bin1);
    const op2 = fuzzer.genOp(bin1);
    const op11 = transform(op1, op2, true);
    const op22 = transform(op2, op1, false);
    const bin2 = apply(apply(bin1, op1), op22);
    const bin3 = apply(apply(bin1, op2), op11);
    try {
      expect(bin3).toStrictEqual(bin2);
      // console.log([str1, op1, op2, op11, op22, str2, str3]);
    } catch (error) {
      // tslint:disable-next-line no-console
      console.log([bin1, op1, op2, op11, op22, bin2, bin3]);
      throw error;
    }
  }
});
