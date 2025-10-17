export const tick = (ms: number = 1) => new Promise((r) => setTimeout(r, ms));

export const until = async (check: () => boolean, pollInterval: number = 1) => {
  do {
    if (check()) return;
    await tick(pollInterval);
  } while (
    // biome-ignore lint: loop is intended
    true
  );
};
