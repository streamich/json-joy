export const normalizeAccessor = (key: string): string => {
  // Simple property access for valid identifiers, bracket notation otherwise
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
    return `.${key}`;
  }
  return `[${JSON.stringify(key)}]`;
};

/**
 * Creates a lazily evaluated factory function that caches results based on the
 * first argument.
 *
 * @param factory A factory function that takes a key as the first argument,
 *     potentially more arguments, and returns a function.
 */
export const lazyKeyedFactory = <
  K extends WeakKey,
  FactoryThis,
  FactoryArgs extends [key: K, ...args: any[]],
  Method extends (...args: any[]) => any,
>(
  factory: (this: FactoryThis, ...args: FactoryArgs) => Method,
) => {
  const cache = new WeakMap<K, Method>();
  return function (this: FactoryThis, ...factoryArgs: FactoryArgs) {
    const factoryThis = this;
    const key = factoryArgs[0];
    let estimator = cache.get(key);
    if (estimator) return estimator;
    return function (this: any, ...methodArgs: Parameters<Method>) {
      if (!estimator) {
        estimator = factory.call(factoryThis, ...factoryArgs);
        cache.set(key, estimator);
      }
      return estimator.call(this, ...methodArgs);
    } as Method;
  };
};
