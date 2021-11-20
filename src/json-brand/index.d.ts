export type json<T extends any = any> = string & {__JSON__: T};
export type json_string<T> = json<T>;

export interface JSON {
  parse<T>(text: json<T>, reviver?: (key: any, value: any) => any): T;
  stringify<T>(value: T, replacer?: (key: string, value: any) => any, space?: string | number): json<T>;
  stringify<T>(value: T, replacer?: (number | string)[] | null, space?: string | number): json<T>;
}

export const JSON: JSON;
