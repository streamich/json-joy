export const canSkipObjectKeyUndefinedCheck = (type: string): boolean => {
  switch (type) {
    case 'const':
    case 'bool':
    case 'num':
    case 'str':
    case 'obj':
    case 'arr':
    case 'bin':
      return true;
    default:
      return false;
  }
};
