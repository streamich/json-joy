export const tick = (ms: number = 1) => new Promise((r) => setTimeout(r, ms));

export const until = async (check: () => boolean, pollInterval: number = 1) => {
  do {
    if (check()) return;
    await tick(pollInterval);
  } while (true);
};

const nodeMajorVersion = +process.version.split('.')[0].slice(1);

export const onlyOnNode20 = nodeMajorVersion >= 20 ? describe : describe.skip;
