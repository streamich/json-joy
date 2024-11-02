import {isValidIndex, isChild, parent, type Path} from '@jsonjoy.com/json-pointer';

export const bumpArrayPath = (path1: Path, path2: Path): undefined | Path => {
  const folder = parent(path1);
  const lastIndex = path1.length - 1;
  const step1 = path1[lastIndex];
  if (isChild(folder, path2)) {
    const step2 = path2[lastIndex];
    if (isValidIndex(step2)) {
      const index1 = Number(step1);
      const index2 = Number(step2);
      if (index1 <= index2) {
        const steps = [...path2];
        steps[lastIndex] = String(index2 + 1);
        return steps;
      }
    }
  }
  return undefined;
};

export const lowerArrayPath = (path1: Path, path2: Path): undefined | Path => {
  const folder = parent(path1);
  const lastIndex = path1.length - 1;
  const step1 = path1[lastIndex];
  if (isChild(folder, path2)) {
    const step2 = path2[lastIndex];
    if (isValidIndex(step2)) {
      const index1 = Number(step1);
      const index2 = Number(step2);
      if (index1 < index2) {
        const steps = [...path2];
        steps[lastIndex] = String(index2 - 1);
        return steps;
      }
    }
  }
  return undefined;
};
