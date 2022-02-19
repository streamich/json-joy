import {dynamicFunction} from './dynamicFunction';

/**
 * Switcher for code generation. It first executes "evaluation" function
 * 3 times, and then generates optimized code.
 */
export const createSwitch = <F extends (...args: any[]) => any>(fn: F, codegen: () => F): F => {
  let counter = 0;
  const [proxy, set] = dynamicFunction((...args) => {
    if (counter > 2) set(codegen());
    counter++;
    return fn(...args);
  });
  return proxy as F;
};
