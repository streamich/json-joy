export const isEmpty = (obj: object): boolean => {
  for (const key in obj)
    if (
      // biome-ignore lint: .hasOwnProperty access is intentional
      Object.prototype.hasOwnProperty.call(obj, key)
    )
      return false;
  return true;
};
