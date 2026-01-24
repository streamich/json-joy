import * as React from 'react';
import {rule} from 'nano-theme';
import {BasicTooltip, type BasicTooltipProps} from '../BasicTooltip';
import {PositionPopup} from '../../utils/popup/PositionPopup';
import {useClickAway} from '../../hooks/useClickAway';
import type {RefPopupToggle} from '../../utils/popup/types';

const blockClass = rule({
  d: 'flex',
  pos: 'relative',
});

const buttonClass = rule({
  d: 'inline-flex',
  ta: 'inherit',
  position: 'relative',
  bg: 'none',
  pad: 0,
  mar: 0,
  out: 0,
  trs: 'box-shadow .15s',
});

const roundClass = rule({
  bdrad: '50%',
});

export interface State {
  open: boolean;
}

export interface PopupControlledProps extends React.HTMLAttributes<any> {
  open?: boolean;
  round?: boolean;
  prerender?: boolean;
  block?: boolean;
  tooltip?: BasicTooltipProps;
  fadeIn?: boolean;
  renderContext: (state: State) => React.ReactNode;
  onHeadClick?: React.MouseEventHandler;
  onClickAway?: (e: Event) => void;
  onEsc?: () => void;
  refToggle?: RefPopupToggle;
}

export const PopupControlled: React.FC<PopupControlledProps> = (props) => {
  const {
    renderContext,
    children,
    round,
    open = false,
    prerender,
    tooltip,
    fadeIn,
    block,
    onHeadClick,
    onClickAway = () => {},
    onEsc,
    refToggle,
    ...rest
  } = props;

  const clickAwayRef = useClickAway(onClickAway);

  const childrenWithTooltip = tooltip ? (
    <BasicTooltip {...tooltip} {...(open ? {renderTooltip: undefined} : null)}>
      {children}
    </BasicTooltip>
  ) : (
    children
  );

  const dropdown = (open || prerender) && (
    <PositionPopup fadeIn={fadeIn}>
      <span
        style={{
          visibility: open ? 'visible' : 'hidden',
        }}
      >
        {renderContext({open})}
      </span>
    </PositionPopup>
  );

  const toggle = (
    <span
      ref={refToggle}
      className={buttonClass + (round ? roundClass : '')}
      style={{display: block ? 'block' : undefined, width: block ? '100%' : undefined}}
      onClick={onHeadClick}
    >
      {childrenWithTooltip}
    </span>
  );

  return (
    <span
      {...rest}
      ref={clickAwayRef}
      className={props.className + '' + blockClass}
      style={{display: block ? 'block' : undefined, width: block ? '100%' : undefined, ...(props.style || {})}}
      onKeyDown={
        !onEsc
          ? void 0
          : (e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                e.preventDefault();
                onEsc();
              }
            }
      }
    >
      {toggle}
      {dropdown}
    </span>
  );
};
