import {isValidIndex} from '@jsonjoy.com/json-pointer';

export function replaceIndices(path: string, arrayPath: string, index: string, incUp: boolean): string {
  const remainder = path.substr(arrayPath.length);
  let slashIndex = remainder.indexOf('/');
  if (slashIndex === -1) slashIndex = remainder.length;
  const oldIndex = remainder.substr(0, slashIndex);
  const rest = remainder.substr(slashIndex);
  const isOldBigger = incUp ? oldIndex >= index : oldIndex > index;
  const shouldChangeIndex = isValidIndex(oldIndex) && isOldBigger;
  return shouldChangeIndex ? `${arrayPath}${~~oldIndex + (incUp ? 1 : -1)}${rest}` : path;
}
