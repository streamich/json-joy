import * as React from 'react';
import {rule} from 'nano-theme';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {ContextPane} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {MoveToViewport} from '@jsonjoy.com/ui/lib/utils/popup/MoveToViewport';
import {useAnchorPoint} from '@jsonjoy.com/ui/lib/utils/popup/context';
import * as ScrollArea from '@jsonjoy.com/ui/lib/4-card/ScrollArea';

const VIEWPORT_MARGIN = 16;
const CONTEXT_PANE_BORDER = 2;

const useElementHeight = (element: HTMLDivElement | null): number | null => {
  const [height, setHeight] = React.useState<number | null>(null);
  React.useLayoutEffect(() => {
    if (!element) {
      setHeight(null);
      return;
    }
    const updateHeight = () => {
      const nextHeight = Math.ceil(element.getBoundingClientRect().height);
      setHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [element]);
  return height;
};

const titleClass = rule({
  d: 'flex',
  jc: 'space-between',
  fz: '12px',
  lh: '1.45',
  pd: '16px',
  fls: '0 0 auto',
  bdrad: '8px 8px 0 0',
  backdropFilter: 'blur(10px)',
});

const titleGroupClass = rule({
  d: 'flex',
  fld: 'column',
});

const footerClass = rule({
  d: 'flex',
  jc: 'flex-end',
  gap: '8px',
  pd: '16px',
  fls: '0 0 auto',
  bdrad: '0 0 8px 8px',
  backdropFilter: 'blur(10px)',
});

const contentClass = rule({
  alignSelf: 'flex-start',
  w: '100%',
  bxz: 'border-box',
  d: 'flex',
  fld: 'column',
  gap: '12px',
  pd: '16px',
});

export interface EditorContextPopupProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerRight?: React.ReactNode;
  noMargin?: boolean;
  children: React.ReactNode;
  onCancel?: () => void;
  onApply?: () => void;
  applyDisabled?: boolean;
  cancelLabel?: string;
  applyLabel?: string;
  minWidth?: number;
  maxWidth?: number;
}

export const EditorContextPopup: React.FC<EditorContextPopupProps> = ({
  title,
  subtitle,
  headerRight,
  noMargin,
  children,
  onCancel,
  onApply,
  applyDisabled,
  cancelLabel = 'Cancel',
  applyLabel = 'Apply',
  minWidth,
  maxWidth,
}) => {
  const styles = useStyles();
  const anchor = useAnchorPoint();
  const [headerElement, setHeaderElement] = React.useState<HTMLDivElement | null>(null);
  const [footerElement, setFooterElement] = React.useState<HTMLDivElement | null>(null);
  const [contentElement, setContentElement] = React.useState<HTMLDivElement | null>(null);
  const headerHeight = useElementHeight(headerElement);
  const footerHeight = useElementHeight(footerElement);
  const viewportWidth = typeof window === 'object' ? window.innerWidth : 0;
  const viewportHeight = typeof window === 'object' ? window.innerHeight : 0;
  const safeMinWidth =
    minWidth !== undefined && viewportWidth
      ? Math.min(minWidth, Math.max(0, viewportWidth - VIEWPORT_MARGIN))
      : minWidth;
  const hasHeader = !!title || !!subtitle || !!headerRight;
  const hasFooter = !!onApply || !!onCancel;

  const contentHeight = useElementHeight(contentElement);

  const preventMouseDown = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  const handleCancel = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      onCancel?.();
    },
    [onCancel],
  );

  const handleApply = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      onApply?.();
    },
    [onApply],
  );

  const header = hasHeader && (
    <div
      ref={setHeaderElement}
      className={titleClass}
      style={{
        borderBottom: `1px solid ${styles.g(0, 0.06)}`,
        background: styles.g(1, styles.light ? 0.7 : 0.2),
        color: styles.g(0.24),
      }}
    >
      <div className={titleGroupClass}>
        <strong style={{display: 'block', marginBottom: 4, color: styles.g(0.12)}}>{title}</strong>
        {subtitle}
      </div>
      {!!headerRight && <div className={titleGroupClass}>{headerRight}</div>}
    </div>
  );

  const footer = hasFooter && (
    <div
      ref={setFooterElement}
      className={footerClass}
      style={{
        borderTop: `1px solid ${styles.g(0, 0.06)}`,
        background: styles.g(1, styles.light ? 0.7 : 0.2),
      }}
    >
      <BasicButton
        type="button"
        width={'auto'}
        height={32}
        // compact
        border
        onMouseDown={preventMouseDown}
        onClick={handleCancel}
      >
        {cancelLabel}
      </BasicButton>
      <BasicButton
        type="button"
        width={'auto'}
        height={32}
        // compact
        border
        disabled={applyDisabled}
        onMouseDown={preventMouseDown}
        onClick={handleApply}
      >
        {applyLabel}
      </BasicButton>
    </div>
  );

  const measuredHeaderHeight = headerHeight ?? 0;
  const measuredFooterHeight = footerHeight ?? 0;
  const safeHeight = Math.max(0, (anchor?.maxHeight() ?? Math.max(0, viewportHeight - 8)) - CONTEXT_PANE_BORDER);
  const availableContentHeight = Math.max(0, safeHeight - measuredHeaderHeight - measuredFooterHeight);
  const contentViewportHeight =
    contentHeight === null ? availableContentHeight : Math.min(contentHeight, availableContentHeight);
  const scrollHeight =
    contentHeight === null
      ? safeHeight
      : Math.min(safeHeight, contentViewportHeight + measuredHeaderHeight + measuredFooterHeight);

  const viewportMaxWidth = viewportWidth ? viewportWidth - VIEWPORT_MARGIN : undefined;
  const resolvedMaxWidth =
    maxWidth !== undefined && viewportMaxWidth !== undefined
      ? Math.min(maxWidth, viewportMaxWidth)
      : (maxWidth ?? viewportMaxWidth);

  return (
    <MoveToViewport vertical>
      <ContextPane
        minWidth={safeMinWidth}
        style={{
          maxWidth: resolvedMaxWidth,
          width: maxWidth !== undefined ? resolvedMaxWidth : undefined,
        }}
      >
        <ScrollArea.ScrollArea shadow railWidth={4} style={{height: scrollHeight}}>
          {header ? <ScrollArea.Header>{header}</ScrollArea.Header> : null}
          <ScrollArea.Viewport>
            <div
              ref={setContentElement}
              className={contentClass}
              style={{
                ...(noMargin ? {padding: 0} : undefined),
              }}
            >
              {children}
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.ScrollRail />
          {footer ? <ScrollArea.Footer>{footer}</ScrollArea.Footer> : null}
        </ScrollArea.ScrollArea>
      </ContextPane>
    </MoveToViewport>
  );
};
