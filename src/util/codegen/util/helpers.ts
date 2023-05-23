export const emitStringMatch = (expression: string, offset: string, match: string) => {
  const conditions: string[] = [];
  for (let i = 0; i < match.length; i++)
    conditions.push(`${match.charCodeAt(i)} === ${expression}.charCodeAt(${offset} + ${i})`);
  return conditions.join(' && ');
};
