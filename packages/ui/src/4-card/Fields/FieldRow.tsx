import {drule, rule} from 'nano-theme';
import * as React from 'react';
import {SetTraces, useDetailTrace, useSpacingTrace} from '../../context/traces';
import {fonts} from '../../styles';
import {useStyles} from '../../styles/context';
import type {MenuItem} from '../StructuralMenu/types';
import {FieldHint, type FieldHintProps} from './components/FieldHint';
import {OptionalBadge} from './components/OptionalBadge';
import {FieldActions, type FieldActionsPane} from './FieldActions';
import {FieldGhostButton} from './FieldGhostButton';
import {FieldManageButton} from './FieldManageButton';
import {buttonHeightFor, labelFontFor, rowHeightFor} from './metrics';

const rowClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '10px',
  w: '100%',
  bxz: 'border-box',
});

const defClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '8px',
  minWidth: 0,
});

const iconClass = drule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  flex: '0 0 auto',
  w: '16px',
  h: '16px',
});

const labelClass = drule({
  ...fonts.get('display', 'mid', 0),
  lh: '1.4em',
  ov: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
});

const valueClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '6px',
  minWidth: 0,
});

export interface FieldRowProps {
  /** Icon shown before the name in the definition cell. */
  icon?: React.ReactNode;
  /** Field name / label (definition cell). */
  title?: React.ReactNode;
  /** Append an "optional" badge after the label. */
  optional?: boolean;
  /** Restrictions pill after the label (compact text and/or warning triangle, full note in a tooltip). */
  hint?: FieldHintProps;
  /** The value-editing control (value cell). */
  children?: React.ReactNode;
  /**
   * Value-cell horizontal alignment. The label is always on the left; this
   * positions the control. `'right'` (default) is the compact context-menu
   * look; `'left'` is the property-panel look (Notion/AFFiNE).
   */
  align?: 'left' | 'right';
  /**
   * Vertical rhythm / sizing in `[0..1]`. Precedence: prop > `spacing` trace >
   * `0.5`.
   */
  spacing?: number;
  /**
   * Information density in `[0..1]`. Precedence: prop > `detail` trace > `0.5`.
   * Propagated to the value-cell control via trace.
   */
  detail?: number;
  /**
   * When set, the definition cell becomes a clickable "manage field" button
   * that opens a context menu built from these items (rename, edit type, hide,
   * duplicate, delete, …). Composes with `<ContextMenu>` rather than nesting.
   */
  manage?: () => MenuItem[];
  /** Simpler alternative to `manage`: fire a callback on definition-cell click. */
  onManageClick?: () => void;
  /** Visually mute the row (e.g. read-only / disabled fields). */
  muted?: boolean;
  /**
   * Whether the value cell stretches to fill the row (card/block) or sizes to
   * its content (context menu). Defaults to stretch when `align` is `'left'`,
   * no-stretch when `'right'`.
   */
  stretch?: boolean;
  /** Per-field action buttons, revealed on row hover. */
  actions?: MenuItem[];
  /** Pane around the action buttons. Defaults to a compact pane. */
  actionsPane?: FieldActionsPane;
  /**
   * Float the actions over the right edge (`position: absolute`) instead of
   * taking layout space. The value cell then keeps the full width to the right
   * edge, and the actions overlay it on hover.
   */
  floatActions?: boolean;
  /**
   * Paint a light full-row background on hover (Notion-style). Opt-in — off by
   * default. Independent of `actions`, which always reveal on hover.
   */
  rowHover?: boolean;
}

export const FieldRow: React.FC<FieldRowProps> = (props) => {
  const {
    icon,
    title,
    optional,
    hint,
    manage,
    onManageClick,
    muted,
    actions,
    actionsPane,
    floatActions,
    rowHover,
    children,
  } = props;
  const styles = useStyles();
  const [hover, setHover] = React.useState(false);
  const trackHover = !!rowHover || !!actions?.length;
  const spacingTrace = useSpacingTrace(0.5);
  const detailTrace = useDetailTrace(0.5);
  const spacing = props.spacing ?? spacingTrace;
  const detail = props.detail ?? detailTrace;
  const align = props.align ?? 'right';
  const stretch = props.stretch ?? align === 'left';
  const rowHeight = rowHeightFor(spacing);
  const btnHeight = buttonHeightFor(spacing);
  const labelFont = labelFontFor(spacing);

  const labelCol = muted ? styles.g(0.55) : styles.g(0.1);
  const iconCol = muted ? styles.g(0.6) : styles.g(0.45);

  const defInner = (
    <>
      {!!icon && <span className={iconClass({col: iconCol})}>{icon}</span>}
      <span className={labelClass({col: labelCol, fz: `${labelFont - 1.2}px`})}>
        {title}
        {optional && <OptionalBadge />}
        {!!hint && <FieldHint {...hint} style={{marginInlineStart: 6, ...hint.style}} />}
      </span>
    </>
  );

  let defContent: React.ReactNode = defInner;
  if (manage) {
    defContent = (
      <FieldManageButton title={typeof title === 'string' ? title : undefined} menu={manage} height={btnHeight}>
        {defInner}
      </FieldManageButton>
    );
  } else if (onManageClick) {
    defContent = (
      <FieldGhostButton onClick={onManageClick} style={{width: '100%', height: btnHeight, marginInlineStart: -6}}>
        {defInner}
      </FieldGhostButton>
    );
  }

  // When stretching, the value cell grows to fill the row (and the definition
  // cell sizes to content); when not, the value hugs its content and the
  // definition cell takes the slack, pushing the value to its edge. In the
  // right-aligned (menu) layout the key never shrinks; long values ellipsize.
  const defStyle: React.CSSProperties =
    align === 'left'
      ? {flex: '0 0 38%', alignSelf: 'stretch', minWidth: 0}
      : {flex: stretch ? '0 0 auto' : '1 0 auto', alignSelf: 'stretch'};
  // `min-width: 0` lets the value cell shrink so a long value can't push the
  // definition column out of view. Overflow stays visible so a control's or
  // chip's intentional edge overhang (negative margins, rounded hover
  // background) isn't cut — read-only chips clip *internally* (in the
  // ValueCell / ghost button), not at the cell.
  const valueStyle: React.CSSProperties =
    align === 'left'
      ? {flex: stretch ? '1 1 auto' : '0 1 auto', justifyContent: 'flex-start', alignSelf: 'stretch', minWidth: 0}
      : {flex: stretch ? '1 1 auto' : '0 1 auto', justifyContent: 'flex-end', alignSelf: 'stretch', minWidth: 0};

  const hasChildren = children !== undefined && children !== null && children !== false;

  return (
    <SetTraces value={{spacing, detail}}>
      <div
        className={rowClass}
        style={{
          position: 'relative',
          height: rowHeight,
          padding: '0 16px',
          fontSize: labelFont,
          borderRadius: 6,
          background: rowHover && hover ? styles.g(0, 0.03) : 'transparent',
          transition: 'background .12s',
        }}
        onMouseEnter={trackHover ? () => setHover(true) : undefined}
        onMouseLeave={trackHover ? () => setHover(false) : undefined}
      >
        <span className={defClass} style={defStyle}>
          {defContent}
        </span>
        {hasChildren && (
          <span className={valueClass} style={valueStyle}>
            {children}
          </span>
        )}
        {!!actions?.length &&
          (floatActions ? (
            <div
              style={{
                position: 'absolute',
                left: 'calc(100% - 16px)',
                top: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 4,
              }}
            >
              <FieldActions actions={actions} visible={hover} pane={actionsPane} />
            </div>
          ) : (
            <FieldActions actions={actions} visible={hover} pane={actionsPane} />
          ))}
      </div>
    </SetTraces>
  );
};
