export const applyChange = (view: string, position: number, remove: number, insert: string): string =>
  view.slice(0, position) + insert + view.slice(position + remove);

export const invokeFirstOnly = () => {
  let invoked: boolean = false;
  return (fn: () => void): void => {
    if (invoked) return;
    invoked = true;
    try {
      fn();
    } finally {
      invoked = false;
    }
  };
};
