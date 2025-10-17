export const int = (min: number, max: number): number => {
  let int = Math.round(Math.random() * (max - min) + min);
  int = Math.max(min, Math.min(max, int));
  return int;
};

export const int64 = (min: bigint, max: bigint): bigint => {
  const range = max - min;
  const randomFloat = Math.random();
  const randomBigInt = BigInt(Math.floor(Number(range) * randomFloat));
  let result = min + randomBigInt;
  result = result < min ? min : result > max ? max : result;
  return result;
};
