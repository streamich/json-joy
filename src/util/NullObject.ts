export const NullObject = function NullObject() {} as any as new () => Record<string, unknown>;
NullObject.prototype = Object.create(null);
