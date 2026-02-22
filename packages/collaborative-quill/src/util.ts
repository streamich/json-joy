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
