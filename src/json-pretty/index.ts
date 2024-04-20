export const prettyOneLine = (value: unknown): string => {
  let json = JSON.stringify(value);
  json = json.replace(/([\{\[\:\,])/g, '$1 ').replace(/([\}\]])/g, ' $1');
  return json;
};
