import type {SlateEditorDocument} from 'mutxt-react';
import type {ObjApi, ObjNode} from 'json-joy/lib/json-crdt';
import type {FORMATS} from './constants';

export type MuTxtFormat = (typeof FORMATS)[number];

/** Resolved seed payload passed to `<MuTxt>` at mount time. */
export interface SeedProps {
  fromSlate?: SlateEditorDocument;
  obj?: ObjApi<ObjNode>;
}
