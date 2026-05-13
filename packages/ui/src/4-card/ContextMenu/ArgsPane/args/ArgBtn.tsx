import * as React from 'react';
import {useT} from 'use-t';
import {ContextItem} from '../../ContextItem';
import {ContextMenu} from '../../ContextMenu';
import {BasicButton} from '../../../../2-inline-block/BasicButton';
import {Popup} from '../../../Popup';
import {Sidetip} from '../../../../1-inline/Sidetip';
import {useStyles} from '../../../../styles/context';
import {OptionalBadge} from './OptionalBadge';
import type {ParamBtn} from '../../../StructuralMenu/types';

export interface ArgBtnProps {
  param: ParamBtn;
  compact?: boolean;
}

const tintIcon = (icon: React.ReactNode, color: string): React.ReactNode => {
  if (!React.isValidElement(icon)) return icon;
  const el = icon as React.ReactElement<{style?: React.CSSProperties}>;
  return React.cloneElement(el, {
    style: {color, ...(el.props.style ?? {})},
  });
};

/**
 * Action-button arg. Renders a small `<BasicButton>` on the row's right side
 * that fires `param.onClick` when pressed. Has no value, doesn't appear in
 * the args map.
 */
export const ArgBtn: React.FC<ArgBtnProps> = ({param}) => {
  const [t] = useT();
  const styles = useStyles();
  const label = param.display?.() ?? t(param.name ?? param.id ?? '');
  const buttonLabel = param.buttonLabel ?? param.name ?? param.id ?? '';
  const danger = !!param.danger;
  const errorColor = styles.col.get('error');

  const rawIcon = param.buttonIcon?.();
  const icon = danger ? tintIcon(rawIcon, errorColor) : rawIcon;
  const buttonFace = (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        color: danger ? errorColor : undefined,
      }}
    >
      {icon}
      <span>{t(buttonLabel)}</span>
    </span>
  );

  const button = param.confirm ? (
    <BasicButton width="auto" height={28} fill>
      {buttonFace}
    </BasicButton>
  ) : (
    <BasicButton
      width="auto"
      height={28}
      fill
      onClick={(e) => {
        e.stopPropagation();
        param.onClick?.();
      }}
    >
      {buttonFace}
    </BasicButton>
  );

  const trigger = param.confirm ? (
    <Popup
      renderContext={({onEsc}) => (
        <ContextMenu
          inset
          onEsc={onEsc}
          menu={{
            name: param.confirmLabel ?? t('Are you sure?'),
            minWidth: 240,
            children: [
              {name: t('Cancel'), onSelect: () => {}},
              {
                name: param.confirmActionLabel ?? t(buttonLabel),
                onSelect: () => param.onClick?.(),
                danger,
                right: () => <Sidetip small>{t('Confirm')}</Sidetip>,
              },
            ],
          }}
        />
      )}
    >
      {button}
    </Popup>
  ) : (
    button
  );

  return (
    <ContextItem
      icon={param.icon?.()}
      control
      inset
      style={{paddingTop: 6, paddingBottom: 6}}
      right={
        <span style={{display: 'inline-flex', alignItems: 'center', margin: '-5px -8px -5px 0'}}>
          {trigger}
        </span>
      }
    >
      <span style={danger ? {color: errorColor} : undefined}>
        {label}
        {param.optional && <OptionalBadge />}
      </span>
    </ContextItem>
  );
};
