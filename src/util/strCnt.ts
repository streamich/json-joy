export const strCnt = (needle: string, haystack: string, offset: number = 0): number => {
  let cnt = 0;
  const needleLen = needle.length;
  if (needleLen === 0) return 0;
  let currentOffset = offset;
  while (true) {
    const index = haystack.indexOf(needle, currentOffset);
    if (index < 0) return cnt;
    cnt++;
    currentOffset = index + needleLen;
  }
};
