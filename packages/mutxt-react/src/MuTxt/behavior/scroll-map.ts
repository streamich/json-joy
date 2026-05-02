import {Range, type Editor} from 'slate';
import {ReactEditor} from 'slate-react';
import {getActiveEmbedEntry} from './embed';
import type {ChecklistListElement, CustomElement, ListItemElement} from '../types';

export interface ScrollMapElementDescriptor {
  color: string;
  height: number;
  variant?: 'left' | 'right' | 'wide' | 'selection';
  el?: CustomElement;
  proportional?: boolean;
}

export interface ScrollMapMarker extends ScrollMapElementDescriptor {
  key: string;
  position: number;
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const isElementNode = (node: unknown): node is CustomElement => {
  return !!node && typeof node === 'object' && 'type' in node && 'children' in node;
};

const getChecklistProgress = (element: ChecklistListElement): {checkedCount: number; totalCount: number} => {
  const items = element.children as ListItemElement[];
  return {
    checkedCount: items.filter((item) => !!item.checked).length,
    totalCount: items.length,
  };
};

const getMarkerHeight = (
  descriptor: ScrollMapElementDescriptor,
  blockHeight: number,
  scrollHeight: number,
  railHeight: number,
): number => {
  if (!descriptor.proportional || railHeight <= 0 || scrollHeight <= 0) return descriptor.height;
  const scaled = Math.round((Math.max(blockHeight, 1) / scrollHeight) * railHeight);
  return Math.max(descriptor.height, scaled);
};

const describeScrollMapElement = (element: CustomElement, light: boolean): ScrollMapElementDescriptor | null => {
  switch (element.type) {
    case 'title':
      return {el: element, color: light ? '#234' : '#f8fafc', height: 5, variant: 'wide'};
    case 'subtitle':
      return {el: element, color: light ? '#789' : '#94a3b8', height: 3, variant: 'wide'};
    case 'h1':
      return {el: element, color: light ? '#345' : '#e5e7eb', height: 4, variant: 'wide'};
    case 'h2':
      return {el: element, color: light ? '#456' : '#cbd5e1', height: 3, variant: 'wide'};
    case 'h3':
      return {el: element, color: light ? '#678' : '#94a3b8', height: 2, variant: 'wide'};
    case 'h4':
    case 'h5':
    case 'h6':
      return {el: element, color: light ? '#89a' : '#64748b', height: 2, variant: 'wide'};
    case 'blockquote':
      return {
        el: element,
        color: light ? 'rgba(194,120,24,.6)' : 'rgba(245,182,84,.5)',
        height: 3,
        proportional: true,
      };
    case 'callout':
      return {
        el: element,
        color: element.color?.trim() || (light ? 'rgba(59,130,246,.6)' : 'rgba(96,165,250,.55)'),
        height: 3,
        proportional: true,
      };
    case 'code-block':
      return {
        el: element,
        color: light ? 'rgba(54,155,55,.45)' : 'rgba(142,255,129,.5)',
        height: 4,
        proportional: true,
      };
    case 'pre':
      return {
        el: element,
        color: light ? 'rgba(100,116,139,.5)' : 'rgba(148,163,184,.5)',
        height: 3,
        proportional: true,
      };
    case 'embed':
      return {
        el: element,
        color: light ? 'rgba(168,85,247,.6)' : 'rgba(196,181,253,.5)',
        height: 4,
        proportional: true,
      };
    case 'ul':
      return {
        el: element,
        color: light ? 'rgba(27,184,212,.6)' : 'rgba(96,199,250,.5)',
        height: 3,
        proportional: true,
      };
    case 'ol':
      return {
        el: element,
        color: light ? 'rgba(13,107,148,.6)' : 'rgba(45,167,212,.5)',
        height: 3,
        proportional: true,
      };
    case 'checklist': {
      const {checkedCount, totalCount} = getChecklistProgress(element);
      const complete = totalCount > 0 && checkedCount === totalCount;
      const started = checkedCount > 0 && checkedCount < totalCount;
      return {
        el: element,
        color: complete
          ? light
            ? '#2f8f35'
            : '#7be08f'
          : started
            ? light
              ? 'rgba(200,150,40,.6)'
              : 'rgba(250,204,21,.5)'
            : light
              ? 'rgba(220,38,38,.6)'
              : 'rgba(248,113,113,.5)',
        height: 3,
        proportional: true,
      };
    }
    default: {
      const type = element.type as string;
      if (type === 'table') {
        return {
          el: element,
          color: light ? 'rgba(22, 163, 74, 0.76)' : 'rgba(74, 222, 128, 0.82)',
          height: 4,
          proportional: true,
        };
      }
      return null;
    }
  }
};

const getDomRangeRect = (range: globalThis.Range): DOMRect | null => {
  const rect = range.getBoundingClientRect();
  if (rect.height > 0 || rect.width > 0) return rect;
  return range.getClientRects()[0] ?? null;
};

const getFocusedDomSelectionRange = (reactEditor: Editor & ReactEditor): globalThis.Range | null => {
  if (!ReactEditor.isFocused(reactEditor)) return null;
  const domSelection = ReactEditor.getWindow(reactEditor).getSelection();
  if (!domSelection || domSelection.rangeCount <= 0) return null;
  const anchorNode = domSelection.anchorNode;
  const focusNode = domSelection.focusNode;
  if (!anchorNode || !focusNode) return null;
  if (!ReactEditor.hasDOMNode(reactEditor, anchorNode) || !ReactEditor.hasDOMNode(reactEditor, focusNode)) return null;
  return domSelection.getRangeAt(0);
};

const getScrollMapSelectionRect = (
  reactEditor: Editor & ReactEditor,
  light: boolean,
): {rect: DOMRect; proportional: boolean} | null => {
  const domSelectionRange = getFocusedDomSelectionRange(reactEditor);
  const activeEmbedEntry = getActiveEmbedEntry(reactEditor);
  if (activeEmbedEntry && domSelectionRange) {
    const [element] = activeEmbedEntry;
    const descriptor = describeScrollMapElement(element, light);
    try {
      const domNode = ReactEditor.toDOMNode(reactEditor, element);
      if (domNode instanceof HTMLElement) {
        return {
          rect: domNode.getBoundingClientRect(),
          proportional: descriptor?.proportional ?? true,
        };
      }
    } catch {
      // Slate may briefly invalidate the selected void node while reconciling changes.
    }
  }
  if (domSelectionRange) {
    const rect = getDomRangeRect(domSelectionRange);
    if (!rect) return null;
    return {
      rect,
      proportional: !domSelectionRange.collapsed,
    };
  }
  const selection = reactEditor.selection;
  if (!selection) return null;
  if (!ReactEditor.isFocused(reactEditor) || !ReactEditor.hasRange(reactEditor, selection)) return null;
  try {
    const domRange = ReactEditor.toDOMRange(reactEditor, selection);
    const rect = getDomRangeRect(domRange);
    if (!rect) return null;
    return {
      rect,
      proportional: !Range.isCollapsed(selection),
    };
  } catch {
    return null;
  }
};

const measureScrollMapSelectionMarker = (
  reactEditor: Editor & ReactEditor,
  viewportEl: HTMLDivElement,
  viewportRect: DOMRect,
  scrollHeight: number,
  railHeight: number,
  light: boolean,
): ScrollMapMarker | null => {
  const selection = reactEditor.selection;
  if (!selection) return null;
  const selectionRect = getScrollMapSelectionRect(reactEditor, light);
  if (!selectionRect) return null;
  const descriptor: ScrollMapElementDescriptor = {
    color: '#07f',
    height: 4,
    proportional: selectionRect.proportional,
    variant: 'selection',
  };
  const top = selectionRect.rect.top - viewportRect.top + viewportEl.scrollTop;
  return {
    ...descriptor,
    key: 'selection',
    color: 'transparent',
    position: clamp(top / scrollHeight, 0, 1),
    height: getMarkerHeight(descriptor, selectionRect.rect.height, scrollHeight, railHeight),
  };
};

export const measureScrollMapMarkers = (
  editor: Editor,
  viewportEl: HTMLDivElement,
  scrollHeight: number,
  railHeight: number,
  light: boolean,
): ScrollMapMarker[] => {
  if (scrollHeight <= viewportEl.clientHeight || scrollHeight <= 0) return [];
  const markers: ScrollMapMarker[] = [];
  const reactEditor = editor as Editor & ReactEditor;
  const viewportRect = viewportEl.getBoundingClientRect();
  editor.children.forEach((node, index) => {
    if (!isElementNode(node)) return;
    const descriptor = describeScrollMapElement(node, light);
    if (!descriptor) return;
    try {
      const domNode = ReactEditor.toDOMNode(reactEditor, node);
      if (!(domNode instanceof HTMLElement)) return;
      const rect = domNode.getBoundingClientRect();
      const top = rect.top - viewportRect.top + viewportEl.scrollTop;
      markers.push({
        ...descriptor,
        key: index + ':' + node.type,
        position: clamp(top / scrollHeight, 0, 1),
        height: getMarkerHeight(descriptor, rect.height, scrollHeight, railHeight),
      });
    } catch {
      // Slate may briefly unmount/remount nodes while reconciling changes.
    }
  });
  const selectionMarker = measureScrollMapSelectionMarker(
    reactEditor,
    viewportEl,
    viewportRect,
    scrollHeight,
    railHeight,
    light,
  );
  if (selectionMarker) markers.push(selectionMarker);
  return markers;
};
