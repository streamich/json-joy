import {EditorView} from 'prosemirror-view';
import {Fragment} from 'json-joy/lib/json-crdt-extensions/peritext/block/Fragment';
import {Range} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Range';
import type {PeritextApi} from 'json-joy/lib/json-crdt-extensions';
import type {ViewRange} from 'json-joy/lib/json-crdt-extensions/peritext/editor/types';
import type {PeritextRef, RichtextEditorFacade, PeritextOperation} from '../types';

export interface SlateFacadeOpts {
  history?: boolean;
}

export class SlateFacade implements RichtextEditorFacade {
  onchange?: (change: PeritextOperation | void) => (PeritextRef | void);
  onselection?: () => void;

  constructor(
    protected readonly view: EditorView,
    protected readonly peritext: PeritextRef,
    protected readonly opts: SlateFacadeOpts = {},
  ) {}

  get(): ViewRange {
    throw new Error('Not implemented');
  }

  set(fragment: Fragment<string>): void {
    throw new Error('Not implemented');
  }

  getSelection(peritext: PeritextApi): [range: Range<string>, startIsAnchor: boolean] | undefined {
    throw new Error('Not implemented');
  }

  setSelection(peritext: PeritextApi, range: Range<string>, startIsAnchor: boolean): void {
    throw new Error('Not implemented');
  }

  dispose(): void {    
  }
}
