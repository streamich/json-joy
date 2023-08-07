import {apply, compose} from '..';
import {StringOtFuzzer} from './StringOtFuzzer';

const fuzzer = new StringOtFuzzer();

test('works', () => {
  for (let i = 0; i < 1000; i++) {
    const str1 = fuzzer.genString();
    const op1 = fuzzer.genOp(str1);
    const str2 = apply(str1, op1);
    const op2 = fuzzer.genOp(str2);
    const str3 = apply(str2, op2);
    const op3 = compose(op1, op2);
    const str4 = apply(str1, op3);
    try {
      expect(str4).toBe(str3);
    } catch (error) {
      // tslint:disable-next-line no-console
      console.log([str1, op1, str2, op2, str3, op3, str4]);
      throw error;
    }
  }
});
