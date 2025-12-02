import type {Fragment, Mark, Node, Schema} from 'prosemirror-model';
import type {PmJsonTextNode, PmJsonNode} from './types';

export const fromJSON = (
  schema: Schema,
  json: PmJsonNode | PmJsonTextNode,
  createFragment: (nodes?: Node[]) => Fragment,
): Node => {
  const {type, attrs, content, marks, text} = json as PmJsonNode & PmJsonTextNode;
  const _marks: Mark[] | undefined = Array.isArray(marks)
    ? marks.map((mark) => schema.mark(mark.type, mark.attrs))
    : void 0;
  return type === 'text'
    ? schema.text(typeof text === 'string' ? text : '', _marks)
    : (schema as any)
        .nodeType(type)
        .create(
          attrs,
          Array.isArray(content)
            ? createFragment(content.map((val) => fromJSON(schema, val, createFragment)))
            : createFragment(),
          _marks,
        );
};
