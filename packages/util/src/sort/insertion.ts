/**
 * Insertion sort, should be faster than built-int sort for small arrays.
 *
 * @todo Move this to `thingies` package.
 *
 * @param arr Array to sort.
 * @returns Returns the same array instance.
 */
export const sort = <T>(arr: T[]): T[] => {
  const length = arr.length;
  for (let i = 1; i < length; i++) {
    const currentValue = arr[i];
    let position = i;
    while (position !== 0 && arr[position - 1] > currentValue) {
      arr[position] = arr[position - 1];
      position--;
    }
    arr[position] = currentValue;
  }
  return arr;
};
