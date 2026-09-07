import * as React from 'react';
import {useT} from 'use-t';
import {ContextMenu} from '../../ContextMenu/ContextMenu';
import {BasicButton} from '../../../2-inline-block/BasicButton';
import {Popup} from '../../Popup';
import {Sidetip} from '../../../1-inline/Sidetip';
import {useStyles} from '../../../styles/context';
import type {ParamBtn} from '../../StructuralMenu/types';

export interface ArgBtnProps {
  param: ParamBtn;
}

const tintIcon = (icon: React.ReactNode, color: string): React.ReactNode => {
  if (!React.isValidElement(icon)) return icon;
  const el = icon as React.ReactElement<{style?: React.CSSProperties}>;
  return React.cloneElement(el, {
    style: {color, ...(el.props.style ?? {})},
  });
};

/**
 * Value-only action-button control. Renders a small `<BasicButton>` that fires
 * `param.onClick`. The definition cell (label) is rendered by `FieldRow`.
 */
export const ArgBtn: React.FC<ArgBtnProps> = ({param}) => {
  const [t] = useT();
  const styles = useStyles();
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

  return <span style={{display: 'inline-flex', alignItems: 'center', margin: '-5px -8px -5px 0'}}>{trigger}</span>;
};
