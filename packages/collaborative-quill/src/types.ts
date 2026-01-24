import type Delta from 'quill-delta';
import type {Range, EmitterSource} from 'quill';

export type OnTextChange = (delta: Delta, oldDelta: Delta, source: EmitterSource) => void;
export type OnSelectionChange = (range: Range, oldRange: Range, source: EmitterSource) => void;
export type OnEditorChange =
  | ((eventName: 'text-change', ...args: Parameters<OnTextChange>) => void)
  | ((eventName: 'selection-change', ...args: Parameters<OnSelectionChange>) => void);
