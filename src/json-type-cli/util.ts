const validParamTypes = ['j', 'json', 's', 'str', 'n', 'num', 'b', 'bool'] as const;
const PARAM_REGEX = new RegExp(`^(${validParamTypes.join('|')})(\\/.*)$`);

export const parseParamKey = (key: string): undefined | [type: string, path: `/${string}`] => {
  const match = PARAM_REGEX.exec(key);
  if (!match) return undefined;
  const [, type, path] = match;
  return [type, path as `/${string}`];
};

export const parseParams = () => {};
