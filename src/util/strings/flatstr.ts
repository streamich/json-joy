export const flatstr = (s: string): string => {
  (<any>s) | 0;
  Number(s);
  return s;
};
