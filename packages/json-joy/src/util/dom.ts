/**
 * Save the current browser selection, so that it can be restored later. Returns
 * a callback to restore the selection.
 *
 * @returns Callback to restore the selection.
 */
export const saveSelection = (): (() => void) | undefined => {
  const selection = window?.getSelection();
  if (!selection) return;
  const ranges: Range[] = [];
  for (let i = 0; i < selection.rangeCount; i++) ranges.push(selection.getRangeAt(i));
  return () => {
    selection.removeAllRanges();
    for (const range of ranges) selection.addRange(range);
  };
};
