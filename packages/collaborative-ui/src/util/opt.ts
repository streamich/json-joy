export const opt = (fn: (...args: any[]) => any) => {
  try {
    return fn();
  } catch {}
};
