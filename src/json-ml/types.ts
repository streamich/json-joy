export type JsonMlNode = string | JsonMlElement;
export type JsonMlElement = [tag: string, attrs: null | Record<string, string>, ...children: JsonMlNode[]];
