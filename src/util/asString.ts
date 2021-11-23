const stringify = JSON.stringify;

export const asString = (str: string) => {
  const l = str.length;
  if (l > 41) return stringify(str);
  let result = '';
  let last = 0;
  let found = false;
  let surrogateFound = false;
  let point = 255;
  for (let i = 0; i < l && point >= 32; i++) {
    point = str.charCodeAt(i)
    if (point >= 0xD800 && point <= 0xDFFF) surrogateFound = true;
    if (point === 34 || point === 92) {
      result += str.slice(last, i) + '\\';
      last = i;
      found = true;
    }
  }
  if (!found) result = str; else result += str.slice(last);
  return ((point < 32) || surrogateFound) ? stringify(str) : '"' + result + '"';
};
