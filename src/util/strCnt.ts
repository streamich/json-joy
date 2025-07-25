export const strCnt = (needle: string, haystack: string, offset: number = 0): number => {
  let cnt = 0;
  const needleLen = needle.length;
  if (needleLen === 0) return 0;
  while (true) {
    const index = haystack.indexOf(needle, offset);
    if (index < 0) return cnt;
    cnt++;
    offset = index + needleLen;
  }
};
