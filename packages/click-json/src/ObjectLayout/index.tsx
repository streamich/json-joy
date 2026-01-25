import * as React from 'react';
import {useTheme} from 'nano-theme';
import * as css from '../css';
import {useStyles} from '../context/style';

export interface ObjectLayoutProps {
  property?: React.ReactNode;
  children?: React.ReactNode;
  collapsedView?: React.ReactNode;
  header?: React.ReactNode;
  collapsed?: boolean;
  comma?: boolean;
  brackets?: [opening: string, closing: string];
  manageCollapse?: boolean;
  onClick?: React.MouseEventHandler;
  onCollapserClick?: React.MouseEventHandler;
  onCollapsedClick?: React.MouseEventHandler;
  onBracketClick?: () => void;
}

export const ObjectLayout: React.FC<ObjectLayoutProps> = ({
  property,
  collapsedView,
  header,
  collapsed,
  comma,
  brackets = ['{', '}'],
  children,
  onClick,
  onCollapserClick,
  onCollapsedClick,
  onBracketClick,
}) => {
  const [brackedHovered, setBracketHovered] = React.useState(false);
  const theme = useTheme();
  const {noCollapseToggles} = useStyles();

  const onBracketMouseEnter = () => {
    setBracketHovered(true);
  };

  const onBracketMouseLeave = () => {
    setBracketHovered(false);
  };

  const bracketColor = theme.g(0.3);

  collapsedView = (
    <span className={css.collapsed} style={{display: !collapsed ? 'none' : undefined}} onClick={onCollapsedClick}>
      <span style={{color: css.blue}}>{brackets[0]}</span>
      {collapsedView}
      <span style={{color: css.blue}}>{brackets[1]}</span>
    </span>
  );

  const bracket1 = (
    <span>
      {property}
      <span
        className={css.bracket + (brackedHovered ? css.bracketHovered : '')}
        style={{display: collapsed ? 'none' : undefined, color: bracketColor}}
        onMouseEnter={onBracketMouseEnter}
        onMouseLeave={onBracketMouseLeave}
        onClick={onBracketClick}
      >
        {brackets[0]}
        {!!header && (
          <span style={{display: 'inline-block', position: 'absolute', top: '-0.27em', left: '1em'}}>{header}</span>
        )}
      </span>
    </span>
  );

  return (
    <span className={css.object} onClick={onClick}>
      {!noCollapseToggles && (
        <span className={css.collapser} style={{color: theme.g(0.6)}} onClick={onCollapserClick}>
          {collapsed ? '+' : '—'}
        </span>
      )}
      {bracket1}
      {collapsedView}
      <span className={css.list} style={{display: collapsed ? 'none' : undefined}}>
        {children}
      </span>
      <span
        className={css.bracket + (brackedHovered ? css.bracketHovered : '')}
        style={{display: collapsed ? 'none' : undefined, color: bracketColor}}
        onMouseEnter={onBracketMouseEnter}
        onMouseLeave={onBracketMouseLeave}
        onClick={onBracketClick}
      >
        {brackets[1]}
      </span>
      {!!comma && ','}
    </span>
  );
};
