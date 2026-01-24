import * as React from 'react';
import {useT} from 'use-t';
import {rule, lightTheme, useTheme, ZINDEX} from 'nano-theme';
import {Modal as BaseModal} from 'libreact/lib/Modal';
import {BasicButtonClose} from '../../2-inline-block/BasicButton/BasicButtonClose';

const theme = lightTheme;

const {useCallback, useEffect} = React;

const className = rule({
  pos: 'relative',
  minW: '280px',
  minH: '80px',
  maxH: '100vh',
  bxz: 'border-box',
  fz: '14px',
  ov: 'hidden',
  animation: 'fadeInScaleIn .15s',
  overflowY: 'auto',
});

const bordersClass = rule({
  boxShadow: '0 0 3px rgba(0,0,0,.1), 0 2px 6px rgba(0,0,0,.05), 0 5px 20px rgba(0,0,0,.02)',
  bdrad: '4px',
  '&:hover': {
    out: '1px solid rgba(0,0,0,.08)',
  },
});

const bordersContrastClass = rule({
  boxShadow:
    '0 0 3px rgba(0,0,0,.1), 0 2px 6px rgba(0,0,0,.05), 0 5px 20px rgba(0,0,0,.02), 0 0 33px rgba(0,0,0,.04), 0 20px 44px rgba(0,0,0,.05)',
  bdrad: '4px',
});

const classNameNoBg = rule({
  bg: 'transparent',
});

const classNameTitle = rule({
  ...theme.font.ui3.lite,
  pos: 'absolute',
  fz: theme.fontSize(-1) + 'px',
  top: theme.space(1) + 'px',
  left: theme.space(1) + 'px',
  userSelect: 'none',
});

const classNameClose = rule({
  pos: 'absolute',
  z: 3,
  top: theme.space(0) + 'px',
  right: theme.space(0) + 'px',
  pd: 0,
  mr: 0,
  bd: 0,
  out: 0,
  bg: 'transparent',
});

const classNameContent = rule({
  pos: 'relative',
  z: 2,
  pd: `${theme.space(2) + theme.space(1)}px ${theme.space(1)}px  ${theme.space(2)}px`,
});

export interface ModalProps {
  title?: React.ReactNode;
  noAnimation?: boolean;
  raise?: boolean;
  contrast?: boolean;
  onEsc?: React.KeyboardEventHandler<any>;
  onOutsideClick?: React.MouseEventHandler<any>;
  onCloseClick?: React.MouseEventHandler<any>;
  footer?: React.ReactElement<any>;
  noBorders?: boolean;
  noBackground?: boolean;
  noPadding?: boolean;
  dontLockFocus?: boolean;
  color?: string;
  rounder?: boolean;
  children?: React.ReactNode;
}

const modalGlobalClassName = '__nice_ui_modal';
const addBodyClass = () => document.body.classList.add(modalGlobalClassName);
const removeBodyClass = () => document.body.classList.remove(modalGlobalClassName);

export const Modal: React.FC<ModalProps> = ({
  noAnimation,
  title,
  raise,
  contrast,
  noBorders,
  noBackground,
  noPadding,
  dontLockFocus = false,
  onEsc,
  onOutsideClick,
  onCloseClick,
  color,
  rounder,
  children,
}) => {
  const theme = useTheme();
  const [t] = useT();
  const onElement = useCallback((el: HTMLElement) => {
    el.style.zIndex = '' + ZINDEX.MODAL;
  }, []);
  useEffect(() => {
    addBodyClass();
    return removeBodyClass;
  }, []);

  let titleElement: React.ReactElement<any> | null = null;

  if (title) {
    titleElement = (
      <div
        className={classNameTitle}
        style={{
          color: theme.g(0.1, 0.6),
        }}
      >
        {title}
      </div>
    );
  }

  const contentClasses =
    (noAnimation ? '' : 'fadeInScale') +
    className +
    (noBorders ? '' : contrast ? bordersContrastClass : bordersClass) +
    (noBackground ? classNameNoBg : '');

  const style: React.CSSProperties = {
    background: noBackground ? 'transparent' : theme.bg,
    boxShadow: theme.isLight ? undefined : `0 0 0 1px ${theme.g(0.1, 0.16)}`,
  };

  if (rounder) {
    style.borderRadius = '12px';
  }

  if (noAnimation) {
    style.animation = 'none';
  }

  let content = (
    <div className={contentClasses} style={style}>
      {titleElement}
      {noPadding ? children : <div className={classNameContent}>{children}</div>}
      {onCloseClick && (
        <div className={classNameClose}>
          <BasicButtonClose onClick={onCloseClick} tabIndex={-1} title={`${t('Close')} (Esc)`} size={32} />
        </div>
      )}
    </div>
  );

  if (raise) {
    content = (
      <div
        style={{
          height: '100vh',
          padding: '100px 0 0',
        }}
      >
        {content}
      </div>
    );
  }

  const BaseModalUntyped = BaseModal as any;

  return (
    <BaseModalUntyped
      dontLockFocus={dontLockFocus}
      onElement={onElement}
      onClick={onOutsideClick as any}
      onEsc={onEsc as any}
      color={color ? color : theme.isLight ? (contrast ? 'rgba(0,0,64,.4)' : lightTheme.g(0, 0.04)) : 'rgba(0,0,0,.4)'}
    >
      {content}
    </BaseModalUntyped>
  );
};
