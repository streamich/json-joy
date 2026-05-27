import * as React from 'react';
import {drule} from 'nano-theme';
import {useT} from 'use-t';
import {Expand as ExpandIcon} from '../../icons/interactive/Expand';
import {HslColor} from '../../styles/color/HslColor';
import BasicButton, {type BasicButtonProps} from '.';
import {BasicTooltip} from '../../4-card/BasicTooltip';

const tintClass = drule({});

export interface BasicButtonExpandProps extends BasicButtonProps {
  tooltip?: boolean | React.ReactNode;
  /** Tint color for the icon (always) and a faint hover background. Defaults to the themed grey. */
  color?: string;
}

export const BasicButtonExpand: React.FC<BasicButtonExpandProps> = ({
  tooltip,
  color,
  size = 32,
  className = '',
  ...rest
}) => {
  const [t] = useT();
  const title = t('Expand');
  const iconSize = Math.round(size * 0.6);
  // Fade the tint to a faint wash for the hover background. !important is needed
  // because BasicButton's grey hover rule lands in the stylesheet after this one.
  const hoverBg = color ? HslColor.from(color)?.pct(0, 0, 0, -0.86).toString() : void 0;
  const tintCls = hoverBg ? tintClass({'&:hover': {bg: `${hoverBg} !important`}}) : '';

  let element = (
    <BasicButton title={title} size={size} className={tintCls + className} {...rest}>
      <ExpandIcon size={iconSize} color={color} />
    </BasicButton>
  );

  if (tooltip) {
    element = <BasicTooltip renderTooltip={() => (tooltip === true ? title : tooltip)}>{element}</BasicTooltip>;
  }

  return element;
};

export default BasicButtonExpand;
