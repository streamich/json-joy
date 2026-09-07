import * as React from 'react';
import {rule} from 'nano-theme';
import {fonts} from '../../styles/font';
import {useStyles} from '../../styles/context';
import {useCardCtx} from './context';
import {DENSITY} from './tokens';
import {CopyButton} from '../../2-inline-block/CopyButton';

const mono = fonts.get('mono', 'mid');

const rowClass = rule({
  d: 'flex',
  ai: 'flex-start',
  jc: 'space-between',
  w: '100%',
  minW: 0,
});

const groupClass = rule({
  d: 'flex',
  ai: 'center',
  minW: 0,
});

const startClass = rule({
  flex: '1 1 auto',
});

const endClass = rule({
  flex: '0 0 auto',
  ml: 'auto',
  pl: '10px',
});

const stackClass = rule({
  d: 'flex',
  w: '100%',
  flexDirection: 'column',
  jc: 'center',
  minW: 0,
  gap: '1px',
});

const identifierWrapClass = rule({
  d: 'flex',
  gap: '2px',
  ai: 'center',
});

const identifierClass = rule({
  ...mono,
  col: 'var(--colTxtMuted)',
  d: 'block',
  fz: '11px',
  lh: '15px',
  whiteSpace: 'nowrap',
  ov: 'hidden',
  textOverflow: 'ellipsis',
});

const identifierBtnCls = rule({
  op: 0,
  trs: 'opacity .2s',
  [`.${identifierWrapClass.trim()}:hover &`]: {
    op: 1,
  },
});

const metaClass = rule({
  ...mono,
  col: 'var(--colTxtDim)',
  d: 'inline-flex',
  ai: 'center',
  fz: '11px',
  lh: '15px',
  whiteSpace: 'nowrap',
});

const leadClass = rule({
  d: 'inline-flex',
  ai: 'center',
  flex: '0 0 auto',
});

export interface CardHeaderProps {
  // ---------------------------------------------- left: start group (leading)
  /** Selection control (checkbox/radio) for pickers. */
  selectable?: React.ReactNode;
  /** Drag handle for sortable lists. */
  dragHandle?: React.ReactNode;
  /** Leading mark — a `<TypeBadge>`, `<Avatar>`, or file icon. */
  icon?: React.ReactNode;
  /** Type/kind eyebrow (e.g. `TASK`). */
  eyebrow?: React.ReactNode;
  /** Human identifier (e.g. `ENG-241`, `@handle`) — rendered mono. */
  identifier?: string;
  /** Whether the identifier is copyable. */
  identifierCopyable?: boolean;
  /** Title, for compact/row cards that fold it into the header. */
  title?: React.ReactNode;

  // ---------------------------------------------- right: end group (trailing)
  /** Typed status, e.g. a `<StatusPill>`. */
  status?: React.ReactNode;
  /** Small end meta — a time or count (rendered mono). */
  meta?: React.ReactNode;
  /** Primary action button(s). */
  actions?: React.ReactNode;
  /** Overflow trigger (a `<BasicButtonMore>` opening a menu). */
  menu?: React.ReactNode;

  // --------------------------------------------------------------------- HTML
  className?: string;
  style?: React.CSSProperties;
}

export const CardHeader: React.FC<CardHeaderProps> = (props) => {
  const {
    selectable,
    dragHandle,
    icon,
    eyebrow,
    identifier,
    identifierCopyable,
    title,
    status,
    meta,
    actions,
    menu,
    className,
    style,
  } = props;
  const styles = useStyles();
  const {density} = useCardCtx();
  const gap = DENSITY[density].rowGap + 'px';

  const hasStack = eyebrow !== undefined || identifier !== undefined || title !== undefined;
  const hasEnd = status !== undefined || meta !== undefined || actions !== undefined || menu !== undefined;

  let left = (
    <div className={groupClass + startClass} style={{gap}}>
      {!!selectable && <span className={leadClass}>{selectable}</span>}
      {!!dragHandle && <span className={leadClass}>{dragHandle}</span>}
      {!!icon && <span className={leadClass}>{icon}</span>}
      {hasStack && (
        <span className={stackClass}>
          {!!eyebrow && eyebrow}
          {!!identifier && (
            <span className={identifierWrapClass}>
              <span className={identifierClass} style={{color: !!title ? 'var(--colTxtDim)' : void 0}}>
                {identifier}
              </span>
              {!!identifierCopyable && (
                <span style={{display: 'block', margin: '-8px 0'}}>
                  <CopyButton size={24} rounder onCopy={() => identifier} className={identifierBtnCls} />
                </span>
              )}
            </span>
          )}
        </span>
      )}
    </div>
  );

  if (title) {
    left = (
      <div>
        {left}
        {!!title && title}
      </div>
    );
  }

  const right = hasEnd && (
    <div className={groupClass + endClass} style={{gap}}>
      {!!status && status}
      {!!meta && <span className={metaClass}>{meta}</span>}
      {!!actions && actions}
      {!!menu && menu}
    </div>
  );

  return (
    <div className={rowClass + (className ? ' ' + className : '')} style={style}>
      {left}
      {right}
    </div>
  );
};
