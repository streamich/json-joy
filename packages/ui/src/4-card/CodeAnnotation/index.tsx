import * as React from 'react';
import {drule, theme} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {useAnchorPointHandle, anchorContext} from '../../utils/popup';
import {PositionPopup} from '../../utils/popup/PositionPopup';
import {ContextPane} from '../ContextMenu/ContextPane';

const HIDE_DELAY = 140;

/**
 * Shared hover state for a group of annotation spans that belong to the same
 * range. A single annotated range can be split across several syntax tokens;
 * the spans coordinate through this context so only one popover shows and it
 * does not flicker as the pointer moves between sibling spans.
 */
export interface AnnotationGroupContext {
  open: number | null;
  show: (id: number) => void;
  hideSoon: () => void;
  cancelHide: () => void;
}

export const annotationGroupContext = React.createContext<AnnotationGroupContext | null>(null);

/** Marks descendants so nested annotations render plainly (no double chrome). */
const nestedContext = React.createContext(false);

const RADIUS = 4;

const spanClass = drule({
  pos: 'relative',
  pad: '1px 0',
  bdb: '1px dotted',
  cur: 'help',
  trs: 'background .15s ease',
});

const paneBodyClass = drule({
  ...theme.font.sans.mid,
  fz: '13px',
  lh: '1.5em',
  pad: '10px 12px',
  maxW: '300px',
  whiteSpace: 'normal',
  a: {td: 'underline', textUnderlineOffset: '2px'},
  code: {...theme.font.mono.mid, fz: '12px'},
});

export interface CodeAnnotationProps {
  /** Rich content rendered inside the hover popover. */
  popup?: React.ReactNode;
  /** Accent color for the dotted underline. Defaults to the brand color. */
  color?: string;
  /**
   * Shared range id. Set by `<CodeCard>` when one annotation spans several
   * syntax tokens so they share a single popover. Omit for standalone use.
   */
  id?: number;
  /** Whether this span owns the popover for its range (the range start). */
  primary?: boolean;
  /** Whether this span is the end of its range (rounds the right corners). */
  last?: boolean;
  children?: React.ReactNode;
}

/**
 * Inline annotation: tints and dotted-underlines a fragment of text and shows
 * a `<ContextPane>` popover on hover. Usable on its own around any inline
 * content, or driven by `<CodeCard>` for syntax-highlighted code ranges.
 */
export const CodeAnnotation: React.FC<CodeAnnotationProps> = ({popup, color, id, primary, last, children}) => {
  const group = React.useContext(annotationGroupContext);
  const nested = React.useContext(nestedContext);
  const styles = useStyles();
  const handle = useAnchorPointHandle({center: true, gap: 8});
  const [localOpen, setLocalOpen] = React.useState(false);
  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelLocalHide = React.useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  React.useEffect(() => cancelLocalHide, [cancelLocalHide]);

  if (nested || !popup) return <>{children}</>;

  const shared = !!group && id !== undefined;
  const open = shared ? group!.open === id : localOpen;
  const ownsPopover = shared ? !!primary && open : open;
  const accent = color ?? '' + styles.brand2.fg;
  const roundLeft = shared ? !!primary : true;
  const roundRight = shared ? !!last : true;
  const radiusStyle: React.CSSProperties = {
    borderTopLeftRadius: roundLeft ? RADIUS : 0,
    borderBottomLeftRadius: roundLeft ? RADIUS : 0,
    borderTopRightRadius: roundRight ? RADIUS : 0,
    borderBottomRightRadius: roundRight ? RADIUS : 0,
  };

  const show = () => {
    if (shared) group!.show(id!);
    else {
      cancelLocalHide();
      setLocalOpen(true);
    }
  };
  const hideSoon = () => {
    if (shared) group!.hideSoon();
    else hideTimer.current = setTimeout(() => setLocalOpen(false), HIDE_DELAY);
  };
  const cancelHide = () => {
    if (shared) group!.cancelHide();
    else cancelLocalHide();
  };

  const cls = spanClass({
    bg: `color-mix(in srgb, ${accent} 18%, transparent)`,
    borderBottomColor: accent,
    '&:hover': {bg: `color-mix(in srgb, ${accent} 30%, transparent)`},
  });

  const popover = ownsPopover && (
    <PositionPopup>
      <div onMouseEnter={cancelHide} onMouseLeave={hideSoon}>
        <ContextPane lite>
          <div className={paneBodyClass({col: '' + styles.g(0.2)})}>{popup}</div>
        </ContextPane>
      </div>
    </PositionPopup>
  );

  return (
    <anchorContext.Provider value={handle}>
      <span
        ref={!shared || primary ? handle.ref : undefined}
        className={cls}
        style={radiusStyle}
        onMouseEnter={show}
        onMouseLeave={hideSoon}
      >
        <nestedContext.Provider value={true}>{children}</nestedContext.Provider>
        {popover}
      </span>
    </anchorContext.Provider>
  );
};
