const REG_VALID = /^#?([0-9A-F]{3}|([0-9A-F]{6}([0-9a-f]{2})?))$/i;

export const isValid = (color: string) => {
  return REG_VALID.test(color);
};

export const normalize = (color: string): string | null => {
  const match = color.match(REG_VALID);
  if (!match) return null;
  if (color[0] !== '#') color = '#' + color;
  if (color.length === 9 && color.endsWith('FF')) color = color.slice(0, 7);
  return color.toUpperCase();
};
