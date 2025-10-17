import {CodegenStepExecJs} from '..';
import {Codegen} from '../Codegen';

test('can generate a simple function', () => {
  const codegen = new Codegen({
    name: 'foobar',
    args: ['a', 'b'],
    prologue: 'var res = 0;',
    epilogue: 'return res;',
    processSteps: (steps) => {
      return steps.map((step) => {
        if (typeof step === 'number') {
          return new CodegenStepExecJs(`a += ${step};`);
        } else return step;
      }) as CodegenStepExecJs[];
    },
  });
  codegen.step(4);
  const [c1, c2] = codegen.addConstants(['1', '2']);
  codegen.js(`b += ${c1} + ${c2};`);
  const byTwo = (num: number) => 2 * num;
  codegen.linkDependency(byTwo, 'byTwo');
  codegen.js(`res += byTwo(a) + byTwo(b);`);
  const code = codegen.generate();
  const fn = codegen.compile();
  // console.log(code.js);
  expect(code.deps).toStrictEqual([byTwo]);
  expect(typeof code.js).toBe('string');
  expect(fn(1, 2)).toBe(20);
  expect(fn.name).toBe('foobar');
});
