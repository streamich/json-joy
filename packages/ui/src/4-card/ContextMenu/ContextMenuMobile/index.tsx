import * as React from 'react';
import {Drawer} from 'vaul';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {useStyles} from '../../../styles/context';
import {usePopup} from '../../Popup/context';
import {ArgsPane} from '../ArgsPane';
import {Portal} from '../../../utils/portal';
import {MobileMenuPane} from './MobileMenuPane';
import {ensureVaulCss} from './vaulCss';
import {sheetClass, overlayClass, handleAreaClass, paneClass, visuallyHiddenClass} from './styles';
import type {MenuItem} from '../../StructuralMenu/types';
import type {ContextMenuPaneProps} from '../ContextMenu/ContextMenuPane';

export interface ContextMenuMobileProps extends ContextMenuPaneProps {}

/** Closes every level of the sheet up to and including the root. Wired by the root pane. */
const CloseAllContext = React.createContext<() => void>(() => {});

/**
 * `true` while the parent `<PaneSheet>` is open. When the root requests a
 * close-all, this flips `false` and propagates down so every nested level
 * also closes — they animate down together rather than the root vanishing
 * out from under a still-mounted child.
 */
const ParentOpenContext = React.createContext<boolean>(true);

/**
 * The DOM element passed as Vaul's `container` so each level's Drawer.Portal
 * mounts inside our in-house `<Portal>`. Without this every nested level
 * would mount to `document.body` (Vaul's default) and click-away walks in an
 * ancestor `<Popup>` would not recognize the nested drawer as "inside" — the
 * popup would close on every tap.
 */
const ContainerContext = React.createContext<HTMLElement | null>(null);

/**
 * Mobile-friendly bottom-sheet replacement for `<ContextMenu>`. Renders the
 * same `MenuItem` tree as the desktop variant but as a Vaul bottom sheet,
 * with submenus opening as Vaul nested drawers stacked on top.
 */
export const ContextMenuMobile: React.FC<ContextMenuMobileProps> = ({menu: rootMenu}) => {
  const popup = usePopup();

  React.useLayoutEffect(() => {
    ensureVaulCss();
  }, []);

  const [open, setOpen] = React.useState<boolean>(false);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const closeAll = React.useCallback(() => {
    setOpen(false);
  }, []);

  const handleRootOpenChange = React.useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  const handleRootAnimationEnd = React.useCallback(
    (isOpen: boolean) => {
      if (!isOpen) popup?.close();
    },
    [popup],
  );

  // Mount through the in-house `<Portal>` so that taps inside the sheet are
  // recognized as "inside" by `useClickAway` (which walks portal roots). This
  // prevents the parent `<Popup>`'s click-away handler from closing the sheet
  // on every interaction.
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  const setContainerRef = React.useCallback((el: HTMLDivElement | null) => {
    setContainer(el);
  }, []);

  return (
    <Portal>
      <div ref={setContainerRef} />
      {container && (
        <CloseAllContext.Provider value={closeAll}>
          <ContainerContext.Provider value={container}>
            <PaneSheet
              menu={rootMenu}
              open={open}
              onOpenChange={handleRootOpenChange}
              onAnimationEnd={handleRootAnimationEnd}
              isRoot
            />
          </ContainerContext.Provider>
        </CloseAllContext.Provider>
      )}
    </Portal>
  );
};

interface PaneSheetProps {
  menu: MenuItem;
  parent?: MenuItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnimationEnd?: (open: boolean) => void;
  isRoot?: boolean;
}

interface NestedState {
  kind: 'menu' | 'args';
  item: MenuItem;
}

const PaneSheet: React.FC<PaneSheetProps> = ({menu, parent, open, onOpenChange, onAnimationEnd, isRoot}) => {
  const styles = useStyles();
  const closeAll = React.useContext(CloseAllContext);
  const parentOpen = React.useContext(ParentOpenContext);
  const container = React.useContext(ContainerContext);

  const [nested, setNested] = React.useState<NestedState | null>(null);
  const [nestedOpen, setNestedOpen] = React.useState<boolean>(false);

  const effectiveOpen = open && parentOpen;

  const handlePushMenu = React.useCallback((item: MenuItem) => {
    setNested({kind: 'menu', item});
    requestAnimationFrame(() => setNestedOpen(true));
  }, []);

  const handlePushArgs = React.useCallback((item: MenuItem) => {
    setNested({kind: 'args', item});
    requestAnimationFrame(() => setNestedOpen(true));
  }, []);

  const handleNestedOpenChange = React.useCallback((next: boolean) => {
    setNestedOpen(next);
  }, []);

  const handleNestedAnimationEnd = React.useCallback((isOpen: boolean) => {
    if (!isOpen) setNested(null);
  }, []);

  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const requestBack = React.useCallback(() => {
    closeButtonRef.current?.click();
  }, []);

  // Slate / contenteditable hosts (mu-txt) close their floaters when focus
  // leaves the editor. The default mousedown behavior on a non-editable
  // element blurs the contenteditable, so we suppress it on the sheet —
  // except on inputs where we genuinely need focus.
  const handleSheetMouseDown = React.useCallback((event: React.MouseEvent) => {
    const tag = (event.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    event.preventDefault();
  }, []);

  const contentRef = React.useRef<HTMLDivElement>(null);
  const childIsOpen = nested !== null && nestedOpen;
  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.style.transition = 'transform .5s cubic-bezier(.32,.72,0,1)';
    el.style.transformOrigin = 'center top';
    el.style.transform = childIsOpen ? 'scale(.95) translateY(-12px)' : '';
  }, [childIsOpen]);

  const sheetBg = styles.bg + '';
  const fgColor = styles.g(0.15);
  const sheetClassName = sheetClass({
    bg: sheetBg,
    col: fgColor,
    bxsh: styles.light ? '0 -8px 32px rgba(0,0,0,.18)' : '0 -8px 32px rgba(0,0,0,.5)',
  });

  const RootCmp = isRoot ? Drawer.Root : Drawer.NestedRoot;

  return (
    <RootCmp
      open={effectiveOpen}
      onOpenChange={onOpenChange}
      onAnimationEnd={onAnimationEnd}
      direction="bottom"
      modal={isRoot}
      shouldScaleBackground={false}
      container={container ?? undefined}
    >
      <Drawer.Portal>
        <Drawer.Overlay className={overlayClass} />
        <Drawer.Content
          ref={contentRef}
          className={sheetClassName}
          aria-describedby={undefined}
          onMouseDown={handleSheetMouseDown}
        >
          <Drawer.Title className={visuallyHiddenClass}>{menu.name}</Drawer.Title>
          <DialogPrimitive.Close
            ref={closeButtonRef}
            className={visuallyHiddenClass}
            aria-hidden="true"
            tabIndex={-1}
          />
          <div className={handleAreaClass}>
            <Drawer.Handle />
          </div>
          <div className={paneClass({bg: sheetBg})}>
            <MobileMenuPane
              menu={menu}
              parent={parent}
              onPush={handlePushMenu}
              onBack={requestBack}
              onClose={closeAll}
              onSelectArgs={handlePushArgs}
            />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
      {nested && (
        <ParentOpenContext.Provider value={effectiveOpen}>
          {nested.kind === 'menu' ? (
            <PaneSheet
              menu={nested.item}
              parent={menu}
              open={nestedOpen}
              onOpenChange={handleNestedOpenChange}
              onAnimationEnd={handleNestedAnimationEnd}
            />
          ) : (
            <ArgsSheet
              item={nested.item}
              open={nestedOpen}
              onOpenChange={handleNestedOpenChange}
              onAnimationEnd={handleNestedAnimationEnd}
            />
          )}
        </ParentOpenContext.Provider>
      )}
    </RootCmp>
  );
};

interface ArgsSheetProps {
  item: MenuItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnimationEnd?: (open: boolean) => void;
}

const ArgsSheet: React.FC<ArgsSheetProps> = ({item, open, onOpenChange, onAnimationEnd}) => {
  const styles = useStyles();
  const closeAll = React.useContext(CloseAllContext);
  const parentOpen = React.useContext(ParentOpenContext);
  const container = React.useContext(ContainerContext);
  const effectiveOpen = open && parentOpen;

  const sheetBg = styles.bg + '';
  const fgColor = styles.g(styles.light ? 0.15 : 0.1);
  const sheetClassName = sheetClass({
    bg: sheetBg,
    col: fgColor,
    bxsh: styles.light ? '0 -8px 32px rgba(0,0,0,.18)' : '0 -8px 32px rgba(0,0,0,.5)',
  });

  const handleSheetMouseDown = React.useCallback((event: React.MouseEvent) => {
    const tag = (event.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    event.preventDefault();
  }, []);

  return (
    <Drawer.NestedRoot
      open={effectiveOpen}
      onOpenChange={onOpenChange}
      onAnimationEnd={onAnimationEnd}
      direction="bottom"
      shouldScaleBackground={false}
      container={container ?? undefined}
    >
      <Drawer.Portal>
        <Drawer.Overlay className={overlayClass} />
        <Drawer.Content className={sheetClassName} aria-describedby={undefined} onMouseDown={handleSheetMouseDown}>
          <Drawer.Title className={visuallyHiddenClass}>{item.name}</Drawer.Title>
          <div className={handleAreaClass}>
            <Drawer.Handle />
          </div>
          <ArgsPane
            item={item}
            params={item.params ?? []}
            minWidth={0}
            onCancel={() => onOpenChange(false)}
            onSubmit={(list, map) => {
              item.onSubmit?.(list, map);
              closeAll();
            }}
          />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.NestedRoot>
  );
};
