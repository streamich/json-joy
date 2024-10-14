import type {PeritextNode, PeritextApi, QuillDeltaNode, QuillDeltaApi} from '../../../json-crdt-extensions';
import { Extension } from '../../extensions/Extension';
import { ExtNode } from '../../extensions/ExtNode';
import type * as types from '../../nodes';
import type * as nodes from './nodes';

// prettier-ignore
export type JsonNodeApi<N, Extensions extends Extension<number, any, any, any, any>[]> = 
N extends ExtNode<any>
	? Extensions extends (infer ExtsUnion)[] 
				? Extract<ExtsUnion, { readonly id: N['extId'] }> extends Extension<number, any, any, infer Api, any, any>
							? Api
							: never
				: never
	:	N extends types.ConNode<any>
		? nodes.ConApi<N>
		: N extends types.RootNode<any>
			? nodes.ValApi<N>
			: N extends types.ValNode<any>
				? nodes.ValApi<N, Extensions>
				: N extends types.StrNode
					? nodes.StrApi
					: N extends types.BinNode
						? nodes.BinApi
						: N extends types.ArrNode<any>
							? nodes.ArrApi<N, Extensions>
							: N extends types.ObjNode<any>
								? nodes.ObjApi<N, Extensions>
								: N extends types.VecNode<any>
									? nodes.VecApi<N, Extensions>
									: N extends PeritextNode
										? PeritextApi
										: N extends QuillDeltaNode
											? QuillDeltaApi
											: never;
