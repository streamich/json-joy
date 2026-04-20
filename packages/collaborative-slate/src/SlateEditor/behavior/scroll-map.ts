import {ReactEditor} from 'slate-react';
import type {Editor} from 'slate';
import type {ChecklistListElement, CustomElement, ListItemElement} from '../types';

export interface ScrollMapElementDescriptor {
  color: string;
  height: number;
  el?: CustomElement;
  proportional?: boolean;
  left?: number;
  right?: number;
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
  return clamp(Math.max(descriptor.height, scaled), descriptor.height, 28);
};

const describeScrollMapElement = (element: CustomElement, light: boolean): ScrollMapElementDescriptor | null => {
  switch (element.type) {
    case 'h1':
      return {el: element, color: light ? '#4b5563' : '#e5e7eb', height: 4};
    case 'h2':
      return {el: element, color: light ? '#6b7280' : '#cbd5e1', height: 3};
    case 'h3':
      return {el: element, color: light ? '#94a3b8' : '#94a3b8', height: 2};
    case 'h4':
    case 'h5':
    case 'h6':
      return {el: element, color: light ? '#cbd5e1' : '#64748b', height: 2};
    case 'blockquote':
      return {
        el: element,
        color: light ? 'rgba(194, 120, 24, 0.82)' : 'rgba(245, 182, 84, 0.82)',
        height: 3,
        proportional: true,
      };
    case 'code-block':
      return {
        el: element,
        color: light ? 'rgba(67, 97, 238, 0.78)' : 'rgba(129, 160, 255, 0.82)',
        height: 4,
        proportional: true,
      };
    case 'embed':
      return {
        el: element,
        color: light ? 'rgba(168, 85, 247, 0.78)' : 'rgba(196, 181, 253, 0.84)',
        height: 4,
        proportional: true,
      };
    case 'ul':
      return {
        el: element,
        color: light ? 'rgba(27, 184, 212, 0.76)' : 'rgba(96, 199, 250, 0.82)',
        height: 3,
        proportional: true,
        right: 6,
      };
    case 'ol':
      return {
        el: element,
        color: light ? 'rgba(13, 107, 148, 0.76)' : 'rgba(45, 167, 212, 0.82)',
        height: 3,
        proportional: true,
        right: 6,
      };
    case 'checklist': {
      const {checkedCount, totalCount} = getChecklistProgress(element);
      const complete = totalCount > 0 && checkedCount === totalCount;
      const started = checkedCount > 0 && checkedCount < totalCount;
      return {
        el: element,
        color: complete
          ? light ? '#2f8f35' : '#7be08f'
          : started
            ? light
              ? 'rgba(234, 179, 8, 0.86)'
              : 'rgba(250, 204, 21, 0.9)'
            : light
              ? 'rgba(220, 38, 38, 0.8)'
              : 'rgba(248, 113, 113, 0.86)',
        height: 3,
        proportional: true,
        right: 6,
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
  return markers;
};
