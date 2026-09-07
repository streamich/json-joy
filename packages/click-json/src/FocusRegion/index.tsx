import {rule, theme} from 'nano-theme';
import * as React from 'react';
import {useT} from 'use-t';
import {CancelAction} from '../buttons/Action/CancelAction';
import {EditAction} from '../buttons/Action/EditAction';
import * as css from '../css';

const hoverableClass = rule({
  d: 'inline-block',
  pos: 'relative',
  va: 'top',
  bxz: 'border-box',
  pd: '3px',
  bdrad: '4px',
  trs: 'background-color .3s ease-out',
});

const hoverableCompactClass = rule({
  pd: '1px 3px',
});

const hoveredClass = rule({
  bgc: theme.blue(0.1),
});

const hoveredNegativeClass = rule({
  bgc: theme.red(0.1),
});

const hoveredDangerClass = rule({
  bgc: theme.red(0.08),
});

const activeClass = rule({
  out: `1px dotted ${css.blue}`,
});

const activeNegativeClass = rule({
  out: `1px dotted ${css.negative}`,
});

const asideClass = rule({
  d: 'inline-block',
  pos: 'absolute',
  top: '-1px',
  l: 'calc(100% + 0.5em)',
});

const toolbarClass = rule({
  d: 'inline-block',
  pos: 'absolute',
  top: '-11px',
  l: 'calc(100% - 24px)',
  z: 3,
});

export interface FocusRegionProps {
  focused?: boolean;
  pointed?: boolean;
  compact?: boolean;
  aside?: React.ReactNode;
  toolbar?: React.ReactNode;
  toolbarStyle?: React.CSSProperties;
  negative?: boolean;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler;
  onDoubleClick?: React.MouseEventHandler;
  onMouseMove?: React.MouseEventHandler;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
  onDelete?: React.MouseEventHandler;
  onEdit?: React.MouseEventHandler;
}

export const FocusRegion: React.FC<FocusRegionProps> = (props) => {
  const {
    focused,
    pointed,
    compact,
    aside,
    toolbar,
    toolbarStyle,
    negative,
    children,
    onClick,
    onDoubleClick,
    onMouseMove,
    onMouseEnter,
    onMouseLeave,
    onDelete,
    onEdit,
  } = props;
  const [t] = useT();
  const [deleteHovered, setDeleteHovered] = React.useState(false);

  const deleteButton = onDelete ? (
    <CancelAction
      tooltip={t('Delete')}
      onClick={onDelete}
      onMouseEnter={() => setDeleteHovered(true)}
      onMouseOver={() => setDeleteHovered(true)}
      onMouseLeave={() => setDeleteHovered(false)}
    />
  ) : undefined;

  const className =
    hoverableClass +
    (compact ? hoverableCompactClass : '') +
    (pointed ? (negative ? hoveredNegativeClass : hoveredClass) : '') +
    (deleteHovered ? hoveredDangerClass : '') +
    (focused ? (negative ? activeNegativeClass : activeClass) : '');

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handling is managed at the FocusProvider level
    <span
      className={className}
      style={{
        outline: deleteHovered ? `1px dotted ${css.negative}` : undefined,
      }}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {children}
      {deleteButton}
      {!!focused && onEdit && (
        <span className={css.bottomRightActionPos}>
          <EditAction tooltip={t('Set')} onClick={onEdit} />
        </span>
      )}
      {!!aside && <span className={asideClass}>{aside}</span>}
      {!!focused && !!toolbar && (
        <span className={toolbarClass} style={toolbarStyle}>
          {toolbar}
        </span>
      )}
    </span>
  );
};
