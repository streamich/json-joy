export type JsonTypeValidator = (value: unknown) => unknown;

export type ValidationPath = Array<string | number | {r: string}>;
