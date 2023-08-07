import {apply, transform} from '..';
import {StringOtFuzzer} from './StringOtFuzzer';

const fuzzer = new StringOtFuzzer();

test('works', () => {
  for (let i = 0; i < 100; i++) {
    const str1 = fuzzer.genString();
    const op1 = fuzzer.genOp(str1);
    const op2 = fuzzer.genOp(str1);
    const op11 = transform(op1, op2, true);
    const op22 = transform(op2, op1, false);
    const str2 = apply(apply(str1, op1), op22);
    const str3 = apply(apply(str1, op2), op11);
    try {
      expect(str3).toBe(str2);
      // console.log([str1, op1, op2, op11, op22, str2, str3]);
    } catch (error) {
      // tslint:disable-next-line no-console
      console.log([str1, op1, op2, op11, op22, str2, str3]);
      throw error;
    }
  }
});
