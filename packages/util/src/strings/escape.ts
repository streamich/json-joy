// License: https://github.com/BridgeAR/safe-stable-stringify/blob/78891ff37c6e8936118b8fa47ed59dd761c3208a/LICENSE

const strEscapeSequencesRegExp =
  // biome-ignore lint: regex escapes are fine
  /[\u0000-\u001f\u0022\u005c\ud800-\udfff]|[\ud800-\udbff](?![\udc00-\udfff])|(?:[^\ud800-\udbff]|^)[\udc00-\udfff]/;
const strEscapeSequencesReplacer =
  // biome-ignore lint: regex escapes are fine
  /[\u0000-\u001f\u0022\u005c\ud800-\udfff]|[\ud800-\udbff](?![\udc00-\udfff])|(?:[^\ud800-\udbff]|^)[\udc00-\udfff]/g;
const meta = [
  '\\u0000',
  '\\u0001',
  '\\u0002',
  '\\u0003',
  '\\u0004',
  '\\u0005',
  '\\u0006',
  '\\u0007',
  '\\b',
  '\\t',
  '\\n',
  '\\u000b',
  '\\f',
  '\\r',
  '\\u000e',
  '\\u000f',
  '\\u0010',
  '\\u0011',
  '\\u0012',
  '\\u0013',
  '\\u0014',
  '\\u0015',
  '\\u0016',
  '\\u0017',
  '\\u0018',
  '\\u0019',
  '\\u001a',
  '\\u001b',
  '\\u001c',
  '\\u001d',
  '\\u001e',
  '\\u001f',
  '',
  '',
  '\\"',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '\\\\',
];

const esc_ = (str: string): string => {
  if (str.length === 2) return str[0] + '\\u' + str.charCodeAt(1).toString(16);
  const charCode = str.charCodeAt(0);
  return meta.length > charCode ? meta[charCode] : '\\u' + charCode.toString(16);
};

// biome-ignore lint: escape name is intended
export const escape = (str: string): string => {
  let point: number,
    last = 0,
    result = '';
  if (str.length < 5000 && !strEscapeSequencesRegExp.test(str)) return str;
  if (str.length > 100) return str.replace(strEscapeSequencesReplacer, esc_);
  for (let i = 0; i < str.length; i++) {
    point = str.charCodeAt(i);
    if (point === 34 || point === 92 || point < 32) {
      result += str.slice(last, i) + meta[point];
      last = i + 1;
    } else if (point >= 0xd800 && point <= 0xdfff) {
      if (point <= 0xdbff && i + 1 < str.length) {
        point = str.charCodeAt(i + 1);
        if (point >= 0xdc00 && point <= 0xdfff) {
          i++;
          continue;
        }
      }
      result += str.slice(last, i) + '\\u' + point.toString(16);
      last = i + 1;
    }
  }
  result += str.slice(last);
  return result;
};
