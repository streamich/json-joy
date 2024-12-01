import {SliceTypeName} from "../slice";
import type {JsonMlNode} from "../../../json-ml";
import type {PeritextMlNode} from "../block/types";

export const toJsonMl = (json: PeritextMlNode): JsonMlNode => {
  if (typeof json === 'string') return json;
  const [tag, attr, ...children] = json;
  const namedTag = tag === '' ? tag : SliceTypeName[tag as any];
  const htmlTag = namedTag ?? (attr?.inline ? 'span' : 'div');
  const htmlAttr = attr && (attr.data !== void 0) ? {'data-attr': JSON.stringify(attr.data)} : null;
  const htmlNode: JsonMlNode = [htmlTag, htmlAttr];
  const length = children.length;
  for (let i = 0; i < length; i++) htmlNode.push(toJsonMl(children[i]));
  return htmlNode;
};
