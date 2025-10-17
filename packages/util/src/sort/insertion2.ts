/**
 * Insertion sort, should be faster than built-int sort for small arrays.
 *
 * @todo Move this to `thingies` package.
 *
 * @param arr Array to sort.
 * @param comparator Comparator function.
 * @returns Returns the same array instance.
 */
export const sort = <T>(arr: T[], comparator: (a: T, b: T) => number): T[] => {
  const length = arr.length;
  for (let i = 1; i < length; i++) {
    const currentValue = arr[i];
    let position = i;
    while (position !== 0 && comparator(arr[position - 1], currentValue) > 0) {
      arr[position] = arr[position - 1];
      position--;
    }
    arr[position] = currentValue;
  }
  return arr;
};
