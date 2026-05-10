import * as React from 'react';
import {lightTheme, rule, drule} from 'nano-theme';
import {Link} from '../../1-inline/Link';
import {SpinnerCircle} from '../../2-inline-block/SpinnerCircle';
import {useStyles} from '../../styles/context';
import {Ripple} from '../../misc/Ripple';
import {isTouch} from '../../utils/environment';

const rowClass = drule({
  d: 'flex',
  ai: 'center',
  gap: '4px',
  w: '100%',
  minWidth: 0,
  bxz: 'border-box',
  pd: '4px',
  bdrad: '14px',
  us: 'none',
  cur: 'default',
  trs: 'background .16s ease, box-shadow .16s ease, opacity .16s ease',
});

const surfaceClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '12px',
  flex: '1 1 auto',
  minWidth: 0,
  bxz: 'border-box',
  pd: '10px 6px 10px 12px',
  mar: 0,
  bd: 0,
  bg: 'none',
  td: 'none',
  ta: 'left',
  bdrad: '10px',
  appearance: 'none',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  col: 'inherit',
  cur: 'inherit',
  trs: 'padding .2s ease',
});

const surfaceSmallClass = rule({
  pd: '0px 6px 0px 12px',
});

const metadataWrapperClass = rule({
  d: 'grid',
  gridTemplateRows: '1fr',
  op: 1,
  trs: 'grid-template-rows .2s ease, opacity .2s ease',
});

const metadataWrapperSmallClass = rule({
  gridTemplateRows: '0fr',
  op: 0,
});

const metadataInnerClass = rule({
  minHeight: 0,
  ov: 'hidden',
});

const iconClass = drule({
  d: 'flex',
  ai: 'center',
  jc: 'center',
  flex: '0 0 auto',
  bdrad: '10px',
});

const contentClass = rule({
  d: 'flex',
  fld: 'column',
  justifyContent: 'center',
  flex: '1 1 auto',
  minWidth: 0,
});

const titleClass = drule({
  ...lightTheme.font.ui1.mid,
  d: 'block',
  minWidth: 0,
  ov: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fz: '15px',
  lh: '20px',
});

const metadataClass = drule({
  ...lightTheme.font.ui1.mid,
  d: 'block',
  minWidth: 0,
  ov: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fz: '12px',
  lh: '16px',
  mrt: '2px',
});

const titleSelector = 'jjFileListItemTitle';
const rowSelector = 'jjFileListItemRow';

const actionsClass = rule({
  d: 'flex',
  ai: 'center',
  gap: '4px',
  flex: '0 0 auto',
  pd: '0 4px 0 0',
  op: 0,
  trs: 'opacity .16s ease',
  [`.${rowSelector}:hover &`]: {
    op: 1,
  },
});

const rowMutedClass = rule({
  [`.${titleSelector}`]: {
    op: 0.7,
  },
  [`&:hover .${titleSelector}`]: {
    op: 1,
  },
});

export interface FileListItemProps extends Omit<React.AllHTMLAttributes<any>, 'children' | 'title'> {
  title: React.ReactNode;
  metadata?: React.ReactNode;
  icon?: React.ReactNode;
  iconHover?: React.ReactNode;
  actions?: React.ReactNode;
  to?: string;
  selected?: boolean;
  disabled?: boolean;
  loading?: boolean;
  external?: boolean;
  spacious?: boolean;
  small?: boolean;
  muted?: boolean;
  fill?: boolean;
}

export const FileListItem: React.FC<FileListItemProps> = ({
  title,
  metadata,
  icon,
  iconHover,
  actions,
  to,
  selected,
  disabled,
  loading,
  className = '',
  style,
  type,
  external,
  spacious,
  small,
  muted,
  fill,
  ...rest
}) => {
  const styles = useStyles();
  const isDisabled = !!disabled || !!loading;
  const [hovered, setHovered] = React.useState(false);
  const iconNode = loading ? <SpinnerCircle color={styles.g(0.45)} /> : hovered ? iconHover : icon;

  const selectedBg = selected
    ? styles.col.get('neutral', 'bg-2')
    : fill
      ? styles.col.get('neutral', 'bg-1')
      : 'transparent';
  const hoverBg = selected ? styles.col.accent(0, 'el-1') : styles.g(0, 0.04);

  const rowDynamic = rowClass({
    bg: selectedBg,
    '&:hover': isDisabled
      ? undefined
      : {
          bg: hoverBg,
        },
  });

  const iconDynamic = iconClass({
    col: selected ? styles.col.accent(0, 'solid-1') : isDisabled ? styles.g(0.55) : styles.g(0.45),
    bg: styles.g(0, 0.03),
    w: spacious ? '48px' : '36px',
    h: spacious ? '48px' : '36px',
  });

  const titleDynamic = titleClass({col: isDisabled ? styles.g(0.45) : styles.g(0.1)});
  const metadataDynamic = metadataClass({col: isDisabled ? styles.g(0.56) : styles.g(0.42)});

  const content = (
    <>
      {!!iconNode && <span className={iconDynamic}>{iconNode}</span>}
      <span className={contentClass}>
        <span className={titleSelector + ' ' + titleDynamic}>{title}</span>
        {metadata !== undefined && metadata !== null && metadata !== false && (
          <span className={metadataWrapperClass + (small ? metadataWrapperSmallClass : '')}>
            <span className={metadataInnerClass}>
              <span className={metadataDynamic}>{metadata}</span>
            </span>
          </span>
        )}
      </span>
    </>
  );

  const interactiveProps: any = {
    ...rest,
    className: surfaceClass + (small ? surfaceSmallClass : ''),
    'aria-busy': loading || undefined,
    'aria-disabled': isDisabled || undefined,
  };

  let surface: React.ReactNode;
  let clickable = false;

  if (to && !isDisabled) {
    clickable = true;
    surface = (
      <Link {...interactiveProps} a to={to} external={external}>
        {content}
      </Link>
    );
  } else if (rest.onClick && !isDisabled) {
    clickable = true;
    surface = (
      <button {...interactiveProps} type={type || 'button'} disabled={isDisabled}>
        {content}
      </button>
    );
  } else {
    surface = <div {...interactiveProps}>{content}</div>;
  }

  const rowStyle: React.CSSProperties = {...style, opacity: isDisabled ? 0.68 : undefined};

  if (spacious) {
    rowStyle.paddingTop = 12;
    rowStyle.paddingBottom = 12;
  }

  const optionsStyle: React.CSSProperties = {};
  if (isTouch) {
    optionsStyle.opacity = 1;
  }
  if (isDisabled) {
    optionsStyle.pointerEvents = 'none';
    optionsStyle.opacity = 0.6;
  }

  surface = (
    <div
      className={className + ' ' + rowSelector + ' ' + rowDynamic + (muted ? ' ' + rowMutedClass : '')}
      style={rowStyle}
      onMouseEnter={iconHover ? () => setHovered(true) : void 0}
      onMouseLeave={iconHover ? () => setHovered(false) : void 0}
    >
      {surface}
      {!!actions && (
        <span className={actionsClass} style={optionsStyle}>
          {actions}
        </span>
      )}
    </div>
  );

  if (clickable) {
    surface = <Ripple>{surface}</Ripple>;
  }

  return surface;
};

export default FileListItem;
