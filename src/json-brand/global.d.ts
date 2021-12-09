declare global {
  interface JSON {
    parse<T>(text: json<T>, reviver?: (key: any, value: any) => any): T;
    stringify<T>(value: T, replacer?: (key: string, value: any) => any, space?: string | number): json<T>;
    stringify<T>(value: T, replacer?: (number | string)[] | null, space?: string | number): json<T>;
  }
}
