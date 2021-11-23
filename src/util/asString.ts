const stringify = JSON.stringify;

export const asString = (str: string) => {
  const length = str.length;
  if (length > 41) return stringify(str);
  let result = '';
  let last = 0;
  let found = false;
  let point = 255;
  for (let i = 0; i < length && point >= 32; i++) {
    point = str.charCodeAt(i)
    if (point >= 0xD800 && point <= 0xDFFF) return stringify(str);
    if (point === 34 || point === 92) {
      result += str.slice(last, i) + '\\';
      last = i;
      found = true;
    }
  }
  if (point < 32) return stringify(str);
  return '"' + (!found ? str : (result + str.slice(last))) + '"';
};
