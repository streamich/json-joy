export const isEmpty = (obj: object): boolean => {
  for (const key in obj) if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
  return true;
};
