export const invokeFirstOnly = () => {
  let invoked: boolean = false;
  return <T = void>(fn: () => T): T | undefined => {
    if (invoked) return;
    invoked = true;
    try {
      return fn();
    } finally {
      invoked = false;
    }
  };
};
