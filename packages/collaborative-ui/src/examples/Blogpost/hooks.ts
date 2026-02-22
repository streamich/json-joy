import {useSelectNode} from '../../hooks/useSelectNode';
import type {ArrApi} from 'json-joy/lib/json-crdt';
import type {BlogpostModel} from './schema';

export const useTags = (model: BlogpostModel) => useSelectNode(model, (s) => s.tags.$.asArr()) as ArrApi | null;

export type TagsApi = NonNullable<ReturnType<typeof useTags>>;
