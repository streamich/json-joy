const REG_VALID = /^#?([0-9A-F]{3}|([0-9A-F]{6}([0-9a-f]{2})?))$/i;

export const isValid = (color: string) => {
  return REG_VALID.test(color);
};
