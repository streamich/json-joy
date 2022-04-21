import {apply, compose} from '../StringType';
import {StringOtFuzzer} from './StringOtFuzzer';

const fuzzer = new StringOtFuzzer();

test('works', () => {
  for (let i = 0; i < 100; i++) {
    const str1 = fuzzer.genString();
    let op1 = fuzzer.genOp(str1);
    const str2 = apply(str1, op1);
    let op2 = fuzzer.genOp(str2);
    const str3 = apply(str2, op2);
    const op3 = compose(op1, op2);
    const str4 = apply(str1, op3);
    try {
      expect(str4).toBe(str3);
    } catch (error) {
      console.log([str1, op1, str2, op2, str3, op3, str4]);
      throw error;
    }
  }
});
