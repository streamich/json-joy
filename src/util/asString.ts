const stringify = JSON.stringify;

const asStringSmall = (str: string) => {
  const l = str.length;
  let result = '';
  let last = 0;
  let found = false;
  let surrogateFound = false;
  let point = 255;
  for (let i = 0; i < l && point >= 32; i++) {
    point = str.charCodeAt(i)
    if (point >= 0xD800 && point <= 0xDFFF) {
      surrogateFound = true;
    }
    if (point === 34 || point === 92) {
      result += str.slice(last, i) + '\\';
      last = i;
      found = true;
    }
  }
  if (!found) result = str;
  else result += str.slice(last);
  return ((point < 32) || (surrogateFound === true)) ? stringify(str) : '"' + result + '"';
};

export const asString = (str: string) =>
  str.length < 42 ? asStringSmall(str) : stringify(str);
