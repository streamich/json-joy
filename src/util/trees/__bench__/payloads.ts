const naturalNumbersVerySmallList = Array.from({length: 10}, (_, i) => i * 5 + 10);
const naturalNumbersSmallList = Array.from({length: 100}, (_, i) => i * 5 + 100);
const naturalNumbers = Array.from({length: 1000}, (_, i) => i * 5 + 1000);
const naturalNumbersLongList = Array.from({length: 10000}, (_, i) => i * 5 + 10000);
const naturalNumbersVeryLongList = Array.from({length: 100000}, (_, i) => i * 5 + 100000);
const naturalNumbersReverse = Array.from({length: 1000}, (_, i) => 1000 - i);
const naturalNumbersRandomSmallList = Array.from({length: 100}, (_, i) => Math.floor(Math.random() * 100));
const naturalNumbersRandom = Array.from({length: 1000}, (_, i) => Math.floor(Math.random() * 1000));

export const numbers = [
  {
    name: (json: any) => `Random ${naturalNumbersRandomSmallList.length} numbers`,
    data: naturalNumbersRandomSmallList,
  },
  {
    name: (json: any) => `Random ${naturalNumbersRandom.length} numbers`,
    data: naturalNumbersRandom,
  },
  {
    name: (json: any) =>
      `${(json as any).length} natural numbers from ${(json as any)[0]} to ${(json as any)[(json as any).length - 1]}`,
    data: naturalNumbersVerySmallList,
  },
  {
    name: (json: any) =>
      `${(json as any).length} natural numbers from ${(json as any)[0]} to ${(json as any)[(json as any).length - 1]}`,
    data: naturalNumbersSmallList,
  },
  {
    name: (json: any) =>
      `${(json as any).length} natural numbers from ${(json as any)[0]} to ${(json as any)[(json as any).length - 1]}`,
    data: naturalNumbers,
  },
  {
    name: (json: any) =>
      `${(json as any).length} natural numbers from ${(json as any)[0]} to ${(json as any)[(json as any).length - 1]}`,
    data: naturalNumbersLongList,
  },
  {
    name: (json: any) =>
      `${(json as any).length} natural numbers from ${(json as any)[0]} to ${(json as any)[(json as any).length - 1]}`,
    data: naturalNumbersVeryLongList,
  },
  {
    name: (json: any) =>
      `${(json as any).length} natural numbers from ${(json as any)[0]} to ${(json as any)[(json as any).length - 1]}`,
    data: naturalNumbersReverse,
  },
];
