export const resetMathRandom = (seed = 123456789) => {
  Math.random = () => {
    seed = (seed * 48271) % 2147483647;
    return (seed - 1) / 2147483646;
  };
};
