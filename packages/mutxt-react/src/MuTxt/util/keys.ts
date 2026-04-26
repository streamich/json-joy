const isMac = /mac/i.test(navigator.platform) || /macintosh/i.test(navigator.userAgent);
const separator = isMac ? ' ' : ' + ';

export const remap: Record<string, string> = {
  Primary: isMac ? '⌘' : 'Ctrl',
  Shift: isMac ? '⇧' : 'Shift',
  Alt: isMac ? '⌥' : 'Alt',
  Ctrl: isMac ? '⌃' : 'Ctrl',
};

export const formatKeys = (keys: string[]): string => {
  let str = '';
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    key = remap[key] ?? key;
    if (key.length === 1) key = key.toUpperCase();
    str += (str ? separator : '') + key;
  }
  return str;
};
