export type JsonMlNode = string | JsonMlElement;
export type JsonMlElement = [tag: string | number, attrs: null | Record<string, unknown>, ...children: JsonMlNode[]];
