export const lazy = <T extends (...args: any[]) => any>(factory: () => T): T => {
  let generated: T | undefined;
  const fn = (...args: any[]) => {
    if (!generated) generated = factory();
    return generated.apply(null, args);
  };
  return fn as T;
};
