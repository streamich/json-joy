/* tslint:disable no-console */

/**
 * Run this demo with:
 *
 *     npx nodemon -q -x ts-node src/json-crdt/__demos__/issue-801.ts
 *
 * @see issue: https://github.com/streamich/json-joy/issues/801
 */

// Original source:
//
// interface SimpleObjectI {
//   text: string
// }
// const SimpleObjectSchema = s.obj({
//   text: s.con(''),
// })
// const model = Model.create().setSchema(SimpleObjectSchema)
// const root: SimpleObjectI = {
//   text: 'foo'
// }
// model.api.root(root)
// type SimpleObjectNodeType =  ObjNode<{
//   text: ConNode<string>
// }>
// function foo(_node: ObjApi<SimpleObjectNodeType>) {}
// foo(model.api.node)

import {type JsonNodeView, Model} from '..';
import {s} from '../../json-crdt-patch';
import type {SchemaToJsonNode} from '../schema/types';

const SimpleObjectSchema = s.obj({
  text: s.con<string>('foo'),
});

const model = Model.create(SimpleObjectSchema);

type SimpleObjectNodeType = SchemaToJsonNode<typeof SimpleObjectSchema>;
type SimpleObjectI = JsonNodeView<SimpleObjectNodeType>;
// type SimpleObjectI = ReturnType<(typeof model)['view']>;

console.log(model + '');
