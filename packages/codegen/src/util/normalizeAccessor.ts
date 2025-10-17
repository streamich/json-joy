export const normalizeAccessor = (accessor: string): string => {
  if (/^[a-z_][a-z_0-9]*$/i.test(accessor)) {
    return '.' + accessor;
  } else {
    return `[${JSON.stringify(accessor)}]`;
  }
};
