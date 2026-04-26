import * as React from 'react';
import {rsync, UiLifeCycles} from '@jsonjoy.com/ui';
// import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {ReactEditor} from 'slate-react';
import {isMarkActive, toggleMark} from '../../behavior';
import type {AnchorPoint} from '@jsonjoy.com/ui/lib/utils/popup/types';
import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import type {MuTxtState} from '../../state/MuTxtState';
import type {Editor} from 'slate';
import type {ScrollState} from '@jsonjoy.com/ui/lib/4-card/ScrollArea';

const TOOLBAR_HEIGHT = 36;
const GAP = 8;
const TOOLBAR_VIEWPORT_OVERFLOW_LIMIT = 50;

const offscreenPoint = (): AnchorPoint => ({x: 0, y: 0, dx: 0, dy: -1});

export class InlineState implements UiLifeCycles {
  // public readonly boldActive: rsync.ReactComputed<boolean>;
  // public readonly italicActive: rsync.ReactComputed<boolean>;
  // public readonly underlineActive: rsync.ReactComputed<boolean>;
  // public readonly codeActive: rsync.ReactComputed<boolean>;
  // public readonly linkSelected = rsync.val(false);
  // public readonly point: rsync.ReactComputed<AnchorPoint>;
  // public readonly visible: rsync.ReactComputed<boolean>;

  // public readonly menu: MenuItem;

  // private readonly editor: Editor;
  public readonly pointerDownOutsideToolbar = rsync.val(false);
  private readonly toolbarFocused = rsync.val(false);
  private readonly toolbarInteracting = rsync.val(false);
  private toolbarElement: HTMLDivElement | null = null;
  private retainedPoint: AnchorPoint = offscreenPoint();
  private interactionFrame: number | null = null;
  private refreshFrame: number | null = null;
  public readonly viewportVersion = rsync.val(0);

  constructor(
    private readonly mutxt: MuTxtState,
    private readonly scrollArea: ScrollState | null,
  ) {
    // const editor = this.editor = mutxt.editor;
    // this.boldActive = rsync.comp([mutxt.version], () => isMarkActive(editor, 'bold'));
    // this.italicActive = rsync.comp([mutxt.version], () => isMarkActive(editor, 'italic'));
    // this.underlineActive = rsync.comp([mutxt.version], () => isMarkActive(editor, 'underline'));
    // this.codeActive = rsync.comp([mutxt.version], () => isMarkActive(editor, 'code'));
    // this.point = rsync.comp(
    //   [mutxt.selection, mutxt.version, mutxt.scrollVersion, this.toolbarInteracting],
    //   ([selection, _version, _scrollVersion, toolbarInteracting]) => {
    //     if (selection) {
    //       const point = this.anchorPoint(selection);
    //       this.retainedPoint = point;
    //       return point;
    //     }
    //     return toolbarInteracting ? this.retainedPoint : offscreenPoint();
    //   },
    // );
    // this.visible = rsync.comp(
    //   [
    //     mutxt.selection,
    //     mutxt.focused,
    //     mutxt.version,
    //     mutxt.scrollVersion,
    //     this.point,
    //     this.toolbarFocused,
    //     this.pointerDownOutsideToolbar,
    //     this.toolbarInteracting,
    //   ],
    //   ([selection, focused, _version, _scrollVersion, point, toolbarFocused, pointerDownOutsideToolbar, toolbarInteracting]) =>
    //     (!!selection || toolbarInteracting) &&
    //     (focused || toolbarFocused || toolbarInteracting) &&
    //     !pointerDownOutsideToolbar &&
    //     this.isToolbarWithinViewport(point),
    // );

    // const exec = (fn: () => void) => (event: React.MouseEvent) => {
    //   event.preventDefault();
    //   this.beginToolbarInteraction();
    //   fn();
    //   ReactEditor.focus(editor as ReactEditor);
    //   mutxt.setFocused(true);
    //   this.mutxt.sync(false)
    //   this.endToolbarInteraction();
    // };

    // this.menu = this.mutxt.menu.inline.build();
    // this.menu = {
    //   name: 'floating-toolbar',
    //   expand: 1e3,
    //   children: [
    //     {
    //       name: 'Bold',
    //       keys: ['Mod+B'],
    //       icon: () => <Iconista set="radix" icon="font-bold" width={16} height={16} />,
    //       active: this.boldActive,
    //       onSelect: exec(() => toggleMark(editor, 'bold')),
    //     },
    //     {
    //       name: 'Italic',
    //       keys: ['Mod+I'],
    //       icon: () => <Iconista set="lucide" icon="italic" width={16} height={16} />,
    //       active: this.italicActive,
    //       onSelect: exec(() => toggleMark(editor, 'italic')),
    //     },
    //     {
    //       name: 'Underline',
    //       keys: ['Mod+U'],
    //       icon: () => <Iconista set="tabler" icon="underline" width={16} height={16} />,
    //       active: this.underlineActive,
    //       onSelect: exec(() => toggleMark(editor, 'underline')),
    //     },
    //     {
    //       name: 'Code',
    //       keys: ['Mod+`'],
    //       icon: () => <Iconista set="tabler" icon="code" width={16} height={16} />,
    //       active: this.codeActive,
    //       onSelect: exec(() => toggleMark(editor, 'code')),
    //     },
    //     {
    //       name: 'Link',
    //       keys: ['Mod+K'],
    //       sepBefore: true,
    //       icon: () => <Iconista set="lucide" icon="link" width={16} height={16} />,
    //       active: this.linkSelected,
    //       onSelect: exec(() => mutxt.requestLinkMenu?.()),
    //     },
    //   ],
    // };
  }

  public readonly start = (): (() => void) => {
    // document.addEventListener('pointerdown', this.onDocumentPointerDown, true);
    // document.addEventListener('pointerup', this.onDocumentPointerUp, true);
    // document.addEventListener('pointercancel', this.onDocumentPointerUp, true);
    // document.addEventListener('scroll', this.onViewportChange, true);
    // window.addEventListener('resize', this.onViewportChange);
    // this.syncToolbarFocus();
    return () => {
      // if (this.interactionFrame !== null) {
      //   cancelAnimationFrame(this.interactionFrame);
      //   this.interactionFrame = null;
      // }
      // if (this.refreshFrame !== null) {
      //   cancelAnimationFrame(this.refreshFrame);
      //   this.refreshFrame = null;
      // }
      // document.removeEventListener('pointerdown', this.onDocumentPointerDown, true);
      // document.removeEventListener('pointerup', this.onDocumentPointerUp, true);
      // document.removeEventListener('pointercancel', this.onDocumentPointerUp, true);
      // document.removeEventListener('scroll', this.onViewportChange, true);
      // window.removeEventListener('resize', this.onViewportChange);
    };
  };

  // public readonly setToolbarElement = (element: HTMLDivElement | null): void => {
  //   this.toolbarElement = element;
  //   this.syncToolbarFocus();
  // };

  // public readonly onToolbarMouseDown = (event: React.MouseEvent): void => {
  //   event.preventDefault();
  //   this.beginToolbarInteraction();
  //   this.pointerDownOutsideToolbar.set(false);
  // };

  // public readonly onToolbarFocusCapture = (): void => {
  //   this.syncToolbarFocus();
  // };

  // public readonly onToolbarBlurCapture = (): void => {
  //   queueMicrotask(this.syncToolbarFocus);
  // };

  // private readonly onDocumentPointerDown = (event: PointerEvent): void => {
  //   const target = event.target;
  //   const insideToolbar = !!this.toolbarElement && target instanceof Node && this.toolbarElement.contains(target);
  //   this.pointerDownOutsideToolbar.set(!insideToolbar);
  //   if (insideToolbar) {
  //     this.beginToolbarInteraction();
  //     this.syncToolbarFocus();
  //   }
  // };

  // private readonly onDocumentPointerUp = (): void => {
  //   this.pointerDownOutsideToolbar.set(false);
  //   this.endToolbarInteraction();
  //   this.syncToolbarFocus();
  // };

  // private readonly onViewportChange = (): void => {
  //   if (this.refreshFrame !== null) return;
  //   this.refreshFrame = window.requestAnimationFrame(() => {
  //     this.refreshFrame = null;
  //     this.viewportVersion.next(this.viewportVersion.value + 1);
  //   });
  // };

  // private readonly beginToolbarInteraction = (): void => {
  //   if (this.interactionFrame !== null) {
  //     cancelAnimationFrame(this.interactionFrame);
  //     this.interactionFrame = null;
  //   }
  //   this.toolbarInteracting.set(true);
  //   this.pointerDownOutsideToolbar.set(false);
  // };

  // private readonly endToolbarInteraction = (): void => {
  //   if (typeof window === 'undefined') {
  //     this.toolbarInteracting.set(false);
  //     return;
  //   }
  //   if (this.interactionFrame !== null) cancelAnimationFrame(this.interactionFrame);
  //   this.interactionFrame = window.requestAnimationFrame(() => {
  //     this.interactionFrame = window.requestAnimationFrame(() => {
  //       this.interactionFrame = null;
  //       this.toolbarInteracting.set(false);
  //       this.syncToolbarFocus();
  //     });
  //   });
  // };

  // private readonly syncToolbarFocus = (): void => {
  //   this.toolbarFocused.set(!!this.toolbarElement?.contains(document.activeElement));
  // };

  public anchorPoint(): AnchorPoint | undefined {
    const mutxt = this.mutxt;
    const selection = mutxt.selection.value;
    if (!selection) return;
    // mutxt.api.focusRect();
    try {
      const domRange = ReactEditor.toDOMRange(mutxt.editor as ReactEditor, selection);
      const selectionRect = domRange.getBoundingClientRect();
      const focusRect = this.getFocusCaretRect() ?? selectionRect;
      const x = focusRect.width > 0 ? focusRect.left + focusRect.width / 2 : focusRect.left;
      if (focusRect.top < TOOLBAR_HEIGHT + GAP)
        return {x, y: focusRect.bottom + GAP, dx: 0, dy: 1};
      return {x, y: focusRect.top - GAP, dx: 0, dy: -1};
    } catch {
      return;
    }
  }

  // private isToolbarWithinViewport(point: AnchorPoint): boolean {
  //   if (!this.scrollArea?.viewportEl) return true;
  //   if (typeof window === 'undefined' || typeof document === 'undefined') return true;
  //   try {
  //     const viewportRect = this.scrollArea.viewportEl.getBoundingClientRect();
  //     const toolbarHeight = this.toolbarElement?.getBoundingClientRect().height || TOOLBAR_HEIGHT;
  //     const top = point.dy < 0 ? point.y - toolbarHeight : point.y;
  //     const bottom = point.dy < 0 ? point.y : point.y + toolbarHeight;
  //     const topOverflow = Math.max(viewportRect.top - top, 0);
  //     const bottomOverflow = Math.max(bottom - viewportRect.bottom, 0);

  //     return topOverflow <= TOOLBAR_VIEWPORT_OVERFLOW_LIMIT && bottomOverflow <= TOOLBAR_VIEWPORT_OVERFLOW_LIMIT;
  //   } catch {
  //     return false;
  //   }
  // }

  private getFocusCaretRect(): DOMRect | null {
    const nativeSelection = window.getSelection();
    if (!nativeSelection?.focusNode) return null;
    try {
      const focusRange = document.createRange();
      focusRange.setStart(nativeSelection.focusNode, nativeSelection.focusOffset);
      focusRange.collapse(true);
      const rect = focusRange.getClientRects()[0] ?? focusRange.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) return rect;
      return null;
    } catch {
      return null;
    }
  }
}
